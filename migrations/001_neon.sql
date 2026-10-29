-- Additive PostgreSQL schema. Applied once by db:migrate, never by app requests.
CREATE TABLE transactions (
 id TEXT PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('income','expense')),
 amount BIGINT NOT NULL CHECK(amount > 0 AND amount <= 1000000000000), category TEXT NOT NULL,
 description TEXT, "transactionDate" TEXT NOT NULL CHECK("transactionDate" ~ '^\d{4}-\d{2}-\d{2}$'),
 "createdAt" TEXT NOT NULL, "updatedAt" TEXT NOT NULL
);
CREATE INDEX transactions_date ON transactions("transactionDate","createdAt");
CREATE TABLE sessions (token TEXT PRIMARY KEY, expires BIGINT NOT NULL, credential TEXT NOT NULL);
CREATE TABLE login_attempts (id INTEGER PRIMARY KEY CHECK(id=1), failures INTEGER NOT NULL, reset BIGINT NOT NULL);
CREATE TABLE expense_types (id TEXT PRIMARY KEY, name TEXT NOT NULL, "normalizedName" TEXT NOT NULL UNIQUE, category TEXT NOT NULL, sort_order BIGSERIAL NOT NULL);
CREATE TABLE expense_batches (id TEXT PRIMARY KEY, note TEXT NOT NULL, "transactionDate" TEXT NOT NULL, fingerprint TEXT NOT NULL, "createdAt" TEXT NOT NULL);
CREATE TABLE expense_items ("transactionId" TEXT PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE, "typeId" TEXT NOT NULL REFERENCES expense_types(id), "batchId" TEXT NOT NULL REFERENCES expense_batches(id));
CREATE INDEX expense_items_batch ON expense_items("batchId");
CREATE TABLE sqlite_imports (digest TEXT PRIMARY KEY, imported_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- A unique date-claim table permits preservation of legacy duplicate sales.
-- New writers must claim the date using a real unique constraint, not a racy SELECT.
CREATE TABLE daily_sales_dates ("transactionDate" TEXT PRIMARY KEY);
CREATE FUNCTION claim_daily_sales_date() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='UPDATE' AND OLD.type='income' AND OLD.category='sales' THEN
  PERFORM 1 FROM daily_sales_dates WHERE "transactionDate"=OLD."transactionDate" FOR UPDATE;
 END IF;
 IF NEW.type='income' AND NEW.category='sales' THEN
  IF TG_OP='UPDATE' THEN
   IF OLD.type=NEW.type AND OLD.category=NEW.category AND OLD."transactionDate"=NEW."transactionDate" THEN RETURN NEW; END IF;
  END IF;
  INSERT INTO daily_sales_dates VALUES(NEW."transactionDate") ON CONFLICT DO NOTHING;
  IF NOT FOUND AND current_setting('altomebay.sqlite_import',true) IS DISTINCT FROM 'on' THEN
   RAISE EXCEPTION USING ERRCODE='23505', CONSTRAINT='daily_sales_duplicate', MESSAGE='daily_sales_duplicate';
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE FUNCTION release_daily_sales_date() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.type='income' AND OLD.category='sales' THEN
  DELETE FROM daily_sales_dates d WHERE d."transactionDate"=OLD."transactionDate"
  AND NOT EXISTS(SELECT 1 FROM transactions t WHERE t.type='income' AND t.category='sales' AND t."transactionDate"=OLD."transactionDate");
 END IF;
 RETURN NULL;
END;
$$;
CREATE TRIGGER daily_sales_insert BEFORE INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION claim_daily_sales_date();
CREATE TRIGGER daily_sales_update BEFORE UPDATE OF type,category,"transactionDate" ON transactions FOR EACH ROW EXECUTE FUNCTION claim_daily_sales_date();
CREATE TRIGGER daily_sales_release_delete AFTER DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION release_daily_sales_date();
CREATE TRIGGER daily_sales_release_update AFTER UPDATE OF type,category,"transactionDate" ON transactions FOR EACH ROW EXECUTE FUNCTION release_daily_sales_date();

INSERT INTO expense_types(id,name,"normalizedName",category) VALUES
 ('cigarettes','Belanja Rokok','belanja rokok','stock_purchase'),
 ('aice','Belanja Es Krim AICE','belanja es krim aice','stock_purchase'),
 ('snacks','Belanja Jajan','belanja jajan','stock_purchase'),
 ('equipment','Belanja Perabot','belanja perabot','operational'),
 ('other','Belanja Lainnya','belanja lainnya','other_expense');

CREATE FUNCTION lock_deleted_sales_date() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.type='income' AND OLD.category='sales' THEN
  PERFORM 1 FROM daily_sales_dates WHERE "transactionDate"=OLD."transactionDate" FOR UPDATE;
 END IF;
 RETURN OLD;
END;
$$;
CREATE TRIGGER daily_sales_lock_delete BEFORE DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION lock_deleted_sales_date();
