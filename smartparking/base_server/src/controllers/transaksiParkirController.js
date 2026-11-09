const transaksiParkirModel = require('../models/transaksiParkirModel');
const areaParkirModel = require('../models/areaParkirModel');

/* =========================================================
 *  Helper: standard response biar konsisten
 * ========================================================= */
const success = (res, code, message, data = null) =>
  res.status(code).json({ success: true, message, data });

const fail = (res, code, message, error = null) =>
  res.status(code).json({ success: false, message, error });

const isValidId = (value) => {
  return Number.isInteger(Number(value)) && Number(value) > 0;
};

/* =========================================================
 * GET /api/transaksi-parkir
 * Mengambil semua transaksi parkir
 * ========================================================= */
const getAllTransaksiParkir = async (req, res) => {
  try {
    const transaksi = await transaksiParkirModel.findAllTransaksiParkir();

    return success(
      res,
      200,
      'Berhasil mengambil semua transaksi parkir',
      transaksi
    );
  } catch (error) {
    console.error('[getAllTransaksiParkir]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/:id
 * Mengambil detail transaksi berdasarkan ID
 * ========================================================= */
const getTransaksiParkirById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return fail(res, 400, 'Validasi gagal', 'ID transaksi tidak valid');
    }

    const transaksi =
      await transaksiParkirModel.findTransaksiParkirById(id);

    if (!transaksi) {
      return fail(res, 404, 'Transaksi parkir tidak ditemukan');
    }

    return success(
      res,
      200,
      'Berhasil mengambil detail transaksi parkir',
      transaksi
    );
  } catch (error) {
    console.error('[getTransaksiParkirById]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/kendaraan/:id_kendaraan
 * Mengambil riwayat transaksi berdasarkan kendaraan
 * ========================================================= */
const getTransaksiByKendaraan = async (req, res) => {
  try {
    const { id_kendaraan } = req.params;

    if (!isValidId(id_kendaraan)) {
      return fail(res, 400, 'Validasi gagal', 'ID kendaraan tidak valid');
    }

    const transaksi =
      await transaksiParkirModel.findTransaksiByKendaraan(id_kendaraan);

    return success(
      res,
      200,
      'Berhasil mengambil riwayat parkir kendaraan',
      transaksi
    );
  } catch (error) {
    console.error('[getTransaksiByKendaraan]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/aktif
 * Mengambil semua kendaraan yang sedang parkir
 * ========================================================= */
const getAllTransaksiAktif = async (req, res) => {
  try {
    const transaksi =
      await transaksiParkirModel.findAllTransaksiAktif();

    return success(
      res,
      200,
      'Berhasil mengambil data kendaraan yang sedang parkir',
      transaksi
    );
  } catch (error) {
    console.error('[getAllTransaksiAktif]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/aktif/kendaraan/:id_kendaraan
 * Mengecek transaksi aktif suatu kendaraan
 * ========================================================= */
const getTransaksiAktifByKendaraan = async (req, res) => {
  try {
    const { id_kendaraan } = req.params;

    if (!isValidId(id_kendaraan)) {
      return fail(res, 400, 'Validasi gagal', 'ID kendaraan tidak valid');
    }

    const transaksi =
      await transaksiParkirModel.findTransaksiAktifByKendaraan(
        id_kendaraan
      );

    if (!transaksi) {
      return fail(
        res,
        404,
        'Kendaraan tidak sedang memiliki transaksi parkir aktif'
      );
    }

    return success(
      res,
      200,
      'Berhasil mengambil transaksi parkir aktif',
      transaksi
    );
  } catch (error) {
    console.error('[getTransaksiAktifByKendaraan]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/area/:id_area/aktif
 * Mengambil kendaraan yang sedang parkir di area tertentu
 * ========================================================= */
const getTransaksiAktifByArea = async (req, res) => {
  try {
    const { id_area } = req.params;

    if (!isValidId(id_area)) {
      return fail(res, 400, 'Validasi gagal', 'ID area tidak valid');
    }

    const transaksi =
      await transaksiParkirModel.findTransaksiAktifByArea(id_area);

    return success(
      res,
      200,
      'Berhasil mengambil transaksi aktif berdasarkan area',
      transaksi
    );
  } catch (error) {
    console.error('[getTransaksiAktifByArea]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/area/:id_area/count
 * Menghitung kendaraan yang sedang berada di area
 * ========================================================= */
const getCountKendaraanAktifByArea = async (req, res) => {
  try {
    const { id_area } = req.params;

    if (!isValidId(id_area)) {
      return fail(res, 400, 'Validasi gagal', 'ID area tidak valid');
    }

    const total =
      await transaksiParkirModel.countKendaraanAktifByArea(id_area);

    return success(
      res,
      200,
      'Berhasil menghitung kendaraan di area parkir',
      { id_area: Number(id_area), total }
    );
  } catch (error) {
    console.error('[getCountKendaraanAktifByArea]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * POST /api/transaksi-parkir
 * Kendaraan masuk / membuat transaksi parkir
 * ========================================================= */
const createTransaksiParkir = async (req, res) => {
  try {
    const { id_kendaraan, id_area, biaya_parkir } = req.body;

    // Validasi kendaraan
    if (!isValidId(id_kendaraan)) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'id_kendaraan wajib berupa ID yang valid'
      );
    }

    // Validasi area
    if (!isValidId(id_area)) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'id_area wajib berupa ID yang valid'
      );
    }

    // Validasi biaya
    if (
      biaya_parkir !== undefined &&
      (
        typeof biaya_parkir !== 'number' ||
        !Number.isFinite(biaya_parkir) ||
        !Number.isInteger(biaya_parkir) ||
        biaya_parkir < 0
      )
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'biaya_parkir harus berupa bilangan bulat >= 0'
      );
    }

    // Cek apakah area parkir tersedia
    const area = await areaParkirModel.findAreaParkirById(id_area);

    if (!area) {
      return fail(
        res,
        404,
        'Area parkir tidak ditemukan'
      );
    }

    // Hitung kendaraan yang sedang parkir di area
    const total =
      await transaksiParkirModel.countKendaraanAktifByArea(id_area);

    // Cek kapasitas area parkir
    if (total >= area.kapasitas) {
      return fail(
        res,
        409,
        'Area parkir sudah penuh',
        `Kapasitas area: ${area.kapasitas}, kendaraan saat ini: ${total}`
      );
    }

    // Buat transaksi parkir
    const created =
      await transaksiParkirModel.createTransaksiParkir(req.body);

    return success(
      res,
      201,
      'Kendaraan berhasil masuk ke area parkir',
      created
    );

  } catch (error) {
    console.error('[createTransaksiParkir]', error);

    if (error.message.includes('transaksi parkir aktif')) {
      return fail(
        res,
        409,
        'Kendaraan masih sedang parkir',
        error.message
      );
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return fail(
        res,
        400,
        'Kendaraan atau area parkir tidak ditemukan',
        error.message
      );
    }

    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * PUT /api/transaksi-parkir/:id/keluar
 * Kendaraan keluar / menyelesaikan transaksi
 * ========================================================= */
const kendaraanKeluar = async (req, res) => {
  try {
    const { id } = req.params;
    const { biaya_parkir } = req.body;

    if (!isValidId(id)) {
      return fail(res, 400, 'Validasi gagal', 'ID transaksi tidak valid');
    }

    if (
      typeof biaya_parkir !== 'number' ||
      !Number.isFinite(biaya_parkir) ||
      !Number.isInteger(biaya_parkir) ||
      biaya_parkir < 0
    ) {
      return fail(
        res,
        400,
        'Validasi gagal',
        'biaya_parkir wajib berupa bilangan bulat >= 0'
      );
    }

    const transaksi =
      await transaksiParkirModel.selesaikanTransaksiParkir(
        id,
        biaya_parkir
      );

    return success(
      res,
      200,
      'Kendaraan berhasil keluar dan transaksi diselesaikan',
      transaksi
    );
  } catch (error) {
    console.error('[kendaraanKeluar]', error);

    if (
      error.message.includes('tidak ditemukan atau sudah selesai')
    ) {
      return fail(res, 404, 'Transaksi tidak ditemukan atau sudah selesai');
    }

    return fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/transaksi-parkir/riwayat
 * Mengambil riwayat transaksi yang sudah selesai
 * ========================================================= */
const getRiwayatTransaksiParkir = async (req, res) => {
  try {
    const riwayat =
      await transaksiParkirModel.findRiwayatTransaksiParkir();

    return success(
      res,
      200,
      'Berhasil mengambil riwayat transaksi parkir',
      riwayat
    );
  } catch (error) {
    console.error('[getRiwayatTransaksiParkir]', error);
    return fail(res, 500, 'Server Error', error.message);
  }
};

module.exports = {
  getAllTransaksiParkir,
  getTransaksiParkirById,
  getTransaksiByKendaraan,
  getAllTransaksiAktif,
  getTransaksiAktifByKendaraan,
  getTransaksiAktifByArea,
  getCountKendaraanAktifByArea,
  createTransaksiParkir,
  kendaraanKeluar,
  getRiwayatTransaksiParkir
};