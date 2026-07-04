# PRD — Landing Page altomebay

**Versi:** 0.1 (Draft) | **Tanggal:** 4 Juli 2026 | **Status:** Draft
**Catatan:** Ini PRD yang di-*right-size* untuk sebuah landing page satu halaman, bukan template SaaS penuh. Bagian SaaS (multi-tenancy, langganan, churn, unit economics) sengaja dihilangkan karena tidak berlaku.

> ⚠️ Semua konten bertanda **[GANTI]** adalah placeholder/asumsi. Silakan ubah kapan saja.

---

## 1. Ringkasan

Landing page satu halaman untuk **altomebay**, toko sembako keluarga (nama dari **AL**imah, sugian**TO**, **ME**lia, **BA**yu). Toko menjual barang pokok, jajanan, rokok, pulsa, e-wallet (DANA), depot air isi ulang, dan lainnya — tersedia **grosir (per pack)** maupun **eceran (satuan)**.

Halaman ini berfungsi sebagai **etalase digital yang bisa dibagikan**: pengunjung membuka, melihat foto & katalog kategori + harga, lalu diarahkan ke WhatsApp atau Google Maps. Gaya visual: **clean & modern**, mobile-first.

---

## 2. Positioning yang Jujur (apa halaman ini BISA & TIDAK BISA)

Bagian ini sengaja ditulis supaya ekspektasi realistis dan desain fokus.

**BISA:**
- Jadi etalase yang di-scan lewat **QR code** (tempel di kaca toko / spanduk) → orang lihat produk & harga.
- Ditaruh sebagai link di **bio/status WhatsApp** dan sosial media.
- Mempermudah pelanggan menemukan lokasi (tombol ke Google Maps) dan menghubungi (tombol WhatsApp).

**TIDAK BISA (dan bukan tujuannya):**
- Bukan alat "ditemukan di Google". Toko sembako itu bisnis **walk-in + pelanggan tetap sekitar**; orang tidak mencari toko sembako via search engine.
- Senjata digital terbesar toko sembako sebenarnya **Google Business Profile + WhatsApp**. Landing page ini **pelengkap**, bukan pengganti keduanya.

> **Rekomendasi terpisah (bukan bagian build):** buat/klaim **Google Business Profile** altomebay. Efeknya untuk ditemukan dan didatangi jauh lebih besar daripada landing page mana pun.

---

## 3. Target Pengunjung

**Persona A — Tetangga/Pelanggan Sekitar**
- Konteks: tinggal/kerja dekat toko, sudah/hampir jadi pelanggan.
- Tujuan: cek apakah barang yang dibutuhkan ada, kira-kira harga, jam buka.
- Aksi diharapkan: lihat kategori → hubungi WA untuk tanya stok / lihat lokasi.

**Persona B — Calon Pelanggan Baru (scan QR / dapat link)**
- Konteks: lewat depan toko lalu scan QR, atau dapat share link dari orang lain.
- Tujuan: cepat paham "toko ini jual apa saja" dan "seberapa lengkap".
- Aksi diharapkan: lihat foto & detail → simpan lokasi / chat WA.

Aksi utama yang dipilih founder: **"lihat foto & detail dulu"** → maka halaman harus **foto-forward dan cepat**, dengan jalur ke WA/Maps sebagai langkah kedua.

---

## 4. Tujuan & Metrik (right-sized)

Tidak ada churn/MRR di sini. Metrik yang masuk akal untuk etalase:

| Tujuan | Metrik | Cara ukur |
|---|---|---|
| Orang benar-benar melihat katalog | Kunjungan halaman & scroll depth | Analytics sederhana (mis. Vercel/Umami/GA) |
| Konversi ke kontak | Klik tombol **WhatsApp** | Event klik |
| Konversi ke kunjungan | Klik tombol **Lihat Lokasi (Maps)** | Event klik |

**North star praktis:** jumlah klik WhatsApp + klik Maps per bulan. Kalau ini bergerak, halaman bekerja.

---

## 5. Struktur Halaman (urutan atas → bawah)

1. **Sticky top bar / nav ringkas** — logo altomebay + tombol WA (selalu terlihat).
2. **Hero** — nama + tagline ("Sembako lengkap, grosir & eceran"), foto toko, 2 tombol: WhatsApp & Lihat Lokasi.
3. **Kategori produk** — kartu bergambar: Sembako • Jajanan • Rokok • Pulsa & Data • DANA/e-wallet • Depot Air Isi Ulang.
4. **Kenapa belanja di altomebay** — 3–4 poin: bisa grosir & eceran, lengkap, dekat, ramah/keluarga.
5. **Tentang** — cerita singkat toko keluarga (asal nama Alimah–Sugianto–Melia–Bayu). Membangun kepercayaan.
6. **Lokasi & Jam Buka** — embed peta + alamat + jam.
7. **Footer** — kontak, WhatsApp, (sosmed bila ada), copyright.
8. **Sticky mobile CTA bar** (di HP) — tombol **WhatsApp** + **Lokasi** menempel di bawah layar.

---

## 6. Konten per Section (placeholder ditandai)

- **Nama toko:** altomebay
- **Tagline:** "Sembako lengkap, grosir & eceran — dekat dan ramah." *(bisa diganti)*
- **Kategori & contoh isi:**
  - Sembako: beras, minyak, gula, telur, dll.
  - Jajanan & snack
  - Rokok
  - Pulsa & paket data
  - DANA / top-up e-wallet
  - Depot air isi ulang (galon)
- **Nomor WhatsApp:** **[GANTI: 62812xxxxxxx]**
- **Alamat:** **[GANTI: alamat lengkap]**
- **Link Google Maps:** **[GANTI: url maps / koordinat]**
- **Jam buka:** **[GANTI: mis. Setiap hari 06.00–22.00]**
- **Foto:** **[GANTI: foto toko + foto rak/produk]** → sementara pakai placeholder rapi.

---

## 7. Design System — Clean & Modern

Sistem token yang dipakai konsisten di seluruh halaman.

**Warna**
| Peran | Nilai | Catatan |
|---|---|---|
| Base / background | `#FFFFFF` & `#FAFAF8` | putih bersih + off-white lembut |
| Ink (teks utama) | `#1A1A1A` | near-black, kontras tinggi |
| Teks sekunder | `#5A5A5A` | keterangan, caption |
| Aksen utama (brand) | `#1F7A4D` | hijau tua = segar & terpercaya (grocery) |
| Aksen hangat | `#F5A623` | amber, dipakai hemat untuk highlight |
| WhatsApp | `#25D366` | khusus tombol WA (dikenali orang) |
| Garis / divider | `#ECECEC` | border kartu, pemisah |

**Tipografi**
- Font: **Plus Jakarta Sans** (modern, buatan Indonesia, sangat clean) — fallback **Inter**, lalu system-ui.
- Skala: Display 40–48px / H2 28–32px / H3 20px / Body 16px / Caption 14px.
- Heading `font-weight: 700`, body `400–500`. Line-height body ~1.6.

**Spacing** — skala kelipatan 4: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Section padding vertikal 64–96px (desktop), 40–56px (HP).

**Bentuk & elevasi**
- Radius: kartu `16px`, tombol `pill` (999px), input `12px`.
- Shadow: halus & rendah (`0 1px 3px rgba(0,0,0,.06)`, hover `0 6px 20px rgba(0,0,0,.08)`).

**Komponen**
- **Button primary:** solid hijau `#1F7A4D`, teks putih, pill.
- **Button WhatsApp:** solid `#25D366`, ikon WA + teks.
- **Button secondary:** outline tipis, teks ink.
- **Category card:** gambar + label + 1 baris contoh isi, hover naik halus.
- **Sticky mobile CTA bar:** 2 tombol lebar penuh (WA + Lokasi).

**Rasa yang dituju:** rapi seperti minimarket modern, tetap hangat (toko keluarga), cepat dibuka di HP.

---

## 8. Functional Requirements

- **FR-01 — Tombol WhatsApp:** membuka `https://wa.me/[NOMOR]` dengan pesan pra-isi, mis. *"Halo altomebay, saya mau tanya stok…"*. Muncul di nav, hero, dan sticky bar.
- **FR-02 — Tombol Lokasi:** membuka Google Maps toko di tab baru.
- **FR-03 — Katalog kategori:** minimal 6 kartu kategori bergambar, responsif (grid → 1 kolom di HP).
- **FR-04 — Responsif & mobile-first:** rapi dari 320px sampai desktop.
- **FR-05 — Performa:** halaman statis ringan, target buka < 2 detik di 4G; gambar dioptimasi/lazy-load.
- **FR-06 — Aksesibilitas dasar:** kontras cukup, alt text gambar, target tap ≥ 44px.
- **FR-07 — Analytics event (opsional tahap 2):** track klik WA & Maps.

---

## 9. Rekomendasi Teknis

Landing page statis, tanpa backend — paling murah, cepat, dan tahan lama.

| Kategori | Rekomendasi | Alasan |
|---|---|---|
| Build | Satu file **HTML + CSS** (bisa +sedikit JS) | Simpel, mudah kamu edit sendiri |
| Font | Google Fonts (Plus Jakarta Sans) | Gratis, modern |
| Hosting | **Netlify / Vercel / GitHub Pages** (gratis) | Tanpa server, bisa custom domain |
| Peta | Embed Google Maps / link ke Maps | Tak perlu API berbayar untuk sekadar link |
| QR code | Generate dari URL final | Untuk ditempel di toko |

*Tidak perlu:* database, login, framework berat, vector DB. Semua itu overkill untuk satu halaman.

---

## 10. Asumsi & Yang Harus Kamu Ganti

- [ ] Nomor WhatsApp asli
- [ ] Alamat lengkap + link Google Maps
- [ ] Jam buka
- [ ] Foto toko & produk asli (ganti placeholder)
- [ ] Tagline final (kalau mau ubah)
- [ ] Sosial media (kalau ada) untuk footer
- [ ] (Disarankan) buat Google Business Profile — di luar scope build ini

---

## 11. Next Step

Setelah kamu setuju arah ini, langkah berikutnya adalah **membangun halaman HTML asli** dari PRD ini — bisa langsung kamu buka, lihat, dan edit. Placeholder aku pasang rapi supaya tinggal ganti.
