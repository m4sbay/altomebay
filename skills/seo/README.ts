/**
 * SEO & Metadata — Patterns untuk Next.js App Router
 *
 * Panduan implementasi SEO di project Next.js 14+.
 * Semua halaman wajib punya metadata yang lengkap.
 */

// ─────────────────────────────────────────────
// ROOT LAYOUT METADATA
// ─────────────────────────────────────────────

/**
 * Sudah diimplementasi di app/layout.tsx.
 * Ini adalah default yang di-inherit semua halaman.
 *
 * export const metadata: Metadata = {
 *   metadataBase: new URL("https://masbay.dev"),
 *   title: {
 *     default: "Masbay — Frontend Dev & UI/UX",
 *     template: "%s — Masbay",  // ← halaman child tinggal set title pendek
 *   },
 *   description: "...",
 *   openGraph: { ... },
 *   twitter: { ... },
 * }
 */

// ─────────────────────────────────────────────
// PER-PAGE METADATA
// ─────────────────────────────────────────────

/**
 * Setiap page.tsx atau layout.tsx bisa export metadata-nya sendiri.
 *
 * // app/about/page.tsx
 * import type { Metadata } from "next"
 *
 * export const metadata: Metadata = {
 *   title: "About",       // ← jadi: "About — Masbay"
 *   description: "Kenalan sama Masbay — frontend dev yang suka hal-hal minimal.",
 *   openGraph: {
 *     title: "About — Masbay",
 *     description: "...",
 *     images: [{ url: "/og/about.png" }],
 *   },
 * }
 */

// ─────────────────────────────────────────────
// DYNAMIC METADATA (untuk /work/[slug])
// ─────────────────────────────────────────────

/**
 * // app/work/[slug]/page.tsx
 * import type { Metadata } from "next"
 *
 * export async function generateMetadata(
 *   { params }: { params: Promise<{ slug: string }> }
 * ): Promise<Metadata> {
 *   const { slug } = await params
 *   const project = await getProjectBySlug(slug)
 *
 *   return {
 *     title: project.title,
 *     description: project.description,
 *     openGraph: {
 *       title: project.title,
 *       description: project.description,
 *       images: [{ url: project.thumbnail }],
 *     },
 *   }
 * }
 */

// ─────────────────────────────────────────────
// OPEN GRAPH IMAGE
// ─────────────────────────────────────────────

/**
 * Buat file app/opengraph-image.tsx untuk auto-generate OG image:
 *
 * import { ImageResponse } from "next/og"
 *
 * export const runtime = "edge"
 * export const size = { width: 1200, height: 630 }
 *
 * export default function OGImage() {
 *   return new ImageResponse(
 *     <div style={{ ... }}>Masbay — Portfolio</div>
 *   )
 * }
 */

// ─────────────────────────────────────────────
// ROBOTS & SITEMAP
// ─────────────────────────────────────────────

/**
 * Auto-generate robots.txt:
 * // app/robots.ts
 * import type { MetadataRoute } from "next"
 *
 * export default function robots(): MetadataRoute.Robots {
 *   return {
 *     rules: { userAgent: "*", allow: "/" },
 *     sitemap: "https://masbay.dev/sitemap.xml",
 *   }
 * }
 *
 * Auto-generate sitemap.xml:
 * // app/sitemap.ts
 * import type { MetadataRoute } from "next"
 *
 * export default function sitemap(): MetadataRoute.Sitemap {
 *   return [
 *     { url: "https://masbay.dev", lastModified: new Date() },
 *     { url: "https://masbay.dev/about", lastModified: new Date() },
 *     // tambah halaman dinamis dari data
 *   ]
 * }
 */

// ─────────────────────────────────────────────
// STRUCTURED DATA (JSON-LD)
// ─────────────────────────────────────────────

/**
 * Tambahkan schema.org untuk rich snippets:
 *
 * // Taruh di komponen page atau layout
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify({
 *       "@context": "https://schema.org",
 *       "@type": "Person",
 *       name: "M. Maulana Bayu",
 *       jobTitle: "Frontend Developer",
 *       url: "https://masbay.dev",
 *     }),
 *   }}
 * />
 */

// ─────────────────────────────────────────────
// CHECKLIST PER HALAMAN
// ─────────────────────────────────────────────

/**
 * ✅ <title> unik dan deskriptif (< 60 karakter)
 * ✅ <meta description> menarik (120–158 karakter)
 * ✅ Satu <h1> per halaman
 * ✅ Hirarki heading logis (h1 → h2 → h3)
 * ✅ Semua gambar punya alt text
 * ✅ Link deskriptif (bukan "klik di sini")
 * ✅ Open Graph image (1200×630px)
 * ✅ canonical URL
 */

export {};
