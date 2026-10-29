# Menghubungkan Admin Altomebay ke Neon dan Vercel

## Status saat ini — 29 Oktober 2026

**Cutover Neon–Vercel terverifikasi pada 30 Oktober 2026 WIB.** Proyek `dawn-queen-18195621`, branch `production`, memakai schema aplikasi; TLS terverifikasi, dan pooled `DATABASE_URL` terpasang sebagai secret Vercel Production. Pemilik berhasil menyimpan transaksi melalui situs production. Setelah deployment kedua READY, pembandingan seluruh data keuangan dengan baseline menghasilkan `snapshotMatches:true`: 2 transaksi tetap tersimpan (pemasukan Rp1.000.000, pengeluaran Rp10.000, selisih Rp990.000), beserta jenis/batch/link item yang sama. GET `/` dan `/admin` setelah redeploy tetap HTTP 200. Pengujian UI/auth/batch melalui HTTP memakai Neon branch terpisah juga lulus. Dua transaksi impor lama yang sengaja dihapus pemilik tidak dipulihkan; SQLite asli dan backup tetap utuh. Rincian bukti dan batas pemeriksaan ada pada bagian terakhir.

Runtime aplikasi sekarang hanya memakai PostgreSQL. Jika environment database kosong/salah, aplikasi memberikan error aman; aplikasi tidak membuat direktori `data`, tidak membuka SQLite, dan tidak mencoba menulis `/var/task/data`. SQLite hanya digunakan oleh alat backup/impor offline. UI normal dan design system tidak diubah.

Backup lokal sudah dibuat, tanpa menimpa/menghapus sumber:

`data/backups/admin-before-neon-2026-10-29.sqlite`

Backup awal ini berisi 2 transaksi dan telah diuji di PostgreSQL embedded. Backup final baru `data/backups/admin-neon-cutover-20261029.sqlite` kemudian berhasil diimpor dan dibandingkan semua kolomnya di Neon production. Jumlah data: 2 transaksi, 5 expense types, 1 batch dan 1 item link; pemasukan Rp5.000.000, pengeluaran Rp1.000.000. Sumber SQLite tetap utuh. Jika ada transaksi baru di aplikasi lama setelah backup final, hentikan penulisan dan rekonsiliasi sebelum cutover; impor ini bukan sinkronisasi dua arah.

## 1. Siapkan Neon dari awal

1. Buka [Neon Console](https://console.neon.tech/) dan masuk/buat akun sendiri.
2. Pilih **New Project**, beri nama misalnya `altomebay-admin`, pilih region yang dekat dengan lokasi Vercel Functions, lalu buat project. Catat project, branch dan nama database yang dipilih.
3. Gunakan satu branch/database untuk production. Untuk development/Preview, gunakan branch terpisah agar percobaan tidak mengubah keuangan toko.
4. Di project Neon, klik **Connect**, pilih branch, database dan role yang benar.
5. Aktifkan **Connection pooling**. Salin connection string secara privat. Host pooled mengandung `-pooler` dan URL Neon menggunakan TLS (`sslmode=require`). Ini menjadi `DATABASE_URL`.
6. Matikan pooling pada panel Connect untuk mendapatkan URL direct dari branch/database yang **sama**. Ini menjadi `DATABASE_URL_UNPOOLED` untuk alat migrasi lokal. URL direct opsional, tetapi disarankan untuk tooling.

Tidak perlu memasang Prisma, membuat SQLite baru, atau membeli persistent disk Vercel. Koneksi runtime memakai `pg` dengan pool kecil dan pengelolaan idle connections Vercel. Pilihan ini mengikuti [pooling Neon](https://neon.com/docs/connect/connection-pooling) dan [panduan koneksi Vercel](https://vercel.com/kb/guide/connection-pooling-with-functions).

## 2. Pasang environment lokal

Gunakan Node.js **22.16+** atau LTS lebih baru yang memenuhi `package.json`. Minimum ini juga mendukung alat backup SQLite.

Buka `.env.local` di root project. Tambahkan dua nilai dari panel Connect. Jangan mengganti `ADMIN_PASSWORD_HASH` yang sudah valid.

```dotenv
DATABASE_URL="<connection string pooled dari Neon>"
DATABASE_URL_UNPOOLED="<connection string direct dari branch/database yang sama>"
ADMIN_PASSWORD_HASH="<nilai existing yang tetap dipertahankan>"
```

Teks di dalam `<...>` adalah petunjuk, bukan nilai yang bisa dipakai. Lihat `.env.example` untuk nama variabel. Jangan kirim connection string/password/hash ke chat atau commit ke Git. Variabel tidak memakai prefix `NEXT_PUBLIC_`.

`ADMIN_DATABASE_PATH` tidak lagi dipakai oleh aplikasi. Boleh menyimpan file SQLite lama di tempatnya; tidak ada fallback ke file tersebut. Tooling akan menolak jika URL pooled/direct lokal mengarah ke target berbeda. Script memakai `@next/env`, jadi `.env.local` terbaca juga di luar Next.js. Nilai environment proses memiliki prioritas atas file.

## 3. Backup final dan hentikan penulisan SQLite lama

Sebelum cutover, hentikan pencatatan di versi SQLite lama. Tunggu request penulisan yang berjalan selesai. Selama migrasi, jangan mencatat transaksi di aplikasi SQLite lama dan aplikasi PostgreSQL secara bergantian; alat ini bukan sinkronisasi dua arah.

Backup yang sudah dibuat boleh dipakai jika sumber tidak berubah. Untuk snapshot final yang lebih baru, gunakan **nama file baru**, misalnya:

```sh
npm run db:backup -- --source data/admin.sqlite --output data/backups/admin-final-before-neon.sqlite
```

Alat memakai online backup API SQLite, termasuk data committed yang masih berada di WAL. File sumber dibuka read-only. Tujuan direservasi sebagai file baru dengan izin privat; file existing tidak ditimpa. Tidak ada file sumber/WAL yang dihapus. Setelah langkah ini gunakan path backup final yang benar pada semua perintah berikut; contoh di bawah memakai backup yang sudah dibuat.

## 4. Buat schema PostgreSQL

Pastikan kedua URL lokal menunjuk database Neon yang dituju, lalu jalankan:

```sh
npm run db:migrate
npm run db:migrate -- --check
```

Hasil migrasi pertama: `version: 1`, `applied: true`. Pengulangan yang sama memberikan `applied: false`. Semua DDL dijalankan dalam transaksi dengan advisory lock dan checksum. Tidak ada `DROP`, `TRUNCATE`, reset database, atau penghapusan tabel/data. Target baru harus belum memiliki tabel aplikasi yang bentrok; jika bentrok, migrasi berhenti, bukan menimpa.

Schema berada di `migrations/001_neon.sql`. Setelah diterapkan, jangan mengedit migrasi itu di production; perubahan berikutnya memerlukan versi migrasi baru. Perintah build dan request aplikasi **tidak** menjalankan migrasi secara otomatis.

## 5. Periksa dan impor data lama

Pemeriksaan awal tanpa koneksi/writes Neon:

```sh
npm run db:import -- --source data/backups/admin-before-neon-2026-10-29.sqlite
```

Hasil `mode: dry-run` menampilkan jumlah record, total, digest sumber dan jumlah tanggal yang memiliki rekap penjualan legacy ganda. Tidak mencetak password, hash sesi, catatan atau detail transaksi. Periksa bahwa jumlah/total sesuai aplikasi lama.

Setelah hasil sesuai dan penulisan sumber/tujuan dihentikan, jalankan:

```sh
npm run db:import -- --source data/backups/admin-before-neon-2026-10-29.sqlite --apply
npm run db:import -- --source data/backups/admin-before-neon-2026-10-29.sqlite --verify
npm run db:verify
```

`--apply` menyalin record sambil mempertahankan ID, nominal, tanggal, timestamp, kategori, jenis custom, batch/link, catatan, sesi hashed dan pembatasan login. Semua insert dan pemeriksaan tiap kolom dijalankan dalam satu transaksi. Impor sama dapat diulang tanpa menduplikasi record. Jika target punya record ber-ID sama dengan isi berbeda, seluruh impor dibatalkan; tidak ada update/overwrite otomatis. Kegagalan referensi/constraint juga me-rollback seluruh impor.

Rekap penjualan legacy yang ganda tidak digabung/dihapus. Pengecualian untuk memasukkan record lama hanya aktif secara transaction-local pada alat impor saat tabel penulisan terkunci; setelah commit, aturan penolakan duplikat baru aktif lagi. Tidak ada trigger yang dinonaktifkan atau constraint yang dihapus.

`--verify` membandingkan semua record sumber, bukan menghapus record tambahan di target. Lakukan verifikasi sumber ini sebelum aktivitas baru mengedit record di Neon: perubahan keuangan/session yang sah setelah cutover dapat membuat perbandingan snapshot lama berbeda. Itu harus ditinjau, bukan ditimpa.

`db:verify` memakai koneksi PostgreSQL read-only, memeriksa versi schema dan TLS, lalu mengeluarkan digest data keuangan, counts dan total. Nilai uang ditampilkan sebagai integer Rupiah. Identitas target ditampilkan sebagai hash; kredensial/hostname mentah tidak dicetak. Hasil sukses alat lokal ini belum membuktikan bahwa deployment Vercel memakai environment yang benar.

## 6. Uji aplikasi pada branch Neon uji

Sebelum mengarahkan production, idealnya ulangi schema/import pada branch uji Neon dan gunakan URL branch itu untuk menjalankan aplikasi lokal:

```sh
npm run dev
```

Buka `/admin`, login dengan password existing, dan periksa:

- Pemasukan, pembatasan satu rekap penjualan per tanggal, serta pemasukan lainnya.
- Expense satu/multi-item, jenis custom, catatan umum, dan riwayat grup.
- Edit/hapus satu item dengan konfirmasi dan KPI/chart yang diperbarui.
- Hari Ini, Bulan Ini, Bulan Lalu, 7 Hari Terakhir dan rentang custom.
- Refresh serta restart aplikasi tetap membaca record yang sama.

Pakai data uji pada branch uji. Untuk verifikasi penulisan production nanti, gunakan transaksi operasional yang sah, bukan memasukkan nominal dummy ke laporan toko. Sesi login tetap delapan jam; password rotation tetap membatalkan sesi lama. Jika hash atau sesi tidak cocok saat perpindahan, login ulang tanpa mengganti data transaksi.

## 7. Hubungkan ke Vercel

1. Buka dashboard Vercel → project Altomebay → **Settings → Environment Variables**.
2. Tambahkan `DATABASE_URL` berisi URL **pooled production** yang sama dengan database yang sudah dimigrasikan. Pilih environment **Production**. Kolom Value berisi URL saja, tanpa `DATABASE_URL=` dan tanpa tanda kutip pembungkus.
3. Pertahankan `ADMIN_PASSWORD_HASH` existing untuk Production. Jangan memasang password mentah.
4. `DATABASE_URL_UNPOOLED` cukup disimpan lokal untuk tooling; runtime Vercel hanya membaca `DATABASE_URL`. Jangan memasang URL development sebagai Production. Untuk Preview, gunakan branch Neon uji terpisah dan jalankan schema di branch tersebut.
5. Aplikasi tidak memakai `ADMIN_DATABASE_PATH`; nilai lama tidak menyebabkan fallback ke SQLite. File lokal dan backup tetap disimpan.
6. Pastikan runtime Node memenuhi `engines` project, build command tetap `npm run build`, dan jangan menambahkan migration/import ke build command.
7. Deploy versi kode PostgreSQL ini setelah schema dan impor selesai. Perubahan environment berlaku pada deployment berikutnya, jadi lakukan redeploy bila variabel baru ditambahkan setelah build sebelumnya.

Manual setup dijelaskan juga di [panduan Neon–Vercel](https://neon.com/docs/guides/vercel-manual); perilaku environment mengikuti [dokumentasi Vercel](https://vercel.com/docs/environment-variables).

## 8. Verifikasi production sebelum menyatakan selesai

Catat URL/deployment ID yang diuji. Buka domain production, bukan URL Preview.

1. Login di `/admin`; pastikan tidak ada lagi `ENOENT mkdir /var/task/data` di Runtime Logs.
2. Pilih periode yang mencakup record hasil impor. Cocokkan tanggal, nominal, kategori/jenis, rincian grup dan catatan dengan backup/aplikasi sebelumnya.
3. Verifikasi penulisan melalui aplikasi production pada transaksi operasional yang sah. Refresh dan login ulang; pastikan record yang sama tetap ada dan tidak tersimpan ganda.
4. Setelah penulisan selesai, simpan baseline database. Folder backup lokal sudah ada. File baseline harus baru:

   ```sh
   npm run db:verify -- --record data/backups/neon-before-redeploy.json
   ```

5. Lakukan **Redeploy** di Vercel dan tunggu deployment baru **Ready**. Jangan mengubah URL/database branch. Hindari perubahan transaksi selama perbandingan baseline.
6. Buka kembali `/admin` production. Pastikan login/riwayat/KPI/group detail tetap sama.
7. Bandingkan database sesudah redeploy:

   ```sh
   npm run db:verify -- --compare data/backups/neon-before-redeploy.json
   ```

   Harus muncul `snapshotMatches: true`, TLS terverifikasi, dan digest/count/total cocok. Sesi login sengaja tidak masuk digest ini karena login/logout bisa mengubahnya.

8. Periksa Runtime Logs untuk error koneksi/schema. Catat bukti deployment sebelum/sesudah, waktu verifikasi, hasil perbandingan dan hasil baca/tulis UI. Command compare membuktikan dua snapshot sama; command itu tidak dapat membuktikan redeploy terjadi atau bahwa browser membuka deployment yang benar. Bukti Vercel/UI di langkah sebelumnya tetap wajib.

**Status baru boleh menjadi “migrasi production selesai” setelah seluruh pemeriksaan ini lulus.** Saat dokumen ini dibuat, semua langkah Neon/Vercel di atas masih pending karena database belum dibuat.

## Penanganan error dan rollback

- `DATABASE_URL belum dikonfigurasi`: pasang variabel privat pada environment yang benar, kemudian redeploy. Tidak ada fallback SQLite.
- Schema belum siap: jalankan migrasi pada target yang sama, lalu `--check`.
- Konflik impor: berhenti dan tinjau sumber/target. Jangan menghapus record, mengubah ID atau me-reset database untuk memaksanya lolos.
- TLS/koneksi gagal: gunakan URL Connect Neon yang benar; jangan menonaktifkan verifikasi sertifikat atau memakai `rejectUnauthorized:false`.
- Snapshot berbeda: periksa branch/environment dan aktivitas transaksi yang terjadi di antara dua pemeriksaan. Perbedaan tidak otomatis berarti data hilang.
- Error driver disanitasi: pengguna mendapat pesan aman; log hanya menampilkan kategori/SQLSTATE, tanpa URL, password, parameter SQL atau stack asli driver.
- Jika cutover bermasalah, hentikan penulisan dan pertahankan PostgreSQL beserta backup. Jangan rollback Vercel ke versi SQLite karena masalah filesystem akan kembali. Untuk rollback aplikasi lokal sebelum ada perubahan baru di Neon, file SQLite asli masih tersedia; setelah Neon menerima writes, perubahan baru perlu direkonsiliasi secara terencana. Tidak ada prosedur penghapusan/reset otomatis.

## Arsitektur dan pengujian untuk pengembang

- `lib/admin/db.ts`: facade async, query parameter `$1`, lazy module-scoped `pg.Pool`, dua koneksi maksimum, idle timeout 5 detik, koneksi dibatasi waktunya, `attachDatabasePool` saat berjalan di Vercel. Tidak ada schema creation di request.
- Timeout statement diterapkan dengan `SET LOCAL` di dalam transaksi, bukan startup parameter yang dapat ditolak PgBouncer. Query timeout di sisi client tetap dibatasi. Lihat [batas startup parameter Neon](https://neon.com/docs/connect/connection-errors).
- Setiap transaksi memakai **satu** checked-out client sampai commit/rollback dan selalu release. Ini mengikuti [aturan transaksi node-postgres](https://node-postgres.com/features/transactions).
- `lib/admin/postgres.mjs`: TLS terverifikasi, konfigurasi server-only via facade, normalisasi BIGINT yang aman dan sanitasi error.
- `lib/admin/auth.ts`: session/throttle persisten PostgreSQL; row lock mencegah increment login gagal hilang saat request paralel.
- `app/admin/actions.ts`: DTO/filter/form behavior tetap sama; SQL PostgreSQL; atomic batch insert dan unique batch-ID/fingerprint mengarbitrasi retry antar-instance. Tidak ada transaksi tambahan untuk total batch. Link/type editing atomik.
- `daily_sales_dates` dan trigger: klaim tanggal dengan unique constraint, dengan row lock untuk perubahan/penghapusan rekap lama. Mencegah check-then-insert race dan tetap mempertahankan duplikat historis.
- `schema_migrations` mencatat checksum/versi; `sqlite_imports` mencatat digest snapshot yang berhasil diimpor.
- `scripts/database/`: migrate, backup SQLite read-only, dry-run/apply/verify import, serta read-only baseline verification.

Jalankan:

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Suite default memakai **PGlite (mesin PostgreSQL embedded)** untuk menjalankan schema, trigger, SQL, auth, transaksi dan impor offline; bukan mock SQL SQLite. Ada juga unit test untuk rollback/release pada client yang sama, BIGINT, TLS, error redaction dan missing-URL tanpa fallback. Pengujian ini tidak membuktikan koneksi jaringan Neon, concurrency multi-connection, atau lifecycle Vercel yang sebenarnya.

Test live concurrency tersedia tetapi **tidak otomatis dijalankan**. Pada branch/database uji terpisah, sediakan `TEST_DATABASE_URL` **direct** secara privat dan set `RUN_POSTGRES_INTEGRATION=1`, lalu jalankan `node --test tests/postgres-live.test.mjs`. Target tidak boleh sama dengan `DATABASE_URL` aplikasi. Test membuat schema terisolasi baru, menguji klaim tanggal bersamaan, penghapusan legacy duplicates dan batch retry paralel; tidak melakukan DROP/reset atau menyentuh tabel aplikasi existing. Schema test dibiarkan pada branch uji. Test ini masih skipped sampai target uji nyata tersedia.

## Bukti lokal yang sudah tersedia

- 13 pengujian default lulus; 1 live-concurrency test skipped karena belum ada target PostgreSQL/Neon nyata.
- TypeScript, lint dan production build diuji; `/` tetap static dan `/admin` dynamic.
- Backup sumber lokal berhasil dibuat read-only; dry-run dan rehearsal impor ke PostgreSQL embedded berhasil memverifikasi 2 transaksi serta link pengeluarannya.
- Database lokal asli tidak dihapus/ditimpa. Tidak ada migrasi/import cloud yang dijalankan.
- Catatan di bagian ini adalah bukti sebelum penghubungan CLI. Koneksi dan impor Neon kemudian berhasil; lihat hasil lanjutan di bawah. Deployment Vercel dan persistence setelah redeploy masih **BELUM TERVERIFIKASI**.

## Penghubungan CLI Neon — 29 Oktober 2026

Permintaan setup memakai organisasi `org-dry-smoke-91035819`, proyek `dawn-queen-18195621`, branch `production`, dan layanan Postgres saja.

- `npm i -g neon@latest` berhasil; versi CLI `8.13.2`.
- `neon init -y --org-id org-dry-smoke-91035819 --project-id dawn-queen-18195621 --branch production --services postgres` berhasil membuat `.neon` (diabaikan Git), `neon.ts`, serta memasang `@neon/config` dan `@neon/env`. CLI menyatakan `linked, not verified`: tautan ditulis offline tanpa autentikasi.
- `neon deploy` membuka autentikasi browser, lalu gagal dengan `ERROR: Authentication timed out after 60 seconds`. Lanjutkan dengan `neon login` secara interaktif, kemudian ulangi `neon deploy`.
- Belum ada `DATABASE_URL` yang ditarik. `ADMIN_PASSWORD_HASH` existing tetap ada. Belum ada schema/import atau penulisan transaksi ke Neon.
- Driver aplikasi tetap `pg` dengan pool yang dikelola Vercel, sesuai panduan Neon untuk Next.js di Vercel; runtime memakai `DATABASE_URL` pooled dan tooling migrasi memakai `DATABASE_URL_UNPOOLED`.
- Pemeriksaan setelah init: TypeScript dan lint lulus, 13 tests lulus / 1 live test skipped. Build pertama tertahan di sandbox dan dihentikan; `NODE_USE_SYSTEM_CA=1 npm run build` kemudian berhasil (`Compiled successfully`, exit 0).
- Production server lokal berhasil dimulai (`Ready in 141ms`). HTTP smoke test menghasilkan `PASS HTTP 200 / public homepage` dan `PASS HTTP 200 /admin login form present`. Ini hanya membuktikan halaman publik/login dapat dirender, bukan akses database.
- Installer melaporkan 13 temuan audit dependency (1 moderate, 11 high, 1 critical); tidak menjalankan `npm audit fix --force` atau perubahan dependency di luar setup.

Setelah autentikasi berhasil, ulangi deploy, verifikasi target koneksi tanpa mencetak rahasia, lalu ikuti prosedur migrasi dan impor aman di atas. Uji aplikasi dengan koneksi Neon nyata dan lanjutkan verifikasi Vercel setelah redeploy sebelum menyatakan cutover selesai.

### Hasil setelah login Neon berhasil

- `neon deploy` berhasil: `No changes — branch production already matches the policy`, `Utilized services: Postgres`, dan `Pulled 3 Neon variables into .env.local` (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`). Koneksi pooled/direct menunjuk database yang sama.
- Branch uji `codex-neon-verification-20261029` (`br-square-frost-az44v2si`) dibuat dari production kosong, sebelum migrasi. Koneksinya disimpan privat di `data/neon-verification-env.json`; `.env.local` tetap mengarah production. Branch tidak dihapus; data uji tetap terisolasi di sana.
- Schema, impor snapshot final, dan live concurrency test berhasil pada branch uji. PostgreSQL `180006`, TLS client terenkripsi dengan sertifikat terverifikasi. `pg_stat_ssl` di sisi backend Neon bukan bukti TLS client karena adanya proxy; tooling memeriksa socket TLS client yang sebenarnya.
- Setelah rehearsal, `npm run db:migrate` berhasil pada production (`version:1, applied:true`). Impor dan verifikasi exact snapshot final berhasil: 2 transaksi, 5 expense types, 1 batch, 1 expense item; pemasukan 5.000.000, pengeluaran 1.000.000. Baseline awal disimpan privat di `data/backups/neon-production-baseline-20261029.json`.
- Pemeriksaan baseline berikutnya mendeteksi 0 transaksi, 0 expense items, dan metadata batch masih ada. **Pemilik mengonfirmasi penghapusan itu disengaja.** Tidak mengimpor ulang atau memulihkan transaksi. Kondisi sesudah penghapusan dicatat privat di `data/backups/neon-production-after-check-20261029.json`. Jangan memakai baseline awal sebagai ekspektasi data terbaru.
- Database SQLite asli masih identik dengan snapshot backup final (digest sama), berisi 2 transaksi. Tidak ada penghapusan atau penimpaan sumber.
- `tests/neon-e2e.mjs` adalah uji opt-in HTTP terhadap build production lokal dan Neon branch terpisah. Jalankan setelah build dengan `node tests/neon-e2e.mjs data/neon-verification-env.json`. Script menolak target yang sama dengan database aplikasi, menggunakan password sementara hanya pada proses server uji, dan tidak mengubah password admin existing. Records uji tetap berada di branch uji.
- Uji HTTP lulus: anonymous action ditolak, login menghasilkan HTTP 303/session cookie, authenticated read, custom expense type, rollback batch yang gagal setelah item pertama, penyimpanan multi-item, retry identik tanpa duplikasi, penolakan payload retry berbeda, grouping/shared note, filter tanggal, edit item, KPI/chart dan persistence sesi/transaksi setelah restart aplikasi. Query SQL independen mengonfirmasi 2 item uji berjumlah 10.500 Rupiah. Ini bukan redeploy Vercel.
- Build akhir dengan `.env.local` Neon berhasil (`Compiled successfully in 3.2s`, exit 0); TypeScript/lint/default tests lulus (13 pass). Live test dijalankan terpisah dengan 1 pass dan 0 skip. Beberapa percobaan awal harness login memakai format streaming form yang salah; diperbaiki dengan serializer yang dibundel Next.js, kemudian seluruh uji HTTP lulus. UI/auth aplikasi tidak diubah.
- Halaman `https://altomebay.vercel.app/admin` merespons HTTP 200 dan menampilkan login. Ini tidak membuktikan Vercel sudah menggunakan database baru. CLI Vercel masih meminta autentikasi saat pemeriksaan; konfigurasi environment, deployment, login/transaksi production dan persistence setelah redeploy masih perlu dilanjutkan.

### Deployment Vercel pertama — 30 Oktober 2026 WIB

- Login Vercel berhasil melalui device flow. Workspace ditautkan ke `bayufolio/altomebay`, project `prj_NhGQXt0lJXTN2GvQwSA7VH0HcpxP`. Runtime project Node.js 24.x. Tautan lokal `.vercel/` diabaikan Git.
- Menambahkan `DATABASE_URL` pooled dari Neon production sebagai Secret khusus environment Production. `ADMIN_PASSWORD_HASH` production existing dipertahankan. Direct URL tetap untuk tooling lokal; tidak diperlukan pada runtime Vercel.
- CLI tidak dapat membaca kembali nilai Secret production (hasil pull berupa `[SENSITIVE]`); jangan memakai placeholder itu sebagai koneksi lokal. Salinan pull ada di `data/vercel-production.env.local`, bukan `.env.local` aplikasi.
- Dry-run upload awal mendeteksi berkas lokal yang perlu dikecualikan. Menambahkan `.vercelignore` untuk `data/`, `.env*`, pengaturan agent, build dan dependency lokal. Dry-run berikutnya lulus dengan 176 berkas; tidak mengunggah SQLite/backup/credential. Tidak ada deploy sebelum pengecualian ini diverifikasi.
- `npx --offline vercel@latest deploy --prod --yes --logs` berhasil. Vercel menjalankan `npm run build`: `Compiled successfully in 9.6s`, `Build Completed in /vercel/output [22s]`, lalu `readyState: READY`.
- Deployment pertama: `dpl_3TrnB3Lk2K2mqXjz6i7JzW5ZLqWW`, URL `https://altomebay-74zgz42wa-bayufolio.vercel.app`, alias `https://altomebay.vercel.app`. GET `/` dan `/admin` lulus HTTP 200; formulir login tersedia.
- Baseline setelah penghapusan disengaja tetap sama setelah deployment pertama (`snapshotMatches:true`, 0 transaksi). Pemeriksaan ini belum membuktikan persistence transaksi nonkosong.
- Langkah terakhir: pemilik masuk dengan password existing dan menyimpan transaksi nyata lewat domain production; catat baseline baru, redeploy, bandingkan digest/ID/nominal, lalu konfirmasikan transaksi tetap terlihat pada dashboard. Jangan membuat transaksi finansial fiktif atau memulihkan transaksi yang sengaja dihapus.

### Verifikasi persistence production selesai — 30 Oktober 2026 WIB

Pemilik mengonfirmasi berhasil menyimpan transaksi melalui `https://altomebay.vercel.app/admin`. Baseline baru direkam read-only ke `data/backups/neon-before-redeploy-20261030.json` sebelum deployment kedua: 2 transaksi, 5 expense types, 2 batch metadata (termasuk tombstone batch lama), dan 1 expense item. Pemasukan Rp1.000.000, pengeluaran Rp10.000, selisih Rp990.000.

Redeploy kedua memakai `npx --offline vercel@latest deploy --prod --yes --logs`, dengan deployment `dpl_85KEpb1hZW57DQBNqXpCzkVeTgF7` (`https://altomebay-5cmn3usj8-bayufolio.vercel.app`). Build Vercel menjalankan `npm run build`, menghasilkan `Compiled successfully in 8.7s`, `Build Completed in /vercel/output [19s]`, lalu `readyState: READY` dan alias `https://altomebay.vercel.app`.

Setelah READY, perintah berikut lulus (exit 0):

```sh
npm run db:verify -- --compare data/backups/neon-before-redeploy-20261030.json
```

Hasil penting:

```json
{
  "tls": true,
  "financialDigest": "51c234c872bb8635fa01230310c9dc48c874ad502c0f3cfc74156729d143a8a6",
  "counts": {"transactions": 2, "expense_types": 5, "expense_batches": 2, "expense_items": 1},
  "totals": {"income": "1000000", "expense": "10000", "difference": "990000"},
  "snapshotMatches": true
}
```

Digest dan identitas database sama sebelum/sesudah redeploy. Perbandingan mencakup seluruh kolom data keuangan, termasuk ID, tanggal, nominal, jenis, catatan dan hubungan batch/item; sesi/throttle yang dapat berubah tidak termasuk digest. Domain production setelah redeploy lulus `PASS after redeploy: HTTP 200 /` dan `PASS after redeploy: HTTP 200 /admin`.

Ini membuktikan transaksi yang disimpan melalui aplikasi production bertahan melewati redeploy Vercel. Login/penyimpanan production dikonfirmasi pemilik; perbandingan data dilakukan independen melalui PostgreSQL TLS. Pemeriksaan HTTP setelah redeploy memeriksa halaman publik/login, bukan sesi browser pemilik. Tidak ada reset, restore, atau transaksi keuangan fiktif selama verifikasi. Temuan audit dependency dari installer tetap menjadi pekerjaan terpisah; tidak ada kegagalan build, deploy, atau pemeriksaan persistence yang tersisa.
