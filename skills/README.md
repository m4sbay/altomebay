# skills/ — Knowledge Base & Design System

Folder ini adalah **referensi hidup** (living reference) untuk project masbay-portfolio.
Berisi design system, pola komponen, dan panduan skill web development yang bisa
dijadikan rujukan saat membangun fitur baru.

> Kiblat desain: **Apple Human Interface Guidelines** — clean, minimal, purposeful.

---

## 📁 Struktur

```
design-system/              ← 🎨 runtime (root project, import @/design-system)
├── tokens.ts               — Design tokens (warna, spasi, tipografi, dll)
├── components.ts           — Tailwind class patterns (glass, card, button, dll)
├── animations.ts           — Framer Motion variants & transitions
├── icons.tsx               — SVG icon components
└── index.ts                — Barrel export (import dari satu tempat)

skills/
├── hooks/
│   └── README.ts           — Custom React hooks siap pakai
│
├── accessibility/
│   └── README.md           — a11y patterns, ARIA, focus management (snippet referensi)
│
├── performance/
│   └── README.ts           — Next.js performance patterns
│
├── data-fetching/
│   └── README.ts           — Fetch patterns (server, client, polling)
│
├── state-management/
│   └── README.ts           — Kapan pakai apa (useState vs useRef vs Context)
│
├── typescript/
│   └── README.ts           — TypeScript conventions & utility types
│
└── seo/
    └── README.ts           — Metadata, OG, sitemap, checklist
```

---

## 🎨 Design System Quick Reference

### Import
```ts
// Import semua dari satu path
import { colors, glass, fadeUp } from "@/design-system"

// Atau per-file kalau butuh tree-shaking lebih ketat
import { glass, card } from "@/design-system/components"
import { fadeUp, stagger } from "@/design-system/animations"
```

### Glassmorphism (pola utama widget)
```tsx
<div className={glass.widget}>
  {/* Widget content */}
</div>
```

### macOS Traffic Light Controls
```tsx
<div className={macControls.row}>
  <div className={`${macControls.dot} bg-[#ec6a5e]`} />
  <div className={`${macControls.dot} bg-[#f4bf4f]`} />
  <div className={`${macControls.dot} bg-[#61c554]`} />
</div>
```

### Animasi dengan Framer Motion
```tsx
import { LazyMotion, domAnimation, m } from "framer-motion"
import { stagger, fadeUp } from "@/design-system"

<LazyMotion features={domAnimation}>
  <m.div variants={stagger} initial="hidden" animate="show">
    <m.div variants={fadeUp}>Card 1</m.div>
    <m.div variants={fadeUp}>Card 2</m.div>
  </m.div>
</LazyMotion>
```

---

## 🎨 Color Palette Visual

| Token | Value | Keterangan |
|-------|-------|------------|
| `zinc-950` | `#09090b` | Foreground utama (dark) |
| `zinc-600` | `#52525b` | Text sekunder (light) |
| `zinc-300` | `#d4d4d8` | Text sekunder (dark) |
| `glass.surface` | `rgba(255,255,255,0.10)` | Widget background |
| `glass.border` | `rgba(255,255,255,0.20)` | Widget border |
| `trafficLight.red` | `#ec6a5e` | macOS close button |
| `trafficLight.yellow` | `#f4bf4f` | macOS minimize button |
| `trafficLight.green` | `#61c554` | macOS maximize button |
| `accent.emerald` | `#34d399` | Accent / highlight |

---

## 📐 Spacing Scale (base 4px)

| Class | Value |
|-------|-------|
| `p-1` | 4px |
| `p-2` | 8px |
| `p-3` | 12px |
| `p-4` | 16px |
| `p-6` | 24px |
| `p-8` | 32px |

---

## 📖 Panduan Skill

Setiap folder skill berisi `README.ts` / `README.tsx` dengan:
- Penjelasan konsep
- Pola yang direkomendasikan (✅) vs dihindari (❌)
- Contoh kode dari codebase ini sendiri

### Urutan baca untuk fitur baru:
1. `design-system/` — visual language
2. `typescript/` — typing conventions
3. `data-fetching/` — kalau butuh data
4. `state-management/` — kalau butuh state
5. `performance/` — sebelum shipping
6. `seo/` — metadata halaman baru
7. `accessibility/` — checklist terakhir

---

## ✏️ Cara Berkontribusi ke Skills

Kalau menemukan pola baru yang bagus atau perlu mendokumentasikan sesuatu:
1. Tambah ke file README.ts yang relevan
2. Atau buat sub-folder baru di `skills/[nama-skill]/`
3. Update `README.md` ini kalau ada kategori baru
