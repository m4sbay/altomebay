# Altomebay
Official website for a family retail shop, named after Alimah, Sugianto, Melia, and Bayu.
## Current milestone
Phase 1 UI foundation and Phase 2 homepage. Indonesian, responsive, white/red, Plus Jakarta Sans. Retail hierarchy inspired by Alfagift with an independent identity.
## Stack
Next.js 16 App Router, React 19, TypeScript, Tailwind 4. Existing GSAP, Framer Motion, Lenis retained. Public homepage is statically prerendered; admin requires a Node.js server and persistent SQLite disk. Vercel hosting requires a managed database; Domainesia domain planned.
## Scope
Header, mobile navigation, hero, shopping categories, promotional placeholder, services, benefits, family story, location/hours, footer, mobile contact bar. Admin authentication and cashflow backend now exist at /admin; no public customer auth/cart/checkout. Future customer accounts: profile, registration, login; POS remains a separate milestone.
## Content
Central configuration in lib/content.ts; navigation in lib/navigation.ts. Official store name, address, WhatsApp, and Google Maps URL are configured; opening hours and social profiles remain unconfirmed. Never link to dummy phone numbers or maps. Asset requirements in public/assets/README.md. Illustrations are clearly labeled placeholders.
## Validation
npm run lint, npx tsc --noEmit, npm run build. Preserve pre-existing user edits. Read bundled Next.js docs before changing routing/framework APIs.

## Typography system
Primary numeric scale: Tailwind v4 (14/16/18/20/24/30/36/48/60px at browser default 16px). Semantic roles in app/typography.css, imported by globals.css; Material 3 informs display/headline/title/body/label roles only. Body/nav/buttons 1rem; caption/labels .875rem. H1 fluid 2.25–3.75rem; H2 1.875–2.25rem; H3 1.5–1.875rem; cards 1.25–1.5rem. Root size remains browser default. No incremental px token. Line-height unitless; test 200% text, 320 CSS px reflow, WCAG text-spacing overrides. Preserve colors; contrast review remains separate from size/accessibility testing.

## Brand identity
Logo assets are case-sensitive: public/assets/logo_altomebay.PNG (A symbol) and logo_altomebay2.PNG (full logo). Navigation preserves the original logo. Hero uses centered Bricolage Grotesque typography (next/font/google, scoped to hero), a soft brand gradient, modular brick accents, and a CSS image marquee. Placeholder SVG illustrations live in public/assets/hero; replace sources and alt text in lib/hero-images.ts with real 4:3 photos. Hero styles live in components/sections/hero.css. Two equal groups loop left with hover/focus pause; reduced motion shows one manually scrollable group. App icon/favicon derive from the A symbol. Sampled dominant symbol red: #e9453f; decorative accent only. Accessible primary #c62f2b, hover #aa2421, soft #fff1f0, ink #1f2937. All UI brand colors are centralized in globals.css; green in product artwork/plants and WhatsApp is illustrative/semantic. Static export retains images.unoptimized.

## Announcement bar
AnnouncementBar precedes navigation. Messages live in lib/content.ts; verified storeConfig.hours is appended only when nonempty. Two equal nowrap horizontal CSS groups loop left over 32 seconds with zero track gap; the duplicate is aria-hidden. Bar height is 2.375rem (38px), brand red with white text. No playback controls; hover/focus pause. Reduced motion keeps one static horizontal list, manually scrollable by touch/keyboard with hidden scrollbar; no wrapping or extra height.

## Official contact integration
All store identity/contact data lives in lib/content.ts (storeConfig). WhatsApp CTAs use buildWhatsAppLink and Maps CTAs use buildMapsSearchUrl from lib/links.ts. Navbar (including mobile), hero, service CTA, footer, and mobile contact bar use the same official number. Location keeps the lightweight illustrative map, clearly labeled as an illustration. Do not invent opening hours.

## Design system refinement
BoardUI informs hierarchy, whitespace and component proportions; measured reference values and adaptation decisions are in docs/design-system-audit.md. app/design-tokens.css registers Tailwind v4 composition tokens: existing 74rem container, section spacing 96/80/64px equivalent, 10px controls and 20px cards, shared gaps and control sizing based on the existing quarter-rem scale. Brand palette and fonts remain. Hero uses semantic fluid 40–80px display sizing at weight 700; other typography roles remain in typography.css. Intrinsic artwork geometry and existing reflow/reduced-motion behavior remain separate from UI layout tokens.

Button correction: standard action/nav-contact uses 14/20px text at weight 500, 8px padding, 10px radius, minimum 36px height, intrinsic content width. Brand fonts retained. Sticky mobile actions keep 44px minimum. Borders use inset outlines to avoid adding height.

Button structure refinement: outer 8px padding + .button-label horizontal 4px, icon 20px, flex gap 2px. Hero uses shared Button for primary and white bordered secondary with 8px CTA gap. Primary has brand-red gradient; secondary uses neutral ink/border. Shadow remains subtle; no hover lift.

## Tailwind v4 migration
Components now compose static layout/spacing/color utilities directly in className. Shared, descendant, state and responsive styling uses Tailwind @apply in the existing stylesheets, preserving prior cascade and exact visual values. Native CSS remains for tokens, keyframes, gradients, font variation, transforms and complex behavior. Hero CSS references globals via @reference; reset margins and intrinsic :where rules use @layer base. No dependency added. See docs/tailwind-migration.md for editing locations and validation. Production computed-style/geometry comparisons across 305 elements showed zero differences at 320, 390, 768 and 1440 CSS px. Lint, TypeScript, build, mobile menu/Escape, gallery focus ring and animation pause validated.

## Daily cashflow admin
`/admin` adds server-side password authentication, eight-hour sessions, SQLite persistence, and daily transaction CRUD. Static export has been removed; Node.js 22.13+ and persistent disk are now required. Public design is unchanged. See docs/admin-cashflow.md for environment setup, hosting constraints (managed SQL required before Vercel), files, verification and MVP limits.

Admin refinement v1.1: shared Indonesian React DayPicker + Radix Popover calendar uses Jakarta TZDate conversions and Monday-first weeks. Expense description is mandatory on create/update; legacy empty descriptions remain readable. Calendar/focus styles are admin-scoped. Restart the dev server after changing export configuration/environment: an old running static-export server caused `/admin` HTTP 500; restart restored HTTP 200. `ADMIN_PASSWORD_HASH` is still required to enable sign-in.

Admin v2.0: `/admin` now uses a Jakarta month-to-date Financial Overview with URL date ranges, server-consistent KPI/trend totals, separate manual-income and detailed-expense workflows, responsive transaction history and real pagination. Existing Radix/DayPicker/Button primitives are reused with no new dependencies. Additive SQLite triggers prevent new duplicate daily sales while preserving historical duplicates; rollback/audit guidance is in `docs/admin-cashflow.md`. Public page sources, global tokens and authentication remain unchanged.

Admin v2.1: expense entry supports searchable reusable types, custom names mapped to existing main categories, multiple individually priced items, shared optional notes, atomic/idempotent SQLite batches and expandable grouped history. New additive expense tables preserve the original transaction schema/data; KPI/chart aggregate individual records once. Batch item type/amount can be edited and items deleted individually; shared date/note and batch membership remain fixed after save. Income entry is unchanged. See docs/admin-cashflow.md for persistence, rollback, limits and checks.

Admin v2.2: Hari Ini is the first Jakarta preset; Bulan Ini remains the default, with URL range persistence and midnight/resume refresh for active presets. History uses right-side ellipsis menus for existing edit/delete actions, explicit item labels and confirmations, and separate left chevrons for grouped details. Four mobile presets use a two-column grid. No schema/data/auth/persistence or KPI formula changes. Seven tests, TypeScript, lint, build and desktop/mobile menu checks passed; see docs/admin-cashflow.md.

Admin v2.3: canonical shared admin controls live in components/ui/admin (AppSelect, AppCombobox, AppDropdownMenu, AppInput, AppTextarea, CurrencyInput, AppIconButton, AppDialog). Displayed native selects and custom action-menu keyboard code are migrated to focused Radix Select/DropdownMenu dependencies; existing Popover/DayPicker and native dialog remain. Admin-only shared CSS reuses existing tokens and 44px targets without changing public styles. Existing Button adds destructive confirmation styling. For future UI work, consult docs/admin-ui-components.md first; use canonical controls, avoid displayed browser-default selects/manual button variants, and keep business/persistence logic outside UI primitives.
