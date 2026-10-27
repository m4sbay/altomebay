# Audit dan adaptasi BoardUI → Altomebay

Tanggal: 27 Oktober 2026. Referensi: https://www.boardui.com/ dan screenshot pengguna.

## 1. Audit referensi

Browser awalnya timeout, lalu berhasil diakses. Angka berikut adalah computed style halaman yang diamati, bukan klaim seluruh token internal BoardUI. Konten heading berubah lewat animasi. Viewport 1440 dan 390 CSS px; scrollbar browser memakai 15 px.

| Peran | BoardUI desktop 1440 | BoardUI mobile 390 |
| --- | --- | --- |
| Font | Inter + system fallback | sama |
| H1 | 72 px / 84 px, 500, tracking −1.44 px | 36 px / 43 px, 500, tracking −0.72 px |
| Deskripsi hero | 16 px / 21 px, 500; max-width 612 px | 15 px / 21 px, 500 |
| H2 konten komponen | 48 px / 53 px, 500, tracking −0.96 px | belum diukur |
| H3 judul komponen | 16 px / 22 px, 500 | belum diukur |
| H4 | tidak ditemukan pada DOM yang diperiksa | tidak ditemukan |
| CTA utama | 14 px / 20 px, 500; padding 8 px; radius 10 px | sama; tinggi 36 px |
| Wrapper intro | max-width 980 px; padding 54 px 24 px 0 | padding 17 px 20 px 0 |
| Shadow CTA | 0 1px 2px rgba(0,0,0,.05) | belum diukur terpisah |
| Transition CTA | warna/border/shadow 150 ms; transform 420 ms | belum diuji interaksinya |

Pada mobile, jarak badge → H1 20 px; H1 → deskripsi 16 px; deskripsi → CTA 16 px. Screenshot memperlihatkan alignment terpusat di desktop, alignment kiri di mobile, whitespace lapang, card netral, radius lembut, dan hierarki yang hemat bobot. Altomebay mempertahankan komposisi hero terpusat yang sudah ada.

Nilai seluruh padding section, gap showcase, radius card, breakpoint internal, dan hover/focus BoardUI belum diukur lengkap. Jangan menganggap angka adaptasi di bawah sebagai salinan CSS BoardUI. Tidak ada aset, logo, atau copywriting BoardUI yang dipindahkan.

## 2. Audit Altomebay dan mapping token

Sudah baik: warna terpusat di `@theme`, skala rem di typography.css, font melalui next/font, Button reusable, data kontak terpusat, reflow/container queries, focus-visible, serta reduced-motion. Struktur section dan tautan kontak dipertahankan.

Masalah: spacing px yang hampir sama tetapi berbeda tersebar dalam global CSS; radius 6/8/9/10/12/20 px; gap layanan 25 px vs kategori 24 px; hero override sampai 104 px/bobot 800 vs heading lainnya 600; eyebrow hero kehilangan kelasnya. Permukaan manfaat menggunakan warna border sebagai latar luas. Card layanan tidak mempunyai padding horizontal yang sebanding dengan card lain.

Semua angka px di tabel di bawah setara pada root default 16 px. Implementasi memakai rem dan basis `--spacing` Tailwind v4 yang sudah tersedia.

| Peran | Sebelum | Keputusan adaptasi / token |
| --- | --- | --- |
| Warna dan font identitas | merah, Plus Jakarta Sans, hero Bricolage | gunakan kembali tanpa mengganti aset atau palette |
| H1 hero | 40–104 px, 800, leading 1.04 | `--type-hero`: 40–80 px, 700; leading display lama 1.15; tracking −.04em |
| H2/H3/H4, body, label | skala semantic 30–36 / 24–30 / 20–24 / 16 / 14 | gunakan kembali typography.css |
| Hero description | 18–24 px | gunakan kembali `--type-body-large` 18 px; leading 1.5 |
| Container | 1184 px | `--container-page`: 74rem (dipertahankan) |
| Gutter | 40 / 24 / 20 px | `--page-gutter`: skala sama, di satu tempat |
| Section | 100 / 75 / 58 px | `--section-space`: 96 / 80 / 64 px |
| Heading → grid | 36 / 25 px | `--heading-gap`: 40 / 32 px |
| Grid gap | kategori 24, layanan 25 px | `--grid-gap`: 24 desktop, 20 mobile; kategori mobile 24 × 16 |
| Dua kolom about/lokasi | 85 / 45 / 30–32 px | `--layout-gap`: 64 / 40 / 32 px |
| Card padding | nilai terpisah | `--card-padding`: 24 / 20 px |
| Radius kontrol | 6 px | `--radius-control`: 12 px |
| Radius card | 8–20 px | `--radius-card`: 20 px; pill tetap penuh |
| Button | min-height 48, touch minimum 44 px | dipertahankan via `--control-height`, `--touch-target` |
| Icon gap / padding button | 12 / 13 × 21 px | `--control-gap`: 8; `--control-padding`: 12 × 20 px |
| Measure | max-width tersebar | `--measure-copy`: 42ch; `--measure-hero`: 52ch; H1 tetap 15ch |
| Border / shadow | palette border dan shadow-soft | gunakan kembali; layanan mendapat border 1 px dan shadow-soft |
| Transition | .2 / .3s terpisah | kontrol memakai `--duration-ui`: 180 ms; hover naik 1 px |
| Breakpoints | 640, 900, 1051 px dan reflow berbasis isi | dipertahankan; Tailwind sm/md/lg tetap bawaan; nav 56.25rem didaftarkan |

Alasan berbeda dari BoardUI: font identitas dipertahankan, body minimum lebih nyaman, kontrol minimal 44 px untuk sentuh, radius card memakai nilai hero yang sudah tersedia. Geometri ilustrasi, orbit, brick, dan animasi marquee tetap mempunyai ukuran intrinsik tersendiri.

## 3. Implementasi

`app/design-tokens.css` menjadi sumber token komposisi dan didaftarkan melalui mekanisme `@theme` Tailwind 4. `globals.css` mengonsumsi token untuk container, section, grid, card, kontrol, dan whitespace. Styling hero tetap scoped di hero.css. Tidak ada dependency baru, perubahan data, routing, atau struktur section.

## 4. Validasi

- Lint dan TypeScript: lulus.
- Browser: desktop 1440, tablet 768, mobile 390, sempit 320 px. Lebar dokumen sama dengan client width (1425/753/375/305 px); tidak ada overflow horizontal dokumen.
- Visual hero desktop/tablet/mobile diperiksa. Kategori desktop diperiksa; headline, card, radius, dan container tetap sejajar.
- Tombol hero mobile terukur 50 dan 44 px; CTA bawah pada 320 px tumbuh menjadi 74 px karena label membungkus, tanpa clipping.
- Menu mobile dapat dibuka, aria-expanded benar, Escape menutup menu dan mengembalikan focus. Focus ring terlihat. CTA kategori tetap menuju #kategori; kontak WhatsApp/Maps tetap memakai konfigurasi resmi.
- Reduced-motion dan aturan reflow lama dipertahankan. Uji khusus pembesaran 200%, text-spacing override, dan audit aksesibilitas menyeluruh belum dijalankan.
- Build awal gagal mengunduh Google Fonts di lingkungan jaringan terbatas; build ulang dengan akses jaringan lulus, termasuk kompilasi, TypeScript, dan static export.

## Koreksi button dari screenshot pengguna

Button standar diperbarui menjadi 14/20px, weight 500, padding 8px, radius 10px, tinggi minimum 36px. Lebar mengikuti konten, bukan dipatok 141px karena label dan font berbeda. Plus Jakarta Sans tetap dipakai untuk identitas Altomebay. Border memakai inset outline agar tinggi tidak bertambah menjadi 38px. Sticky CTA mobile tetap minimum 44px. Mapping button sebelumnya di atas digantikan oleh koreksi ini.

## Inspeksi struktur button lanjutan

Inspeksi DOM BoardUI menemukan span label dengan padding horizontal 4px di dalam button berpadding 8px, gap 2px, ikon 20px. Primary memiliki background linear-gradient; secondary putih dengan border netral 1px dan shadow 0 1px 2px rgba(0,0,0,.05). Detail label sebelumnya terlewat. Button reusable dan CTA hero kini memakai wrapper label tersebut; primary memakai gradient merah brand, secondary memakai permukaan putih netral. Gap pasangan CTA hero 8px. Font brand dipertahankan; lebar label mengikuti font/konten Altomebay. Hover lift dihapus dan press memakai scale ringan.
