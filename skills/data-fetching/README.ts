/**
 * Data Fetching — Patterns & Examples
 *
 * Referensi pola fetching data di Next.js 14+ App Router.
 * Dari simple fetch sampai real-time polling.
 *
 * Referensi: Next.js Docs (node_modules/next/dist/docs/)
 */

// ─────────────────────────────────────────────
// SERVER-SIDE FETCH (Recommended default)
// ─────────────────────────────────────────────

/**
 * Di Server Component — fetch langsung, no useState/useEffect.
 * Next.js otomatis cache response ini (fetch cache).
 *
 * // app/work/page.tsx
 * export default async function WorkPage() {
 *   const projects = await fetch("https://api.example.com/projects", {
 *     next: { revalidate: 3600 }, // ISR: revalidate tiap 1 jam
 *   }).then(r => r.json())
 *
 *   return <ProjectGrid projects={projects} />
 * }
 */

// ─────────────────────────────────────────────
// ROUTE HANDLER (API Route)
// ─────────────────────────────────────────────

/**
 * Pola API route — gunakan route handler di `app/api/[segment]/route.ts`.
 *
 * // app/api/[nama]/route.ts
 * import { NextResponse } from "next/server"
 *
 * export async function GET() {
 *   // fetch data eksternal di sini (credentials aman, di server)
 *   const data = await fetchExternalAPI()
 *   return NextResponse.json(data)
 * }
 *
 * // Untuk dynamic routes:
 * export async function GET(
 *   request: Request,
 *   { params }: { params: Promise<{ slug: string }> }
 * ) {
 *   const { slug } = await params
 *   // ...
 * }
 */

// ─────────────────────────────────────────────
// CLIENT-SIDE POLLING
// ─────────────────────────────────────────────

/**
 * Real-time polling — contoh pola polling di Client Component.
 *
 * const [data, setData] = useState(null)
 *
 * useEffect(() => {
 *   const fetch = async () => {
 *     const res = await fetch("/api/endpoint", { cache: "no-store" })
 *     setData(await res.json())
 *   }
 *
 *   fetch() // initial fetch
 *   const id = window.setInterval(fetch, 30_000) // poll tiap 30 detik
 *   return () => window.clearInterval(id)
 * }, [])
 */

// ─────────────────────────────────────────────
// STATIC DATA (Local)
// ─────────────────────────────────────────────

/**
 * Untuk data yang tidak berubah — taruh di /data/*.ts
 * Tidak perlu fetch, diimport langsung.
 *
 * // data/projects.ts
 * export const projects = [
 *   { slug: "masbay-portfolio", title: "Portfolio", ... },
 * ]
 *
 * // Dipakai di Server Component:
 * import { projects } from "@/data/projects"
 */

// ─────────────────────────────────────────────
// ERROR HANDLING PATTERN
// ─────────────────────────────────────────────

/**
 * Selalu wrap fetch dalam try/catch di Client Component:
 *
 * try {
 *   const res = await fetch("/api/endpoint")
 *   if (!res.ok) throw new Error("Network error")
 *   setData(await res.json())
 * } catch (error) {
 *   setData(null) // fallback state
 *   console.error("Fetch failed:", error)
 * }
 *
 * Di Server Component — gunakan error.tsx file:
 * // app/error.tsx
 * "use client"
 * export default function Error({ error, reset }) { ... }
 */

// ─────────────────────────────────────────────
// TYPESCRIPT TYPES UNTUK API RESPONSE
// ─────────────────────────────────────────────

/**
 * Selalu define type untuk response API.
 * Contoh: discriminated union untuk state sukses vs kosong.
 *
 * type NowPlaying =
 *   | { isPlaying: false }
 *   | { isPlaying: true; title: string; artist: string; ... }
 *
 * // Type guard usage:
 * if (data.isPlaying) {
 *   console.log(data.title) // TypeScript tahu ini aman
 * }
 */

export {};
