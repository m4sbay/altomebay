/**
 * TypeScript — Patterns & Conventions
 *
 * Panduan TypeScript yang relevan untuk project ini.
 * Fokus: type safety tanpa verbositas berlebihan.
 */

// ─────────────────────────────────────────────
// COMPONENT PROPS TYPING
// ─────────────────────────────────────────────

/**
 * ✅ Inline type (untuk props sederhana):
 *
 * function IconTile({ label }: { label: string }) { ... }
 *
 * ✅ Interface (untuk props yang akan di-extend/reuse):
 *
 * interface CardProps {
 *   title: string
 *   description?: string      // ← optional
 *   variant?: "solid" | "glass"
 * }
 *
 * ✅ Type dengan union (untuk diskriminasi):
 *
 * type ButtonProps =
 *   | { variant: "icon"; icon: React.ReactNode; label: string }
 *   | { variant?: "text"; children: React.ReactNode }
 */

// ─────────────────────────────────────────────
// DISCRIMINATED UNION — Type Guards
// ─────────────────────────────────────────────

/**
 * Contoh discriminated union:
 *
 * type NowPlaying =
 *   | { isPlaying: false }
 *   | {
 *       isPlaying: true
 *       title: string
 *       artist: string
 *       albumArt?: string
 *       progress: number
 *       duration: number
 *     }
 *
 * // Usage — TypeScript narrowing otomatis:
 * if (!data.isPlaying) {
 *   return <EmptyState />
 * }
 * // Di sini TypeScript tahu data punya title, artist, dll.
 * console.log(data.title)
 */

// ─────────────────────────────────────────────
// AS CONST — Immutable objects sebagai types
// ─────────────────────────────────────────────

/**
 * Pakai `as const` untuk object yang nilainya tidak berubah.
 * Memberikan literal types yang lebih spesifik.
 *
 * const VARIANTS = {
 *   solid: "bg-zinc-950 text-white",
 *   ghost: "bg-transparent text-zinc-600",
 * } as const
 *
 * type Variant = keyof typeof VARIANTS  // "solid" | "ghost"
 *
 * Dipakai di seluruh design-system/tokens.ts dan components.ts
 */

// ─────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────

/**
 * Yang sering dipakai:
 *
 * Partial<T>       — semua props optional
 * Required<T>      — semua props required
 * Pick<T, K>       — ambil sebagian props
 * Omit<T, K>       — buang sebagian props
 * Record<K, V>     — object dengan key K dan value V
 * ReturnType<F>    — type return value fungsi
 *
 * Contoh dari HeroWidgets.tsx:
 * const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>()
 */

// ─────────────────────────────────────────────
// REACT-SPECIFIC TYPES
// ─────────────────────────────────────────────

/**
 * React.ReactNode       — children (semua yang bisa di-render)
 * React.ReactElement    — JSX element spesifik
 * React.ComponentProps<typeof X>  — props dari komponen X
 * React.SVGProps<SVGSVGElement>   — props SVG (untuk icon)
 * React.RefObject<T>    — ref dari useRef
 * React.RefCallback<T>  — callback ref
 *
 * Contoh dari WidgetShell.tsx:
 * boundsRef?: React.RefObject<HTMLElement | null>
 */

// ─────────────────────────────────────────────
// PATH ALIASES
// ─────────────────────────────────────────────

/**
 * Alias yang sudah dikonfigurasi di tsconfig.json:
 * @/ → root project
 *
 * Pakai:  import { glass } from "@/design-system"
 * Hindari: import { glass } from "../../../design-system"
 */

// ─────────────────────────────────────────────
// STRICT MODE CHECKLIST
// ─────────────────────────────────────────────

/**
 * Project ini menggunakan TypeScript strict mode.
 * Hal-hal yang perlu diperhatikan:
 *
 * ✅ Selalu handle null/undefined (nullish coalescing ?? / optional chaining ?.)
 * ✅ Jangan pakai `any` — pakai `unknown` lalu narrow
 * ✅ `as Type` cast hanya sebagai last resort
 * ✅ Return type explicit di fungsi publik/API
 */

export {};
