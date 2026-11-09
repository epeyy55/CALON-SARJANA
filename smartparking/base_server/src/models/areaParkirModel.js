const { dbRun, dbGet, dbAll } = require('../middlewares_helpers/sqlite3_helpers');

/* =============== READ (all) =============== */
const findAllAreaParkir = async () => {
  return await dbAll('SELECT * FROM area_parkir ORDER BY id_area DESC');
};

/* =============== READ (by id) =============== */
const findAreaParkirById = async (id) => {
  return await dbGet('SELECT * FROM area_parkir WHERE id_area = ?', [id]
  );
};

/* =============== CREATE =============== */
const createAreaParkir = async (body) => {
  const query = `
    INSERT INTO area_parkir (nama_area, kapasitas, lokasi, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `;
  const values = [
    body.nama_area,
    body.kapasitas ?? 0,
    body.lokasi
  ];

  const { lastID } = await dbRun(query, values);
  return await findAreaParkirById(lastID);
};

/* =============== UPDATE =============== */
const updateAreaParkir = async (id, body) => {
  const existing = await findAreaParkirById(id);
  if (!existing) return null;

  const query = `
    UPDATE area_parkir
    SET nama_area = ?, kapasitas = ?, lokasi = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id_area = ?
  `;
  const values = [
    body.nama_area ?? existing.nama_area,
    body.kapasitas ?? existing.kapasitas,
    body.lokasi ?? existing.lokasi,
    id,
  ];

  await dbRun(query, values);
  return await findAreaParkirById(id);
};

/* =============== DELETE =============== */
const deleteAreaParkir = async (id) => {
  const { changes } = await dbRun('DELETE FROM area_parkir WHERE id_area = ?', [id]);
  return changes > 0;
};

module.exports = {
  findAllAreaParkir,
  findAreaParkirById,
  createAreaParkir,
  updateAreaParkir,
  deleteAreaParkir,
};