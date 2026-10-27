# Migrasi Tailwind CSS v4

Migrasi mempertahankan tampilan hasil penyempurnaan BoardUI sebelumnya. Tidak ada perubahan copy, struktur DOM, data kontak, font, aset, atau dependency.

## Pendekatan

- Tailwind v4 dan `@tailwindcss/postcss` yang sudah terpasang tetap dipakai; tidak menambahkan konfigurasi Tailwind v3.
- Styling statis komponen dipindahkan ke utility pada `className`: layout flex/grid, alignment, gap, ukuran, padding, warna, dan container.
- Aturan yang berbagi selector, responsive, state, dan typography dikomposisikan dengan `@apply` di stylesheet yang ada. Ini sengaja mempertahankan specificity dan urutan cascade lama, sehingga migrasi bukan redesign.
- Nilai token tetap berasal dari `app/design-tokens.css` dan `@theme`. Arbitrary utilities mempertahankan nilai lama yang tidak tepat dipetakan ke skala default, termasuk geometri ilustrasi.
- Reset margin dan aturan intrinsik `:where(...)` berada di `@layer base`, agar utility komponen tidak tertimpa reset.
- CSS khusus tetap dipakai untuk keyframes, gradient, variasi font, transform, serta aturan yang memang bergantung pada selector atau container query. Tidak semua stylesheet dihapus.
- `hero.css` memakai `@reference "../../app/globals.css"` agar `@apply` mengenali tema tanpa menduplikasi output Tailwind.

## Lokasi pengaturan

| Kebutuhan | Lokasi |
| --- | --- |
| Layout individual | `className` pada komponen di `components/` |
| Palette dan font utama | blok `@theme` di `app/globals.css` |
| Spacing, radius, ukuran button | `app/design-tokens.css` |
| Typography bersama | `app/typography.css` |
| Aturan shared/state/responsive | `@apply` di `app/globals.css` |
| Hero dan marquee | `components/sections/Hero.tsx` dan `hero.css` |
| Button reusable dan label | `components/ui/Button.tsx` |

Contoh: `flex items-center gap-2`, `grid`, `mx-auto`, `rounded-card`, `text-ink-soft`, dan utility token seperti `[padding:var(--section-space)_0]`. Pada aturan CSS bersama, ubah daftar `@apply`, bukan menambahkan deklarasi lain yang menduplikasi utility.

Hook semantic seperti `.category-grid`, `.hero-gallery`, dan `.action` tetap dipertahankan untuk state, selector anak, dan inspeksi. Mereka dapat berdampingan dengan utility Tailwind. Aturan shared yang belum dilayer tetap mengikuti prioritas cascade lama; untuk menyesuaikannya, edit komposisi `@apply` atau token terkait.

## Validasi

Baseline disimpan dari static export sebelum migrasi, lalu dibandingkan dengan static export sesudah migrasi pada browser yang sama. Pada masing-masing viewport, 305 elemen dibandingkan untuk lebar/tinggi, typography, warna, background, padding/margin, gap, kolom grid, border/radius, shadow, overflow, alignment, flex, serta nama/durasi animasi.

| Viewport CSS | Lebar client/dokumen | Perbedaan properti yang dibandingkan |
| --- | --- | --- |
| 320 px | 305 / 305 px | 0 |
| 390 px | 375 / 375 px | 0 |
| 768 px | 753 / 753 px | 0 |
| 1440 px | 1425 / 1425 px | 0 |

Scrollbar browser menghabiskan 15 px; tidak ada overflow horizontal dokumen. Perbandingan ini bukan klaim pixel-diff seluruh halaman: posisi track marquee terus berubah karena animasi. Screenshot desktop/mobile juga diperiksa.

- Menu mobile: dapat dibuka; aria-expanded benar; Escape menutup.
- Fokus galeri: outline merah 3 px, offset −3 px, dan marquee berhenti (`animation-play-state: paused`) identik dengan baseline.
- Lint, TypeScript, dan build produksi/static export lulus.
- Aturan reduced-motion, container reflow, safe-area, dan focus-visible dipertahankan. Emulasi reduced-motion, 200% text zoom, dan audit aksesibilitas menyeluruh tidak ditambahkan pada migrasi ini.
