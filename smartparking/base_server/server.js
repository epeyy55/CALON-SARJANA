require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/config/database');

const areaParkirRoutes = require('./src/routes/areaParkirRoutes');
const kendaraanRoutes = require('./src/routes/kendaraanRoutes');
const transaksiParkirRoutes = require('./src/routes/transaksiParkirRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Root route */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Sistem API Parkir is running',
    version: '1.0.0',
    endpoints: {
      // AREA PARKIR
      area_parkir: {
        'GET /api/area-parkir':
          'Mengambil semua area parkir',
        'GET /api/area-parkir/:id':
          'Mengambil detail area parkir berdasarkan ID',
        'POST /api/area-parkir':
          'Membuat area parkir baru',
        'PUT /api/area-parkir/:id':
          'Memperbarui data area parkir',
        'DELETE /api/area-parkir/:id':
          'Menghapus area parkir',
      },

      // KENDARAAN
      kendaraan: {
        'GET /api/kendaraan':
          'Mengambil semua kendaraan',
        'GET /api/kendaraan/:id':
          'Mengambil detail kendaraan berdasarkan ID',
        'POST /api/kendaraan':
          'Mendaftarkan kendaraan baru',
        'PUT /api/kendaraan/:id':
          'Memperbarui data kendaraan',
        'DELETE /api/kendaraan/:id':
          'Menghapus kendaraan',
      },

      // TRANSAKSI PARKIR
      transaksi_parkir: {
        'GET /api/transaksi-parkir':
          'Mengambil semua transaksi parkir',
        'GET /api/transaksi-parkir/:id':
          'Mengambil detail transaksi berdasarkan ID',
        'GET /api/transaksi-parkir/kendaraan/:id_kendaraan':
          'Mengambil riwayat transaksi berdasarkan kendaraan',
        'GET /api/transaksi-parkir/aktif':
          'Mengambil semua kendaraan yang sedang parkir',
        'GET /api/transaksi-parkir/aktif/kendaraan/:id_kendaraan':
          'Mengecek transaksi aktif berdasarkan kendaraan',
        'GET /api/transaksi-parkir/area/:id_area/aktif':
          'Mengambil kendaraan yang sedang parkir di area tertentu',
        'GET /api/transaksi-parkir/area/:id_area/count':
          'Menghitung kendaraan aktif dalam area tertentu',
        'POST /api/transaksi-parkir':
          'Membuat transaksi baru (kendaraan masuk)',
        'PUT /api/transaksi-parkir/:id/keluar':
          'Menyelesaikan transaksi (kendaraan keluar)',
        'GET /api/transaksi-parkir/riwayat':
          'Mengambil seluruh riwayat transaksi yang selesai',
      },
    },
  });
});


/* Routes */
app.use('/api/area-parkir', areaParkirRoutes);
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/transaksi-parkir', transaksiParkirRoutes);

/* 404 */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

/* Start */
(async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
  });
})();