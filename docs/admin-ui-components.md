# Admin UI component guide

## Scope and audit (v2.3)

Admin uses React 19, Tailwind 4, Lucide and Radix. The installed Radix Popover and React DayPicker are retained. There was no shadcn component registry or full UI framework installed. The implementation uses the same selective Radix composition approach as shadcn without installing a template, theme generator, Base UI or command-palette framework.

| Existing UI | Audit finding | Canonical choice |
| --- | --- | --- |
| History Tipe transaksi | Browser-native select had an OS-specific popup | `AppSelect`, preserving the three choices and history-only filtering |
| Sumber Pemasukan | Browser-native select inside transaction modal | `AppSelect`, preserving daily-sales lookup/conflict rules |
| Legacy expense category and new expense type's main category | Two more browser-native selects | `AppSelect` with the existing category keys |
| Jenis Pengeluaran | Domain component mixed search/list keyboard logic with creation/persistence | Generic `AppCombobox`; `ExpenseTypeSelector` keeps authenticated creation and reusable type mapping |
| Transaction action menu | Radix Popover plus hand-written menu navigation | `AppDropdownMenu` backed by Radix DropdownMenu |
| Amounts | Identical formatting/input handlers in two forms | `CurrencyInput`; parent retains the same formatted string and server payload |
| Plain text, password and notes | Broad, duplicated admin CSS selectors | `AppInput` / `AppTextarea`, including native attributes and shared states |
| Close/remove/expand icons | Similar hand-styled buttons | `AppIconButton` with a required accessible label |
| Transaction modal | Defined inside the income/legacy form and imported by unrelated flows | Shared `AppDialog`; native dialog retained for its working focus trap, top layer and Escape behavior |
| Delete confirmation | Same modal shape, destructive intent only in text | `AppDialog alert` with description association; existing Button gains a destructive variant |
| DatePicker / period range picker | Existing Radix Popover/DayPicker already handles Jakarta dates and nested overlays | Retain implementations and expose the same canonical control/popup styling |
| Period presets | Existing compact segmented buttons work on keyboard/touch | Retain; do not turn four visible shortcuts into a select |
| Button, card, badge, table, chart, inline status/error and empty states | Existing tokens/patterns are consistent and functional | Reuse; no wrapper or skeleton/toast/Sheet added without an actual need |

## Canonical components

New admin primitives live in `components/ui/admin/`. Their shared stylesheet is `admin-ui.css`, imported only by `app/admin/page.tsx` after the admin layout stylesheet. Use them in admin surfaces; the public site retains its original CSS and components.

| Component | Purpose / supported states |
| --- | --- |
| `AppSelect` (`select.tsx`) | One static option. `value` + `onValueChange` or `defaultValue`; options with stable nonempty values/labels and optional disabled items; `name`, `required`, disabled, loading, placeholder, error, ID and accessibility associations. Empty string is the placeholder value, never an option. |
| `AppCombobox` (`combobox.tsx`) | Searchable options. Controlled value or `defaultValue`; optional `onCreate(query)` and `createLabel`; disabled/loading/error; Indonesian case-insensitive search, selection indicator, keyboard navigation and no-results message. Creation is a callback, not persistence inside the primitive. |
| `AppDropdownMenu` (`dropdown-menu.tsx`) | Secondary actions. Required contextual trigger label; items have stable IDs, text, optional icons, disabled/destructive states and `onSelect`. Radix provides roving focus, typeahead, arrows, Home/End, Escape and dismissal. Do not put form selection in a menu. |
| `AppInput` / `AppTextarea` (`controls.tsx`) | Native HTML controls with shared styling. Forward standard attributes, refs, controlled/uncontrolled values and `aria-*`; `error` sets `aria-invalid`. Textarea remains resizable. |
| `CurrencyInput` (`controls.tsx`) | Shared integer-Rupiah formatting for the existing formatted-string form state. `value`/`onValueChange`, or `defaultValue`; numeric mobile keyboard. Strip periods when building the existing server payload. Positivity/limits remain validated by existing form/server rules. |
| `AppIconButton` (`controls.tsx`) | Ghost icon action with a 44px target. Required `label` supplies `aria-label` and native title; accepts refs and ordinary button attributes. Use for close, remove and disclosure triggers. |
| `AppDialog` (`dialog.tsx`) | Mounted modal with required title and close callback, optional `wide`, `alert`, `descriptionId`. Use `alert` for the existing deletion confirmation, associate explanatory text, and retain an explicit cancel action. Overlay state belongs to the caller. |
| Existing `Button` (`components/ui/Button.tsx`) | `primary`, `secondary` (the outline treatment), `destructive` for confirmation, and existing public `whatsapp`. Standard disabled/pending behavior remains. Do not add an alias variant merely to rename secondary to outline. |
| Existing `DatePicker`, `PeriodFilter`, transaction badges/table and `.admin-panel` | Retain the existing domain/date/data presentation patterns. They already give value beyond primitive wrappers or need no wrapper. |

### Examples

Static selection with an explicit label and controlled form state:

```tsx
import { AppSelect } from '@/components/ui/admin/select';

<label htmlFor="income-source">Sumber Pemasukan</label>
<AppSelect
  id="income-source"
  value={source}
  onValueChange={setSource}
  options={[
    { value: 'sales', label: 'Penjualan Harian' },
    { value: 'other_income', label: 'Pemasukan Lainnya' },
  ]}
  disabled={saving}
/>
```

For an uncontrolled native-form integration, use `defaultValue`, `name` and `required` instead of `value`. Radix's visually hidden native select preserves form semantics; it is intentionally hidden and is not the displayed dropdown. Keep server validation authoritative.

Searchable selection delegates custom creation to the domain component:

```tsx
<AppCombobox
  label="Jenis Pengeluaran"
  options={types.map(type => ({ value: type.id, label: type.name }))}
  value={typeId}
  onValueChange={setTypeId}
  createLabel="Tambah Jenis Pengeluaran"
  onCreate={query => openTypeConfirmation(query)}
/>
```

Native validation and field-level errors:

```tsx
<label htmlFor="expense-note">Detail Pengeluaran</label>
<AppTextarea
  id="expense-note"
  required
  value={note}
  onChange={event => setNote(event.target.value)}
  error={Boolean(noteError)}
  aria-describedby={noteError ? 'expense-note-error' : undefined}
/>
{noteError && <p id="expense-note-error" role="alert">{noteError}</p>}
```

Use `<CurrencyInput value={amount} onValueChange={setAmount} required />` inside a labeled field. The value remains the existing formatted Rupiah string, such as `450.000`; it is not a decimal/currency conversion engine.

Use `TransactionActions` as the domain adapter for transaction menus. Its edit/delete handlers and descriptions remain in the dashboard; the primitive has no knowledge of finance records. Use `Button variant="destructive"` only at the final confirmation, not for every menu trigger.

## Tokens and states

There is one existing palette in `app/globals.css` and one composition-token source in `app/design-tokens.css`. No new palette or parallel theme was introduced. Admin controls use `base`, `ink`, `ink-soft`, `brand`, `brand-soft`, `brand-muted`, `border`, `radius-control`, `touch-target`, `spacing`, `duration-ui` and `shadow-soft-hover`.

`admin-ui.css` is the single component-style source for control padding, border, text, disabled/error/focus states and option/menu surfaces. Normal controls have a minimum 44px height; wrapping labels/date values can grow. Textareas grow with their rows. Search, static select and date triggers share the same control class. Popups share surface, thin border, radius, subtle shadow, option padding and highlight; their width/available-height rules vary by content and positioning primitive. Calendars retain a larger inner padding for date-cell spacing. Focus uses one brand border for form controls and a thin outline for icon/menu actions. No thick double ring is added.

## Accessibility and overlays

- Always supply a visible label or contextual accessible name. `id` plus `label htmlFor` is preferred for static fields. Do not rely on placeholder/title alone.
- Errors need meaningful visible text. Set `error` plus `aria-describedby` to that message when identifying a field error. Native required validation is retained; server validation is authoritative.
- `AppSelect` exposes Radix listbox semantics and keyboard selection/typeahead. `AppCombobox` keeps focus in its search input with `aria-activedescendant`, a labeled listbox, selection indicators and scroll-to-active keyboard movement. Enter selects/creates without submitting the surrounding form.
- Radix Select, Popover and DropdownMenu use one family of overlay primitives. Their portals attach to the nearest native dialog when invoked there, preserving the browser's top-layer interaction; otherwise they portal to the document body. Collision padding, max height and scrolling prevent clipping.
- Escape dismisses the active popup first and restores the trigger; a subsequent Escape can close the dialog. A menu action that opens an editor/confirmation preserves focus in the new dialog. Native dialog close restores the preceding connected trigger.
- Native `dialog`, `details`, `fieldset`, inputs and textareas are intentional semantic HTML. There is no need to replace them with a new overlay or form framework.
- Support 320px reflow, touch targets, reduced motion and long labels. Test both a standalone filter popup and a popup nested in a dialog before changing overlay behavior.

## Future development rules

1. Check this guide and shared UI components before adding a component.
2. Do not introduce a displayed browser-default native select in admin while `AppSelect` fits the need.
3. Use static selection, searchable selection, action menus and visible segmented options according to their function. Do not turn every interaction into a Select.
4. Use existing Button variants or `AppIconButton`; do not create manual variants for a feature.
5. Use the existing design tokens and shared component CSS. Keep admin-only styles out of public/global selectors.
6. Extend shared APIs backward-compatibly when multiple actual callers need a capability. Keep domain validation, auth, persistence and business calculations outside UI primitives.
7. Avoid abstractions just to remove a few lines. Native HTML and consistent existing patterns are preferred when a wrapper adds no behavior or design guarantee.
8. Add primitives/dependencies only for a demonstrated need, stay with Radix, and document migration/keyboard/nested-overlay checks. Do not install a full component framework or unused component catalog.

## v2.3 changed files and dependencies

New: `components/ui/admin/{controls,select,combobox,dropdown-menu,dialog}.tsx`, `components/ui/admin/admin-ui.css`, and this guide.

Migrated: `app/admin/{dashboard,transaction-form,expense-form,expense-type-selector,transaction-actions,expense-history,date-picker,period-filter,login,page}.tsx`; `app/admin/admin.css`; `components/ui/Button.tsx`. Updated: `package.json`, `package-lock.json`, `PROJECT_CONTEXT.md`, `docs/admin-cashflow.md`.

Direct additions: `@radix-ui/react-select` ^2.4.1 for accessible static selection and `@radix-ui/react-dropdown-menu` ^2.2.1 for true menu keyboard/focus behavior. They reuse the existing Radix family. No shadcn CLI, full library, Base UI, form framework or combobox-search dependency was added. The existing Radix Popover continues to power calendar/search popups.

## Verification performed

Passed TypeScript, ESLint, seven existing regression tests and the production build. The build retains static `/` and dynamic `/admin`; existing Google Fonts required download access. No backend test expectations or financial rules were changed for this UI migration.

Production-browser checks used a disposable database and temporary credentials. They covered history type filtering; keyboard source selection and saving Rp250,000 other income; searching/selecting an expense type; creating Belanja Pupuk with a main-category Select; saving two expense items totaling Rp730,000; and the resulting KPI/chart changes. Legacy expense editing retained its category/detail values and a blank required detail correctly blocked submission. Action-menu arrows/Enter reached the existing editor. Escape closed Select/Combobox/calendar popups before the underlying dialog and restored trigger focus. The nested Select portal was confirmed inside the native dialog, with no visibly displayed native selects.

Measured ordinary date, currency and Select controls at 44px. At 320px and 390px, filter/nested popups stayed within the viewport with no horizontal document overflow; desktop checks used 1024px. Browser warning/error logs were empty after the final checks. These targeted checks are not a formal accessibility audit. Existing automated tests cover authentication, persistence, CRUD, batch rollback/idempotency, reusable type validation, legacy data and date/KPI/chart rules.
