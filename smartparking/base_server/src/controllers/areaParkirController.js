const areaParkirModel = require('../models/areaParkirModel');

/* =========================================================
 *  Helper: standard response biar konsisten
 * ========================================================= */
const success = (res, code, message, data = null) =>
  res.status(code).json({ success: true, message, data });

const fail = (res, code, message, error = null) =>
  res.status(code).json({ success: false, message, error });

/* =========================================================
 *  GET /api/area-parkir — semua area parkir
 * ========================================================= */
const getAllAreaParkir = async (req, res) => {
  try {
    const areaParkir = await areaParkirModel.findAllAreaParkir();
    success(res, 200, 'Berhasil mengambil semua area parkir', areaParkir);
  } catch (error) {
    console.error('[getAllAreaParkir]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  GET /api/area-parkir/:id — satu area parkir
 * ========================================================= */
const getAreaParkirById = async (req, res) => {
  try {
    const areaParkir = await areaParkirModel.findAreaParkirById(req.params.id);
    if (!areaParkir) return fail(res, 404, 'Area Parkir tidak ditemukan');
    success(res, 200, 'Berhasil mengambil area parkir', areaParkir);
  } catch (error) {
    console.error('[getAreaParkirById]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  POST /api/area-parkir — buat area parkir baru
 * ========================================================= */
const createAreaParkir = async (req, res) => {
  try {
    const { nama_area, kapasitas, lokasi } = req.body;

    // Validasi wajib
    if (!nama_area || nama_area.trim() === '') {
      return fail(res, 400, 'Validasi gagal', 'nama area wajib diisi');
    }
    if (!lokasi || lokasi.trim() === '') {
      return fail(res, 400, 'Validasi gagal', 'lokasi wajib diisi');
    }
    if (
      kapasitas === undefined ||
      !Number.isInteger(Number(kapasitas)) ||
      Number(kapasitas) < 0
    ) {
      return fail(res, 400, 'Validasi gagal',
        'kapasitas wajib berupa bilangan bulat >= 0');
    }

    const created = await areaParkirModel.createAreaParkir(req.body);
    success(res, 201, 'Area Parkir berhasil dibuat', created);
  } catch (error) {
    console.error('[createAreaParkir]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  PUT /api/area-parkir/:id — update area parkir
 * ========================================================= */
const updateAreaParkir = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      req.body.kapasitas !== undefined &&
      (isNaN(req.body.kapasitas) || req.body.kapasitas < 0)
    ) {
      return fail(res, 400, 'Validasi gagal', 'kapasitas harus angka >= 0');
    }

    const updated = await areaParkirModel.updateAreaParkir(id, req.body);
    if (!updated) return fail(res, 404, 'Area parkir tidak ditemukan');

    success(res, 200, 'Area Parkir berhasil diupdate', updated);
  } catch (error) {
    console.error('[updateAreaParkir]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 *  DELETE /api/area-parkir/:id — hapus area parkir
 * ========================================================= */
const deleteAreaParkir = async (req, res) => {
  try {
    const deleted = await areaParkirModel.deleteAreaParkir(req.params.id);
    if (!deleted) return fail(res, 404, 'Area Parkir tidak ditemukan');

    success(res, 200, 'Area Parkir berhasil dihapus');
  } catch (error) {
    console.error('[deleteAreaParkir]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

module.exports = {
  getAllAreaParkir,
  getAreaParkirById,
  createAreaParkir,
  updateAreaParkir,
  deleteAreaParkir,
};