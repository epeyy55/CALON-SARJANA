const express = require('express');
const router = express.Router();
const transaksiParkirController = require('../controllers/transaksiParkirController');

router.get('/', transaksiParkirController.getAllTransaksiParkir);
router.get('/riwayat', transaksiParkirController.getRiwayatTransaksiParkir);
router.get('/aktif', transaksiParkirController.getAllTransaksiAktif);
router.get(
    '/kendaraan/:id_kendaraan',
    transaksiParkirController.getTransaksiByKendaraan
);
router.get(
    '/aktif/kendaraan/:id_kendaraan',
    transaksiParkirController.getTransaksiAktifByKendaraan
);
router.get(
    '/area/:id_area/aktif',
    transaksiParkirController.getTransaksiAktifByArea
);
router.get(
    '/area/:id_area/count',
    transaksiParkirController.getCountKendaraanAktifByArea
);
router.get('/:id', transaksiParkirController.getTransaksiParkirById);
router.post('/', transaksiParkirController.createTransaksiParkir);
router.put('/:id/keluar', transaksiParkirController.kendaraanKeluar);

module.exports = router;