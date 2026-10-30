# Light and Dark Mode

The root server layout wraps its children in the small client `ThemeProvider`.
`next-themes` sets `data-theme` before the page paints, follows the OS preference
until a manual choice is made, and persists that choice under `altomebay-theme`
in localStorage. Its storage listener keeps tabs in sync. Server-rendered content
stays on the server. Only the root HTML attribute suppresses hydration warnings.

`ThemeToggle` is reusable in the storefront and admin headers. Its 44px target,
fixed two-icon grid and stable label avoid geometry changes during hydration.
The screen reader label is “Mode gelap”; `aria-pressed` communicates whether it
is active. The control is disabled until hydration. CSS animates rotation, scale
and opacity for 250ms and honors reduced motion. Manual changes briefly enable
color transitions; initial loading does not. No animation dependency was added.

## Tokens

`app/theme.css` overrides the existing palette only for `[data-theme="dark"]`:
base `#1f1f20`, soft surface `#272729`, elevated surface `#303033`, ink `#f5f5f5`,
muted ink `#a8a8ad`, border/disabled `#3a3a3d`, brand foreground `#ff8b84`, hover
foreground `#ffaaa4`, brand soft `#342625`, brand muted `#6d4542`, amber `#e1bd7b`.

New `brand-solid` / `brand-solid-hover` tokens preserve `#c62f2b` / `#aa2421`
for white-on-red actions and announcements. The lighter brand foreground is
reserved for dark-mode text/icons, keeping their contrast legible. Other new
semantic roles are `elevated`, `header-surface`, `mobile-cta-surface`,
`hero-background`, `promotion-surface`, `dialog-backdrop`, and `control-border`.
Dark input boundaries use `#838389` for contrast against elevated surfaces.
Light mode retains its original palette, hero gradient and button gradient.
Dark mode uses a flat hero surface and removes UI shadows. Existing raster
assets and product illustrations retain their colors without filters.

## Validation

Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm test`.
Browser verification covers first-visit OS preference and live OS changes,
manual override, reload and navigation persistence, rapid toggling, keyboard
Space/focus rings, mobile menu focus trap/Escape, 44px targets and overflow at
320/390/768/900/1024/1440px, reduced motion, and hydration/console errors.
Check before-hydration theme application and contrast of actual rendered colors.

The admin login and shared control/portal styles can be checked without signing
in. An authenticated dashboard interaction pass still requires a test session;
this appearance change does not modify authentication or financial data.

## Changed files

Created:
- `app/theme.css` — semantic theme overrides and CSS transitions.
- `components/providers/ThemeProvider.tsx` — App Router provider.
- `components/ui/ThemeToggle.tsx` — accessible reusable control.
- `docs/dark-mode.md` — implementation and verification notes.

Updated:
- `app/layout.tsx` — provider, root hydration attribute, skip-link solid color.
- `app/globals.css` — theme import and solid action tokens.
- `app/design-tokens.css` — gradient uses the solid brand colors.
- `components/layout/Nav.tsx` — toggle, header surface, mobile focus order.
- `components/layout/AnnouncementBar.tsx` — solid announcement background.
- `components/sections/hero.css` — semantic hero background.
- `components/sections/Promotion.tsx` — semantic promotion surface.
- `app/admin/page.tsx` — admin header toggle.
- `app/admin/admin.css` — dialog backdrop and selected calendar colors.
- `components/ui/admin/admin-ui.css` — destructive button colors.
- `package.json` and `package-lock.json` — next-themes dependency.

## Verified result

- Lint, TypeScript, production build and diff whitespace checks passed.
- Existing tests: 13 passed, 1 live PostgreSQL test skipped (no live test URL).
- All browser checks above passed against the production build; console/page
  errors were empty. The inline initialization also applied dark mode correctly
  with external application scripts blocked, before hydration.
- Representative contrast ratios: primary text/base 15.11:1, muted text/elevated
  5.56:1, brand text/soft brand surface 6.40:1, white/red action 5.46:1, and
  input boundary/elevated surface 3.49:1.
- `PROJECT_CONTEXT.md` was also updated with the final theme architecture.
