export interface AreaParkir {
  id_area: number;
  nama_area: string;
  lokasi: string;
  kapasitas: number;
}

export interface Kendaraan {
  id_kendaraan: number;
  nomor_plat: string;
  jenis_kendaraan: 'Mobil' | 'Motor';
}

export interface TransaksiParkir {
  id_transaksi: number;
  id_kendaraan: number;
  id_area: number;
  waktu_masuk: string;
  waktu_keluar?: string | null;
  biaya_parkir?: number | null;
  status: 'Parkir' | 'Selesai';
}