# Altomebay
Official website for a family retail shop, named after Alimah, Sugianto, Melia, and Bayu.
## Current milestone
Phase 1 UI foundation and Phase 2 homepage. Indonesian, responsive, white/green, Plus Jakarta Sans. Retail hierarchy inspired by Alfagift with an independent identity.
## Stack
Next.js 16 App Router, React 19, TypeScript, Tailwind 4. Existing GSAP, Framer Motion, Lenis retained. Static export; Vercel hosting and Domainesia domain planned.
## Scope
Header, mobile navigation, hero, shopping categories, promotional placeholder, services, benefits, family story, location/hours, footer, mobile contact bar. No auth/backend/cart/checkout. Future customer accounts: profile, registration, login; admin/POS separate milestones.
## Content
Central configuration in lib/content.ts; navigation in lib/navigation.ts. Contact/location/hours intentionally unset. Never link to dummy phone numbers or maps. Asset requirements in public/assets/README.md. Illustrations are clearly labeled placeholders.
## Validation
npm run lint, npx tsc --noEmit, npm run build. Preserve pre-existing user edits. Read bundled Next.js docs before changing routing/framework APIs.

## Typography system
Primary numeric scale: Tailwind v4 (14/16/18/20/24/30/36/48/60px at browser default 16px). Semantic roles in app/typography.css, imported by globals.css; Material 3 informs display/headline/title/body/label roles only. Body/nav/buttons 1rem; caption/labels .875rem. H1 fluid 2.25–3.75rem; H2 1.875–2.25rem; H3 1.5–1.875rem; cards 1.25–1.5rem. Root size remains browser default. No incremental px token. Line-height unitless; test 200% text, 320 CSS px reflow, WCAG text-spacing overrides. Preserve colors; contrast review remains separate from size/accessibility testing.
