# Keuangan Harian Admin

## Architecture and files

- `app/admin/page.tsx`: server authentication gate, shared brand header, metadata.
- `app/admin/login.tsx`: password form, pending and error feedback.
- `app/admin/dashboard.tsx`: date navigation, summary, responsive transaction list, accessible native dialogs, shared add/edit form.
- `app/admin/actions.ts`: authenticated Server Actions for login/logout and transaction CRUD. Next.js checks Server Action origins; sessions use Strict, HttpOnly cookies.
- `app/admin/admin.css`: isolated admin styles using existing brand, typography, spacing, radius and button tokens.
- `lib/cashflow.ts`: category definitions, types, Rupiah/Jakarta dates, server validation and summary.
- `lib/admin/auth.ts`: scrypt password verification, hashed random sessions with eight-hour expiry, logout and password-change revocation, persistent login throttle.
- `lib/admin/db.ts`: SQLite schema, indexes, prepared statements, WAL and busy timeout.
- `types/sqlite.d.ts`: minimal declarations for native SQLite because this project uses Node 20 type definitions.
- `scripts/admin-password.mjs`: password hash generation from stdin.
- `tests/cashflow.test.mjs`: business rules and server CRUD/auth/database tests in a disposable database.
- `next.config.ts`: static export removed to enable server functionality. Public page source and design are unchanged.
- `.gitignore`: ignores runtime database directory.

## Local setup

Use Node.js 22.13+ (or newer supported LTS) with `node:sqlite`. The calendar uses only `react-day-picker` and `@radix-ui/react-popover`; no full UI library is installed.

Generate a hash using `node scripts/admin-password.mjs`, supply a password of at least 12 characters through stdin, then end input (Ctrl-D on macOS/Linux). The terminal may echo input; run this privately. Save the resulting `ADMIN_PASSWORD_HASH=salt:hash` line in `.env.local`. Do not commit the password or hash.

Optional environment variable: `ADMIN_DATABASE_PATH=/absolute/persistent/path/admin.sqlite`. Default: `data/admin.sqlite`, outside public assets and ignored by Git. Keep the directory private. Back up via SQLite's online backup tooling or stop the app before copying the database and its WAL files.

Run `npm run dev` and visit `/admin`. Without a valid password hash the admin remains locked, with a setup message. Use the generated password to log in. No default password, seeded data, browser persistence, or public transaction API exists.

For production: `npm run build`, then `npm start` behind HTTPS. Production cookies require HTTPS. Static `out/` deployment is no longer supported. Public routes remain eligible for static prerendering.

## Hosting trade-off

This MVP requires one long-running Node server and a persistent local volume. SQLite is not suitable for ephemeral Vercel function disks or multiple replicas. Before Vercel deployment, replace the database adapter with a managed SQL service and retain server-side session and transaction checks. This is a deployment prerequisite, not an optional persistence fallback.

Password rotation invalidates existing sessions. Five failed attempts lock all login attempts for 15 minutes; this simple single-admin throttle can temporarily block the owner, so add trusted reverse-proxy throttling or managed authentication as traffic grows. Do not trust arbitrary forwarded IP headers. Use HTTPS and protect access to the environment and database volume.

## Verification

Run:

```
node --test tests/cashflow.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Manual acceptance: open `/admin` logged out; log in; add Penjualan Rp150.000 and Operasional Rp25.000 on the same date; expect Rp125.000 difference. Edit amount/type/category/date, cancel and confirm deletion, choose an earlier date, reload/restart the server to confirm persistence, and log out to check access protection. Check keyboard Tab/Escape in dialogs and narrow/mobile layouts at 320px and 390px. Verify the public homepage independently.

## MVP boundaries

Single administrator, no accounting balance/profit statement, inventory, export, iPOS, payment or role management. Amounts are positive safe integer Rupiah up to Rp1 trillion per transaction; future dates are rejected. Transaction dates are Jakarta business dates; timestamps are UTC. No mock data is used in the dashboard. A shared login does not provide per-person audit attribution. Conflicting edits use last-write-wins; add version checks if concurrent use becomes necessary.

## Validation performed

TypeScript, ESLint, and both automated test suites passed. Final production build passed with `NODE_USE_SYSTEM_CA=1 npm run build`; earlier attempts intermittently failed while downloading the project's existing Google Fonts. Build output confirms `/` remains static and `/admin` is rendered per request.

Production-browser checks used a disposable database and temporary credentials: login, empty state, income Rp150.000, expense Rp25.000, resulting difference Rp125.000, edit to Rp30.000, database persistence across a server restart, delete confirmation and Escape cancellation, keyboard date navigation, and logout returning to the protected login. Measured no horizontal page overflow at 320, 390, and 1440 pixel viewport overrides; mobile dialog fit within the viewport. Actual deletion was tested through the automated server test, rather than performed through the browser. These checks do not constitute a formal WCAG audit.


## UI/UX refinement v1.1

### Changed files and components

- `app/admin/date-picker.tsx` (new): reusable Indonesian calendar for dashboard filters and transaction dates. Uses React DayPicker 9.14 and Radix Popover, with Monday-first weeks, Jakarta timezone, previous/next month navigation, future-day disabling, keyboard focus, collision handling and close-on-selection. The portal stays inside the native modal when invoked from a form, preserving top-layer interaction and focus restoration. Escape closes the calendar first, then the transaction dialog on a subsequent Escape.
- `lib/business-date.ts` (new): converts `YYYY-MM-DD` to/from a timezone-aware `TZDate` at noon in Asia/Jakarta, without browser-local midnight or UTC date slicing.
- `app/admin/dashboard.tsx`: replaces both native date inputs; uses existing `description` for contextual Detail Pengeluaran (required) or Keterangan (optional for income). Expense category choices are unchanged. The detail remains editable and appears in transaction history.
- `app/admin/admin.css`: admin-scoped calendar and popover styling, one-pixel focus borders and keyboard-focus background feedback, single-line brand/header controls, and radio segments that fit narrow screens. No public stylesheet is changed, and no DayPicker global stylesheet is imported.
- `lib/cashflow.ts`: server rejects blank/whitespace-only expense details on create and update; maximum remains 200 characters. There is no schema change. Existing NULL-description records remain readable; their next expense save requires a detail.
- `tests/cashflow.test.mjs`: required-detail validation, legacy records, persistence and cross-timezone calendar-date regressions, retaining CRUD/auth/summary coverage.
- `package.json` and `package-lock.json`: only direct additions are `react-day-picker` and `@radix-ui/react-popover`, the calendar/popover primitives used in the requested shadcn approach. Existing brand tokens and shared Button are reused.
- `PROJECT_CONTEXT.md` and this guide: current implementation and diagnosis.

### Evidence for the localhost issue

Before restart, the existing Next.js development server (PID 67575 on port 3000) returned HTTP 500 for `/admin`. Its response and `.next/dev/logs/next-development.log` contained:

```
Route /admin with dynamic = "error" couldn't be rendered statically because it used connection().
```

The source `next.config.ts` already omitted `output: "export"`, there was no middleware/proxy or parent route forcing static rendering, and `app/admin/page.tsx` correctly used `connection()` with server-side authentication. Restarting the same project on port 3000, without weakening the guard or changing the routing source, changed the response to HTTP 200. Browser inspection then showed the admin login heading and setup message. This demonstrates the running dev server retained the previous static-export configuration.

No `.env*` file or inherited password hash was present during the inspection. Therefore the local route is accessible, but sign-in remains intentionally unavailable until `ADMIN_PASSWORD_HASH` is set using the setup instructions above. The app renders its login/setup view at `/admin` rather than redirecting to a separate login route. Successful login and logout Server Actions redirect back to `/admin`.

The default `data/` directory did not yet exist; with no configured credential, the unauthenticated view does not initialize SQLite. No evidence of a production database permission error was found. Browser and server regression tests separately demonstrated successful SQLite initialization, write/read, and persistence using private temporary directories. Node version inspected: 26.3.0 (supports native SQLite).

After setting `.env.local`, restart `npm run dev -- --port 3000` so environment/config changes take effect. If another process holds port 3000, stop that project's old process before restarting; do not silently use port 3001 when testing the specified URL. Keep static export disabled.

### Focus-state diagnosis

Previously inputs/selects had a one-pixel border plus a separate two-pixel outline at a three-pixel offset. Buttons separately inherit a three-pixel global outline. The refinement removes the old input rule and defines a single brand border for focused admin inputs/selects/date triggers. Keyboard focus additionally changes the surface to the existing brand-soft token. Calendar buttons retain a one-pixel focus border plus underline; selected-day focus remains distinguishable. No global button focus rule is weakened. Native computed styles can retain an outline width of `medium` while `outline-style` is `none`; the rendered control has no extra outline.

### Validation and manual acceptance

Passed: `npx tsc --noEmit`, `npm run lint`, `node --test tests/cashflow.test.mjs` (3 passing tests), and `NODE_USE_SYSTEM_CA=1 npm run build`. Build output retains static `/` and dynamic `/admin`. A certificate environment flag was used only for the build command, not stored in the project.

Automated coverage includes positive integer validation, required expense details including whitespace-only input, optional income details, CRUD, summary calculations, authentication/revocation/throttle, SQLite persistence via a separate connection, reading and updating legacy NULL descriptions, timezone roundtrips in UTC/Los Angeles/Honolulu/Tokyo/Kiritimati, leap days and year boundaries.

Production-browser checks with disposable credentials/database covered:

1. Open `/admin` logged out, log in, open the filter calendar, move to the previous month and back, then choose a prior day. Check Indonesian month/day labels, Monday first, selected/today markers and disabled future dates.
2. Add an expense of Rp35.000 in Operasional without detail: native required validation blocks submission. Fill Beli kantong plastik dan lakban and save. Verify detail in history. Add income Rp150.000 with no description: verify totals Rp150.000 / Rp35.000 / Rp115.000.
3. Restart the preview server: verify persisted records. Edit the expense detail and select a new transaction day using ArrowLeft and Enter. Save and verify that filter, transaction history and summary follow the saved day. An independent SQLite connection confirmed the exact stored description and date.
4. Open a calendar inside the native transaction dialog; Escape closes just the calendar and restores its trigger. Tab reaches the date trigger from the detail input. The modal keeps its own keyboard behavior. Actual deletion remains covered by the server regression test; the confirmation dialog is unchanged.
5. At 320px and 390px viewport overrides, verify no page overflow and the complete calendar remains within the usable viewport (including scrollbar allowance). At 320px: page client/scroll widths both 305px, calendar bounds 12–292px; at 390px: widths both 375px, calendar bounds 12–362px. Verify visible focus and touch targets, then repeat at desktop width.
6. Log out: protected login view returns. On the actual development server, `/admin` responds 200 without configured credentials and shows setup instructions; authentication is still required for all data operations.

These are targeted keyboard/reflow checks, not a formal WCAG certification. No database migration, public page source, global design token, or authentication implementation was changed in v1.1.

Public-homepage browser smoke check also passed at `http://localhost:3000/`; the production preview browser reported no warning/error logs during the final flow. A dependency audit did not flag the new calendar/popover packages; it still reports advisories in existing dependencies, including Next.js. Updating those pre-existing dependencies is separate from this UI refinement.


## Environment audit: login stays disabled

The subsequent environment audit found no `.env.local` (or other `.env*` file) in the active project root. The official `@next/env` development loader reported an empty loaded-file list and no effective `ADMIN_PASSWORD_HASH`. The localhost route returned HTTP 200 with the setup message, matching the guard's safe behavior. No password or digest value was printed during inspection.

The generator and guard were tested without changing them: generated credentials verify the exact stdin password with no line ending, LF, or CRLF; the resulting assignment is accepted after the official Next loader reads it from a temporary `.env.local`. Missing, malformed, assignment-prefixed, or whitespace-suffixed values remain rejected. Next gives an inherited process variable precedence over `.env.local`, including an inherited empty value. There is no reason to weaken the strict format check, expose `NEXT_PUBLIC_ADMIN_PASSWORD_HASH`, or put credentials in `next.config.ts`.

For this workspace, save the existing private assignment in `/Users/maulanabayu/Project Dev/altomebay/.env.local` (not an unsaved editor buffer, `app/.env.local`, or `.env.local.txt`), then restart the development server. If the file was saved in another location, move/copy that existing configuration into the actual project root; do not generate a replacement password unless you intend to rotate it. Never paste the password or digest into this chat. No real credential is created by the regression tests.

Regression command: `node --test tests/admin-environment.test.mjs tests/cashflow.test.mjs`. All five tests, ESLint, and TypeScript passed. `tests/admin-environment.test.mjs` contains disposable environment/generator integration checks; it captures generated values internally and emits only test status. Authentication production code and architecture were unchanged because the audit did not identify an implementation defect.

## Financial Overview v2.0 (28 October 2026)

This iteration replaces the daily-first screen with **Ringkasan Keuangan**. The existing authentication, SQLite provider, transaction columns, public routes, font and brand tokens are retained. Existing uncommitted project work is preserved. No new dependency was added.

### Layout and component mapping

The header contains the existing identity, Admin label, Dashboard link and logout. The content order is heading/date range, three KPIs, Arus Kas chart, separate quick actions, and history. Desktop also exposes quick actions beside the heading. Mobile stacks cards and replaces the six-column semantic table with readable transaction cards.

Reference patterns reviewed: [shadcn dashboard](https://ui.shadcn.com/examples/dashboard), [dashboard blocks](https://ui.shadcn.com/blocks?category=dashboard), [Radix date picker](https://ui.shadcn.com/docs/components/radix/date-picker), and [Shadcnblocks dashboards](https://www.shadcnblocks.com/blocks/dashboard). This uses their composition patterns with the project's existing components, rather than installing a template.

| Need | Implementation / trade-off |
| --- | --- |
| Buttons and cards | Existing shared Button and admin-scoped panels; neutral borders, brand primary, no gradients in admin |
| Period calendar | Existing Radix Popover + React DayPicker in range mode, Indonesian locale and Jakarta timezone |
| Forms/dialog | Existing native modal primitive with focus restoration, Escape, initial amount focus, pending lock and dirty-close confirmation |
| Action dropdown | Existing Radix Popover with labeled Edit/Hapus buttons and separate delete confirmation |
| Table/badges | Semantic table on desktop, card list below 1024px, existing semantic badge styles |
| Chart | Small CSS grouped-bar chart; currency tooltip, keyboard arrow navigation and persistent detail text also usable on touch; avoids adding Recharts for two series |

New components are `period-filter.tsx`, `cashflow-chart.tsx`, and `transaction-form.tsx` under `app/admin`. `dashboard.tsx` coordinates loading, period state, history filtering and pagination. Admin-specific typography overrides avoid the public site's larger marketing heading sizes.

### Periods and calculations

Default **Bulan Ini** is the first day of the current Jakarta month through today. Other presets are the entire previous month and the last seven days including today. A custom calendar range is applied explicitly. `start` and `end` URL parameters survive refresh; invalid, future or reversed ranges are rejected, with an explanatory fallback to the current month on initial page load. Browser back/forward restores valid periods.

Authenticated `financialOverview(start,end)` validates dates, queries the inclusive range once, and computes KPI totals and chart buckets on the server from those same rows. Up to 90 days uses daily buckets, longer ranges monthly buckets; boundary months only include transactions inside the actual selected range. Empty days/months have zero values, never fabricated sales. The third KPI is **Selisih Periode**, explicitly not profit or actual cash balance. History type filtering only narrows history; it intentionally does not change the period's overall KPI/chart. Pagination appears only above 15 matching records. All rows are currently fetched for the period; server pagination/SQL aggregation can be introduced if volume grows.

Saving a transaction refreshes the selected period without moving the filter to the transaction date. Entry dates default to today, independently of the dashboard period. A transaction saved outside that period remains stored and can be viewed by adjusting the range.

### Distinct entry workflows

Income defaults to `sales` (**Penjualan Harian**) with amount, date, source and optional collapsed notes. An authenticated lookup checks existing daily recaps, shows their amounts, and offers **Edit rekap**. Switching to an existing record requires explicitly discarding dirty new input. `other_income` supports multiple entries on the same date. All income remains manually recorded; there is no iPOS synchronization.

Expense uses date, amount, required category and a required multiline detail up to 200 characters. Server-side trim/positive integer/date/category validation remains authoritative. Legacy empty descriptions remain readable and require a detail on their next expense save.

### Additive database protection and rollback

No transaction columns or records are rewritten. The existing `sales` category identifies daily recaps. Rather than introducing a unique index that could fail on existing duplicates, initialization adds two idempotent SQLite triggers:

- `daily_sales_insert` rejects a second income/sales record on an occupied date.
- `daily_sales_update` rejects moving/converting a record into an occupied income/sales date. Updating amount/description on legacy duplicate rows without changing their identity remains possible.

SQLite enforces the checks atomically for both server actions and direct/concurrent database writers. Errors become a user-facing instruction to edit the existing recap. Existing duplicate groups are returned by the lookup and explicitly identified in the form; they are never merged, summed into a replacement, relabeled or deleted automatically.

Before rollout, back up with SQLite online backup tooling or stop the app before copying its database/WAL files. A read-only duplicate audit is:

```sql
SELECT transactionDate, COUNT(*) AS records, SUM(amount) AS total
FROM transactions WHERE type='income' AND category='sales'
GROUP BY transactionDate HAVING COUNT(*) > 1;
```

The migration safely tolerates any audit results. Review historical duplicates manually with the owner; historical totals include every preserved record. To roll back, stop the new application, restore the previous application version, then run `DROP TRIGGER IF EXISTS daily_sales_insert; DROP TRIGGER IF EXISTS daily_sales_update;`. No data restoration is needed because this migration changes no records. Do not run the new app afterward if intending to keep the protection removed: startup recreates its triggers.

### Validation for v2

Automated tests use a disposable SQLite database seeded with pre-migration duplicate sales. Coverage includes preservation and editing of those rows, rejection of duplicate insert/update and direct SQL bypass, multiple other-income records, auth gates on both new read actions, CRUD and persistence, validation, empty summaries, inclusive cross-month ranges, daily/monthly bucket totals, leap-February and year-boundary presets, plus the existing timezone/environment regression tests.

The test commands remain `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run lint`, and `NODE_USE_SYSTEM_CA=1 npm run build`. The build needs access to the project's existing Google Fonts endpoints; a sandbox-network failure was resolved by running the build with download access. Public route `/` remains statically rendered and `/admin` dynamic.

Final browser checks used the production build on port 3100 with disposable credentials and a temporary database, never the store database. Verified: initial month-to-date empty state; manual income Rp150,000 and expense Rp25,000 producing Rp125,000 difference; required expense detail; duplicate recap amount/edit prompt; cross-month calendar range and URL persistence through refresh; database persistence after preview restart; type filtering; delete confirmation/cancellation; keyboard focus and Escape behavior; logout returning to login; public homepage smoke check. No browser warning/error logs were reported. Horizontal document width matched viewport content width at 320px, 390px and desktop; at 320px the calendar bounds were 12–292px inside the 305px content viewport. These targeted checks do not constitute a formal accessibility audit. Actual delete and conflicting-update behavior are covered by server tests. Final TypeScript, lint, six tests and production build passed.

## Multi-item expense entry v2.1 (29 October 2026)

The expense quick action opens `expense-form.tsx`: one Jakarta date, numbered items with searchable expense types and individual formatted Rupiah amounts, add/remove controls, an optional shared note, live item count/total, and one save action. At least one item remains. Empty/invalid rows block saving and can be removed; they are never silently stored. Entry is limited to 100 items and each amount retains the existing Rp1 trillion limit. The wider native dialog scrolls within the viewport; its footer remains in normal flow and does not cover inputs. Existing admin tokens, buttons, date picker and modal are reused; no dependency was added.

`expense-type-selector.tsx` supports search, keyboard arrows/Enter, Escape dismissal and explicit creation confirmation. Five reusable defaults map to the existing reporting categories: Rokok/AICE/Jajan → Belanja Stok; Perabot → Operasional; Lainnya → Pengeluaran Lainnya. A custom type requires a trimmed name of 1–60 characters and one main-category choice. The database's unique normalized-name key prevents case-insensitive duplicates; a duplicate selects the existing type without remapping it. Every read/write action authenticates the administrator. There is no type-deletion endpoint.

### Additive persistence

Startup creates three tables without rewriting the existing `transactions` table or its historical IDs, amounts, categories and descriptions:

- `expense_types`: reusable name, normalized unique name, and existing main-category key.
- `expense_batches`: stable submission ID, Jakarta date, shared note, payload fingerprint and creation timestamp. Counts/totals are calculated from surviving items, never stored as extra financial records.
- `expense_items`: one-to-one transaction link, expense type and batch references. Foreign keys restrict removal of used types and cascade only the link when an individual transaction is deleted.

`saveExpenseBatch` validates the full payload and uses `BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK` for all records and links. An invalid/missing type after earlier inserts rolls back the entire batch. Each item creates exactly one ordinary expense transaction; its description remains separate from the type and shared batch note. Authenticated reads left-join the new metadata so legacy records remain visible. KPI/chart code still aggregates ordinary individual transactions exactly once.

The client locks submission immediately and reuses one UUID on retries. A unique batch ID and SHA-256 fingerprint make an identical retry a successful no-op; reuse with different content returns an error. Batch metadata remains after all items are deleted so retrying an old request cannot recreate deleted expenses. This idempotency protects retries of the same submission; independently opening a new form intentionally creates a new submission.

Back up SQLite before rollout using the earlier backup guidance. The migration is additive and idempotent. Rolling back application code can retain all three tables: old code still reads each expense as an ordinary transaction, although the type/note details require v2.1. Do not drop the new tables after recording expenses, because doing so loses those details. No data provider migration is needed.

### History and editing limits

`expense-history.tsx` groups only records sharing an explicit batch ID. Grouping happens before pagination (15 history entries per page), so one batch cannot split across pages; the heading still counts individual financial transactions. Desktop tables and mobile cards show date, count, aggregate amount, type summary and expandable details with shared notes and per-item actions. Single-item batches show the expense type as the compact heading. Unlinked legacy transactions remain separate, even with identical dates/types.

Batch items support editing type and amount through the same expense item controls, with atomic category/type updates. Their shared date and note remain read-only. Additions after saving, editing a shared batch note/date, and deleting an entire batch are not offered in this increment. Individual deletion uses the existing explicit confirmation and refreshes totals; it never deletes sibling items. Legacy expenses retain the prior category/required-detail editor. The manual income form, daily recap conflict checks, authentication, range filters and KPI/chart formulas remain unchanged.

### Verification

Passed automated server/database/auth/date/environment tests, TypeScript, ESLint and production build. The initial sandboxed build could not download the existing Google Fonts; the build passed with network access and `NODE_USE_SYSTEM_CA=1`. Public `/` remains static and `/admin` dynamic.

New regression assertions cover authenticated access to all expense actions, default/custom type persistence, trim/length/category validation, duplicate names without remapping, single and multi-item batches, empty/zero/negative/fractional/oversized amounts, invalid dates, rollback after an earlier item insert, identical and changed-payload retries, 905,000 Rupiah totals without double counting, chart agreement, shared notes, grouping isolation, editing a linked item's type/amount, deletion, independent SQLite reads, retry tombstones and existing legacy/income rules.

Production-browser checks use only temporary credentials and a disposable SQLite database: keyboard search/Enter selection, custom type creation and reuse, three items totaling Rp905,000, note display, save, grouped details, and an item edit updating KPI/chart to Rp925,000. Narrow 320px and 390px inspection confirmed a dialog within the viewport and no horizontal document overflow; removing a middle row preserved the first row and total, the last row could not be removed, and zero amount submission showed validation. These checks are targeted, not a formal accessibility audit.

## UI/UX refinement v2.2 (29 October 2026)

### Period filter

**Hari Ini** is the first preset and selects the inclusive range `start=todayJakarta()` / `end=todayJakarta()`. **Bulan Ini** remains the default. The dashboard still sends one range to `financialOverview`, so KPI, chart and history use the same filtered records. The custom calendar and its apply interaction are unchanged. Presets use the existing active style; on small screens the four buttons form a two-column grid with 44px touch targets, rather than squeezing four labels into one row.

The date helper accepts an optional clock instant for timezone regression tests and always formats Asia/Jakarta. A dashboard timer refreshes the business date at the next Jakarta midnight; focus/visibility events also catch up after a suspended tab resumes. A currently selected preset moves to its new range and replaces the URL at the date boundary; a custom range stays fixed. Date inputs also receive the updated today limit. Normal preset selection continues to push `start`/`end` URL parameters, and refresh/back/forward restore ranges. Active preset identity is explicit while selecting filters so only one preset is highlighted, including when Hari Ini and Bulan Ini have the same range on the first day of a month. Initial range inference prefers Bulan Ini in that tie.

### History actions and rationale

- All individual transactions, including income and legacy expenses, have one right-aligned ellipsis trigger for secondary actions. This keeps the amount prominent and avoids repeating text buttons across the list.
- Batch headers have a left-side chevron as their one primary action. Expand/collapse stays directly available, separate from mutation menus. The total stays in the existing desktop amount column and prominently in the mobile card.
- Expanded expense items use the same right-aligned menu, explicitly labeled **Edit Item** / **Hapus Item**. Standalone menus say **Edit Transaksi** / **Hapus Transaksi**. No unsupported batch-wide action is presented.
- Menu entries pair Lucide icons with text. Delete follows edit, separated by a thin divider and subtle brand/destructive text. Selecting delete opens the existing confirmation dialog; its title, explanation and confirm button now distinguish one batch item from one standalone transaction. Sibling items are explicitly preserved.

`transaction-actions.tsx` reuses the installed Radix Popover as the existing equivalent menu primitive; no dependency was added. Content is portalled with collision padding and available-height scrolling, so row/container overflow does not clip it. Triggers have contextual accessible labels, native title tooltips and 44px targets. Menus focus their first action, support Up/Down/Home/End, Enter/Space and Escape, and restore trigger focus on dismissal. Opening a confirmation/editor preserves modal focus instead of stealing it back to the menu. Focus uses the existing thin admin focus styling.

### Files changed for v2.2

- `lib/cashflow.ts`: today preset, testable Jakarta clock and unambiguous initial preset matching.
- `app/admin/period-filter.tsx`: first-position Hari Ini and explicit active preset.
- `app/admin/dashboard.tsx`: current business date rollover, preset state/URL synchronization and scoped delete confirmation copy.
- `app/admin/transaction-actions.tsx` (new): reusable accessible transaction/item action menu.
- `app/admin/expense-history.tsx`: shared menus, left chevrons and right-side mobile actions.
- `app/admin/admin.css`: small-screen preset grid and scoped menu/disclosure styling.
- `tests/cashflow.test.mjs`: timezone/midnight/year/leap-day, first-of-month default, single-day exclusion and KPI/chart agreement regressions.
- `PROJECT_CONTEXT.md` and this guide: implementation and verification.

### Verification

Passed `node --test tests/*.test.mjs` (7 tests), `npx tsc --noEmit`, `npm run lint`, and `NODE_USE_SYSTEM_CA=1 npm run build` with download access for the existing Google Fonts. Static public `/` and dynamic `/admin` behavior remain unchanged.

A production preview used disposable credentials and a separate temporary SQLite database seeded with income today/yesterday, a legacy expense, a single-item batch and a multi-item batch. Default Bulan Ini showed Rp1,600,000 income; Hari Ini showed Rp1,500,000 income, Rp930,000 expense and Rp570,000 difference. Its chart contained one matching day and its history excluded yesterday. Refresh preserved the URL and selected range. The custom 27–28 October range showed only yesterday's Rp100,000; Bulan Lalu showed the existing zero/empty state.

Browser checks covered group expansion, income and expense-item menus, item editor access, item deletion confirmation/cancellation, menu arrow navigation, Escape and restored trigger focus. At 320px and 390px the document had no horizontal overflow and the portalled menus remained within viewport bounds. Desktop layout/menu positioning was checked at 1024px and 1440px. Existing automated tests continue to cover authenticated CRUD, item editing/deletion, batch atomicity/idempotency, custom type persistence and legacy data. These are targeted checks, not a formal accessibility audit.

No v2.2 schema migration, data rewrite, new financial calculation, authentication change or persistence change was introduced. Only the required period/date handling and action presentation changed.

## UI component standardization v2.3 (29 October 2026)

The admin now has a small shared UI layer under `components/ui/admin/`. See [Admin UI component guide](admin-ui-components.md) for the complete audit inventory, canonical components, variants, examples, token governance, accessibility rules, changed files and future development rules.

History Tipe transaksi, Sumber Pemasukan, legacy expense category and the main category for a custom expense type now use `AppSelect` instead of displayed native selects. Expense types use reusable `AppCombobox`, with creation/validation/persistence kept in `ExpenseTypeSelector`. The old Popover-based hand-written action menu is replaced by `AppDropdownMenu`. Formatting is shared by `CurrencyInput`; ordinary input/textarea and icon actions have shared components. The existing native modal is extracted to `AppDialog`, including an alertdialog variant for explicit deletion confirmation. Existing Button is retained and gains a destructive confirmation variant. Date controls, period presets, cards, badges, tables, chart, status and empty-state patterns are reused rather than rebuilt.

New direct dependencies are only Radix Select and Radix DropdownMenu, matching the installed Radix Popover family. No full UI framework, form library, command palette or parallel token system is added. `admin-ui.css` is imported only by the admin page and reuses the existing global palette/composition tokens; broad and duplicated input/select/popup styling has been removed from the feature stylesheet. Normal controls share a 44px minimum target, thin border, radius, text, focus, disabled/error and popup treatment. The public site's source/style behavior is preserved.

There are no changes to the database adapter/schema, authentication, server actions, financial calculations or transaction payloads in this UI increment. Required/native validation and authoritative server validation remain. Search/custom type persistence, atomic batch saves, edit/delete scope, URL date ranges, grouped history and historical records continue to use the existing logic.

Validation for v2.3: TypeScript, ESLint, seven existing regression tests and production build passed. A disposable production preview verified filtering, keyboard source selection/income save, searchable/custom expense types, multi-item save, KPI/chart updates, legacy category editing and native required-detail validation. Select/search/calendar popups were tested inside native dialogs, including Escape and focus restoration. Controls measured 44px; 320px/390px mobile and 1024px desktop checks showed no horizontal overflow/clipped popups. Final browser warning/error logs were empty. Detailed evidence and usage rules are in the shared UI guide.
