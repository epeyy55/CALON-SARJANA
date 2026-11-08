const kendaraanModel = require('../models/kendaraanModel');

/* =========================================================
 *  Helper: standard response biar konsisten
 * ========================================================= */
const success = (res, code, message, data = null) =>
  res.status(code).json({ success: true, message, data });

const fail = (res, code, message, error = null) =>
  res.status(code).json({ success: false, message, error });

/* =========================================================
 *  GET /api/kendaraan — semua kendaraan
 * ========================================================= */
const getAllKendaraan = async (req, res) => {
  try {
    const kendaraan = await kendaraanModel.findAllKendaraan();
    success(res, 200, 'Berhasil mengambil semua kendaraan', kendaraan);
  } catch (error) {
    console.error('[getAllKendaraan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  GET /api/kendaraan/:id — satu kendaraan
 * ========================================================= */
const getKendaraanById = async (req, res) => {
  try {
    const kendaraan = await kendaraanModel.findKendaraanById(req.params.id);
    if (!kendaraan) return fail(res, 404, 'Kendaraan tidak ditemukan');
    success(res, 200, 'Berhasil mengambil kendaraan', kendaraan);
  } catch (error) {
    console.error('[getKendaraanById]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  POST /api/kendaraan — buat kendaraan baru
 * ========================================================= */
const createKendaraan = async (req, res) => {
  try {
    const { jenis_kendaraan, nomor_plat } = req.body;

    // Validasi wajib
    if (!jenis_kendaraan || jenis_kendaraan.trim() === '') {
      return fail(res, 400, 'Validasi gagal', 'jenis kendaraan wajib diisi');
    }
    if (!nomor_plat || nomor_plat.trim() === '') {
      return fail(res, 400, 'Validasi gagal', 'nomor plat wajib diisi');
    }

    const created = await kendaraanModel.createKendaraan(req.body);
    success(res, 201, 'Kendaraan berhasil dibuat', created);
  } catch (error) {
    console.error('[createKendaraan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  PUT /api/kendaraan/:id — update kendaraan
 * ========================================================= */
const updateKendaraan = async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis_kendaraan, nomor_plat } = req.body;

    // Validasi kalau kendaraan dikirim
    if (
      jenis_kendaraan !== undefined &&
      (typeof jenis_kendaraan !== 'string' ||
        jenis_kendaraan.trim() === '')
    ) {
      return fail(res, 400, 'Validasi gagal',
        'jenis kendaraan tidak boleh kosong');
    }

    if (
      nomor_plat !== undefined &&
      (typeof nomor_plat !== 'string' ||
        nomor_plat.trim() === '')
    ) {
      return fail(res, 400, 'Validasi gagal',
        'nomor plat tidak boleh kosong');
    }

    const updated = await kendaraanModel.updateKendaraan(id, req.body);
    if (!updated) return fail(res, 404, 'Kendaraan tidak ditemukan');

    success(res, 200, 'Kendaraan berhasil diupdate', updated);
  } catch (error) {
    console.error('[updateKendaraan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  DELETE /api/kendaraan/:id — hapus kendaraan
 * ========================================================= */
const deleteKendaraan = async (req, res) => {
  try {
    const deleted = await kendaraanModel.deleteKendaraan(req.params.id);
    if (!deleted) return fail(res, 404, 'Kendaraan tidak ditemukan');

    success(res, 200, 'Kendaraan berhasil dihapus');
  } catch (error) {
    console.error('[deleteKendaraan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

module.exports = {
  getAllKendaraan,
  getKendaraanById,
  createKendaraan,
  updateKendaraan,
  deleteKendaraan,
};