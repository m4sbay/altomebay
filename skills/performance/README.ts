/**
 * Performance — Patterns & Best Practices
 *
 * Kumpulan teknik performa yang relevan untuk project Next.js 14+.
 * Setiap pattern dilengkapi dengan contoh penggunaan.
 *
 * Referensi: Next.js Docs, web.dev, Vercel Speed Insights
 */

// ─────────────────────────────────────────────
// IMAGE OPTIMIZATION
// ─────────────────────────────────────────────

/**
 * WAJIB: Gunakan next/image untuk semua gambar.
 *
 * Pattern untuk gambar dengan ukuran tetap (avatar, thumbnail):
 *
 * <Image
 *   src="/profil.png"
 *   alt="Masbay Profile"
 *   width={80}
 *   height={80}
 *   className="rounded-md object-cover"
 *   priority            // ← pakai untuk LCP image (gambar pertama di layar)
 * />
 *
 * Pattern untuk gambar fill (cover card):
 *
 * <div className="relative h-48 w-full">
 *   <Image
 *     src={project.thumbnail}
 *     alt={project.title}
 *     fill
 *     className="object-cover"
 *     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 *   />
 * </div>
 *
 * Catatan:
 * - `sizes` prop SANGAT penting untuk performa — bantu browser pilih ukuran yang tepat
 * - `priority` hanya untuk LCP (above the fold). Jangan overuse.
 * - `unoptimized` hanya untuk URL eksternal dinamis bila benar-benar perlu
 */

// ─────────────────────────────────────────────
// CODE SPLITTING
// ─────────────────────────────────────────────

/**
 * LazyMotion dari Framer Motion — WAJIB pakai ini, bukan `motion` langsung.
 * Mengurangi bundle size ~80KB.
 *
 * import { LazyMotion, domAnimation, m } from "framer-motion"
 *
 * <LazyMotion features={domAnimation}>
 *   <m.div variants={fadeUp}>...</m.div>
 * </LazyMotion>
 *
 * Jangan: import { motion } from "framer-motion" — ini load semua fitur.
 */

/**
 * Dynamic import untuk komponen berat:
 *
 * import dynamic from "next/dynamic"
 *
 * const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
 *   loading: () => <Skeleton />,
 *   ssr: false, // kalau butuh browser API
 * })
 */

// ─────────────────────────────────────────────
// RENDERING STRATEGY
// ─────────────────────────────────────────────

/**
 * Hierarki rendering Next.js App Router:
 *
 * Server Component (default) → Render di server, 0 JS ke client
 *   ✅ Fetching data, static content, layout
 *   ❌ useState, useEffect, event handlers, browser APIs
 *
 * "use client" → Render di server + hydrate di client
 *   ✅ Interaktivitas, animasi, hooks
 *   ❌ Jangan taruh di root layout — isolasi ke leaf components
 *
 * Pola yang bagus: Server fetches → pass data → Client renders
 *
 * // ServerComponent.tsx (no "use client")
 * async function ProjectList() {
 *   const projects = await fetchProjects()
 *   return <ProjectGrid projects={projects} /> // Client Component
 * }
 */

// ─────────────────────────────────────────────
// WILL-CHANGE OPTIMIZATION
// ─────────────────────────────────────────────

/**
 * Gunakan `will-change-transform transform-gpu` pada elemen yang di-animate.
 * Ini memindahkan rendering ke GPU compositor thread.
 *
 * ✅ Pakai untuk: drag, slide, fade yang sering terjadi
 * ⚠️ Jangan overuse — bisa boros memory
 *
 * Tailwind: className="will-change-transform transform-gpu"
 */

// ─────────────────────────────────────────────
// INTERVAL / TIMER CLEANUP
// ─────────────────────────────────────────────

/**
 * SELALU cleanup interval/timeout di useEffect.
 * Contoh:
 *
 * useEffect(() => {
 *   const id = window.setInterval(fetchNowPlaying, 30_000)
 *   return () => window.clearInterval(id)  // ← cleanup
 * }, [])
 */

// ─────────────────────────────────────────────
// FONT LOADING
// ─────────────────────────────────────────────

/**
 * Pakai next/font — otomatis self-host, zero CLS, zero layout shift.
 *
 * import { Geist } from "next/font/google"
 * const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
 *
 * Jangan import font via <link> di HTML — ini blocking.
 */

export {}; // Membuat file ini sebagai modul
