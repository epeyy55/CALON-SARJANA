CREATE TABLE IF NOT EXISTS area_parkir (
    id_area     INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_area   TEXT NOT NULL,
    kapasitas   INTEGER NOT NULL,
    lokasi      TEXT,
    updated_at  DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS kendaraan (
    id_kendaraan     INTEGER PRIMARY KEY AUTOINCREMENT,
    nomor_plat       TEXT NOT NULL UNIQUE,
    jenis_kendaraan  TEXT NOT NULL,
    updated_at       DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS transaksi_parkir (
    id_transaksi  INTEGER PRIMARY KEY AUTOINCREMENT,
    id_kendaraan  INTEGER NOT NULL,
    id_area       INTEGER NOT NULL,
    waktu_masuk   DATETIME NOT NULL,
    waktu_keluar  DATETIME,
    biaya_parkir  INTEGER DEFAULT 0,
    status        TEXT DEFAULT 'parkir' CHECK (status IN ('parkir','selesai')),
    FOREIGN KEY (id_kendaraan) REFERENCES kendaraan(id_kendaraan),
    FOREIGN KEY (id_area) REFERENCES area_parkir(id_area)
);