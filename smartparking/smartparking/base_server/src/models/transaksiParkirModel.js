const { dbRun, dbGet, dbAll } = require('../middlewares_helpers/sqlite3_helpers');

/* =============== READ (all) =============== */
const findAllTransaksiParkir = async () => {
  return await dbAll('SELECT * FROM transaksi_parkir ORDER BY id_transaksi DESC');
};

/* =============== READ (by id) =============== */
const findTransaksiParkirById = async (id) => {
  return await dbGet('SELECT * FROM transaksi_parkir WHERE id_transaksi = ?', [id]
  );
};

/* =============== READ (by kendaraan) =============== */
const findTransaksiByKendaraan = async (id_kendaraan) => {
  return await dbAll(`
    SELECT *
    FROM transaksi_parkir
    WHERE id_kendaraan = ?
    ORDER BY id_transaksi DESC
  `, [id_kendaraan]);
};

/* =============== READ (kendaraan sedang parkir) =============== */
const findTransaksiAktifByKendaraan = async (id_kendaraan) => {
  return await dbGet(`
    SELECT *
    FROM transaksi_parkir
    WHERE id_kendaraan = ?
      AND status = 'parkir'
    ORDER BY id_transaksi DESC
    LIMIT 1
  `, [id_kendaraan]);
};

/* =============== READ (transaksi aktif) =============== */
const findAllTransaksiAktif = async () => {
  return await dbAll(`
    SELECT
      tp.id_transaksi,
      tp.id_kendaraan,
      tp.id_area,
      tp.biaya_parkir,
      tp.waktu_masuk,
      tp.waktu_keluar,
      tp.status,
      k.nomor_plat,
      k.jenis_kendaraan,
      ap.nama_area,
      ap.lokasi
    FROM transaksi_parkir tp
    JOIN kendaraan k
      ON tp.id_kendaraan = k.id_kendaraan
    JOIN area_parkir ap
      ON tp.id_area = ap.id_area
    WHERE tp.status = 'parkir'
    ORDER BY tp.waktu_masuk ASC
  `);
};

/* =============== READ (transaksi berdasarkan area) =============== */
const findTransaksiAktifByArea = async (id_area) => {
  return await dbAll(`
    SELECT *
    FROM transaksi_parkir
    WHERE id_area = ?
      AND status = 'parkir'
    ORDER BY waktu_masuk ASC
  `, [id_area]);
};

/* =============== READ (riwayat transaksi selesai) =============== */
const findRiwayatTransaksiParkir = async () => {
  return await dbAll(`
    SELECT *
    FROM transaksi_parkir
    WHERE status = 'selesai'
    ORDER BY waktu_keluar DESC
  `);
};

/* =============== COUNT (kendaraan dalam area) =============== */
const countKendaraanAktifByArea = async (id_area) => {
  const result = await dbGet(`
    SELECT COUNT(*) AS total
    FROM transaksi_parkir
    WHERE id_area = ?
      AND status = 'parkir'
  `, [id_area]);

  return result.total;
};

/* =============== CREATE =============== */
const createTransaksiParkir = async (body) => {
  const transaksiAktif = await findTransaksiAktifByKendaraan(
    body.id_kendaraan
  );

  if (transaksiAktif) {
    throw new Error('Kendaraan masih memiliki transaksi parkir aktif');
  }

  const query = `
    INSERT INTO transaksi_parkir (id_kendaraan, id_area, biaya_parkir, waktu_masuk, status)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'parkir')
  `;
  const values = [
    body.id_kendaraan,
    body.id_area,
    body.biaya_parkir ?? 0
  ];

  const { lastID } = await dbRun(query, values);
  return await findTransaksiParkirById(lastID);
};/* =============== UPDATE (kendaraan keluar) =============== */
const selesaikanTransaksiParkir = async (idTransaksi, biaya_parkir) => {
  const query = `
    UPDATE transaksi_parkir
    SET
      waktu_keluar = CURRENT_TIMESTAMP,
      biaya_parkir = ?,
      status = 'selesai'
    WHERE id_transaksi = ?
      AND status = 'parkir'
  `;

  const result = await dbRun(query, [
    biaya_parkir,
    idTransaksi
  ]);

  if (result.changes === 0) {
    throw new Error('Transaksi tidak ditemukan atau sudah selesai');
  }

  return await findTransaksiParkirById(idTransaksi);
};
module.exports = {
  findAllTransaksiParkir,
  findTransaksiParkirById,
  findTransaksiByKendaraan,
  findTransaksiAktifByKendaraan,
  findAllTransaksiAktif,
  findTransaksiAktifByArea,
  countKendaraanAktifByArea,
  createTransaksiParkir,
  selesaikanTransaksiParkir,
  findRiwayatTransaksiParkir
};