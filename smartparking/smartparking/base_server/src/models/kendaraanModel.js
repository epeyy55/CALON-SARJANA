const { dbRun, dbGet, dbAll } = require('../middlewares_helpers/sqlite3_helpers');

/* =============== READ (all) =============== */
const findAllKendaraan = async () => {
  return await dbAll('SELECT * FROM kendaraan ORDER BY id_kendaraan DESC');
};

/* =============== READ (by id) =============== */
const findKendaraanById = async (id) => {
  return await dbGet('SELECT * FROM kendaraan WHERE id_kendaraan = ?', [id]
  );
};

/* =============== CREATE =============== */
const createKendaraan = async (body) => {
  const query = `
    INSERT INTO kendaraan (nomor_plat, jenis_kendaraan, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `;
  const values = [
    body.nomor_plat,
    body.jenis_kendaraan,
  ];

  const { lastID } = await dbRun(query, values);
  return await findKendaraanById(lastID);
};

/* =============== UPDATE =============== */
const updateKendaraan = async (id, body) => {
  const existing = await findKendaraanById(id);
  if (!existing) return null;

  const query = `
    UPDATE kendaraan
    SET nomor_plat = ?, jenis_kendaraan = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id_kendaraan = ?
  `;
  const values = [
    body.nomor_plat ?? existing.nomor_plat,
    body.jenis_kendaraan ?? existing.jenis_kendaraan,
    id,
  ];

  await dbRun(query, values);
  return await findKendaraanById(id);
};

/* =============== DELETE =============== */
const deleteKendaraan = async (id) => {
  const { changes } = await dbRun('DELETE FROM kendaraan WHERE id_kendaraan = ?', [id]);
  return changes > 0;
};

module.exports = {
  findAllKendaraan,
  findKendaraanById,
  createKendaraan,
  updateKendaraan,
  deleteKendaraan,
};