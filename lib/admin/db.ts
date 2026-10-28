import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
let instance: DatabaseSync | undefined;
export function db() {
 if (instance) return instance;
 const path = resolve(/* turbopackIgnore: true */ process.env.ADMIN_DATABASE_PATH || "data/admin.sqlite");
 mkdirSync(dirname(path), {recursive:true,mode:0o700});
 instance = new DatabaseSync(path);
 instance.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS transactions (
 id TEXT PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('income','expense')),
 amount INTEGER NOT NULL CHECK(amount > 0 AND amount <= 1000000000000), category TEXT NOT NULL,
 description TEXT, transactionDate TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS transactions_date ON transactions(transactionDate,createdAt);
 CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL, credential TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY CHECK(id=1), failures INTEGER NOT NULL, reset INTEGER NOT NULL);`);
 // Triggers protect new writes atomically without deleting or relabeling legacy duplicates.
 // Existing duplicate groups remain editable when their date/type/category is unchanged.
 instance.exec(`
 CREATE TRIGGER IF NOT EXISTS daily_sales_insert BEFORE INSERT ON transactions
 WHEN NEW.type='income' AND NEW.category='sales' AND EXISTS (
 SELECT 1 FROM transactions WHERE type='income' AND category='sales' AND transactionDate=NEW.transactionDate)
 BEGIN SELECT RAISE(ABORT, 'daily_sales_duplicate'); END;
 CREATE TRIGGER IF NOT EXISTS daily_sales_update BEFORE UPDATE OF type,category,transactionDate ON transactions
 WHEN NEW.type='income' AND NEW.category='sales'
 AND (OLD.type<>NEW.type OR OLD.category<>NEW.category OR OLD.transactionDate<>NEW.transactionDate)
 AND EXISTS (SELECT 1 FROM transactions WHERE type='income' AND category='sales' AND transactionDate=NEW.transactionDate AND id<>NEW.id)
 BEGIN SELECT RAISE(ABORT, 'daily_sales_duplicate'); END;
 `);
 return instance;
}
