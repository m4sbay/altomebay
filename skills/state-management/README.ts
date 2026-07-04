/**
 * State Management — Patterns & Best Practices
 *
 * Panduan kapan dan bagaimana mengelola state di project ini.
 * Pendekatan: minimal state, server-first, lokal dulu.
 */

// ─────────────────────────────────────────────
// STATE HIERARCHY (Pilih yang paling sederhana)
// ─────────────────────────────────────────────

/**
 * 1. URL State     → searchParams, path params
 * 2. Server State  → data dari server (bukan state di client)
 * 3. Local State   → useState untuk 1 komponen
 * 4. Lifted State  → useState di parent, pass ke children
 * 5. Context       → state yang diakses banyak komponen (misal: theme)
 * 6. External Lib  → Zustand/Jotai (kalau benar-benar perlu)
 *
 * Aturan: jangan loncat ke no.6 kalau no.3 sudah cukup.
 */

// ─────────────────────────────────────────────
// LOCAL STATE — useState
// ─────────────────────────────────────────────

/**
 * Gunakan untuk:
 * - UI state: isOpen, isActive, activeId
 * - Form state sederhana
 * - Fetched data di satu komponen (mis. widget yang polling)
 *
 * Contoh dari HeroWidgets.tsx:
 *
 * const [positions, setPositions] = useState<Record<string, Position>>(
 *   () => Object.fromEntries(items.map(it => [it.id, it.pos]))
 * )
 * const [activeId, setActiveId] = useState<string | null>(null)
 */

// ─────────────────────────────────────────────
// REF — useRef
// ─────────────────────────────────────────────

/**
 * Gunakan untuk:
 * - DOM references (boundsRef, el.getBoundingClientRect)
 * - Mutable values yang tidak trigger re-render (draggingRef, lastTickRef)
 * - Interval/timeout IDs
 *
 * Contoh dari WidgetShell.tsx:
 *
 * const draggingRef = useRef<{
 *   pointerId: number
 *   startX: number
 *   startY: number
 *   startPos: Position
 * } | null>(null)
 */

// ─────────────────────────────────────────────
// CONTEXT — React Context
// ─────────────────────────────────────────────

/**
 * Dipakai untuk theme (dark/light mode) — lihat /app/providers.tsx.
 *
 * Pola membuat context:
 *
 * // contexts/ThemeContext.tsx
 * const ThemeContext = createContext<Theme | undefined>(undefined)
 *
 * export function ThemeProvider({ children }: { children: React.ReactNode }) {
 *   const [theme, setTheme] = useState<Theme>("light")
 *   return (
 *     <ThemeContext.Provider value={{ theme, setTheme }}>
 *       {children}
 *     </ThemeContext.Provider>
 *   )
 * }
 *
 * export function useTheme() {
 *   const ctx = useContext(ThemeContext)
 *   if (!ctx) throw new Error("useTheme must be inside ThemeProvider")
 *   return ctx
 * }
 */

// ─────────────────────────────────────────────
// DERIVED STATE — useMemo
// ─────────────────────────────────────────────

/**
 * Hitung nilai turunan dari state — jangan simpan di state baru.
 *
 * Contoh (derived progress → persentase):
 *
 * // ❌ Jangan:
 * const [pct, setPct] = useState(0)
 * useEffect(() => setPct(progressMs / data.duration), [progressMs, data.duration])
 *
 * // ✅ Lakukan:
 * const pct = useMemo(() => {
 *   if (!data.isPlaying || data.duration <= 0) return 0
 *   return clamp(progressMs / data.duration, 0, 1)
 * }, [data, progressMs])
 */

// ─────────────────────────────────────────────
// STABLE CALLBACKS — useCallback
// ─────────────────────────────────────────────

/**
 * Pakai hanya kalau callback di-pass sebagai prop ke child
 * yang di-memo, atau sebagai dependency useEffect/useMemo.
 *
 * Jangan overuse — premature optimization.
 *
 * const handlePositionChange = useCallback(
 *   (next: Position) => setPositions(prev => ({ ...prev, [id]: next })),
 *   [id]
 * )
 */

export {};
