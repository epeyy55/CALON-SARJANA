# SmartPark Front End

Prototype Front End Sistem Manajemen Parkir menggunakan React + TypeScript + Vite.

## Menjalankan project
1. Install Node.js versi LTS.
2. Ekstrak folder project.
3. Buka terminal pada folder `smartpark-frontend`.
4. Jalankan `npm install`.
5. Jalankan `npm run dev`.
6. Buka alamat lokal yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Fitur prototype
- Dashboard ringkasan kapasitas dan transaksi.
- Pengelolaan area parkir dengan form tambah area.
- Pengelolaan data kendaraan dengan form tambah kendaraan.
- Pencatatan kendaraan masuk.
- Pencatatan kendaraan keluar dan simulasi biaya parkir.
- Pencarian data transaksi dan kendaraan.

## Catatan penting
Data pada versi ini masih berupa data simulasi di state React. Data akan kembali ke data awal ketika halaman dimuat ulang. Versi ini belum terhubung ke Node.js REST API maupun database. Pada tahap integrasi, fungsi pengambilan dan penyimpanan data perlu diarahkan ke endpoint API kelompok.
