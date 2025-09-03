# Requirements Fungsional & Non-Fungsional

## 1. Peran Pengguna (User Roles)
- Admin: CRUD semua data, ubah status, laporan.
- Kasir: Input pesanan, update status tertentu, lihat laporan ringkas.
- Owner: Lihat semua + laporan lengkap, approve perubahan sensitif (opsional tahap lanjut).
- (Opsional) Pengrajin: Lihat daftar pesanan yang sedang dikerjakan + update progres.

## 2. Alur Pesanan (Order Lifecycle)
Status utama (draft):
1. DRAFT / BARU (baru diinput, belum dikunci)
2. DITERIMA (order valid, masuk antrian kerja)
3. DALAM PROSES (sedang dikerjakan)
4. SIAP (fisik sudah siap, menunggu diambil)
5. DIAMBIL (customer sudah ambil & pelunasan terjadi)
6. BATAL (dibatalkan)

Transitions aturan sederhana (MVP):
- DRAFT -> DITERIMA (kunci data awal)
- DITERIMA -> DALAM PROSES
- DALAM PROSES -> SIAP
- SIAP -> DIAMBIL
- Apa saja -> BATAL (dengan alasan)

## 3. Field Data Pesanan
- id (kode unik otomatis: format TM-YYYYMM-XXXX)
- tanggal_input (auto)
- nama_pelanggan
- no_hp
- jenis (cincin, gelang, kalung, liontin, anting, lain)
- kadar (mis: 700, 750, 875, 916, 999)
- berat_target (gram) (optional)
- berat_akhir (gram) (diisi saat selesai)
- ongkos (rupiah)
- dp (uang muka)
- sisa_bayar (auto = ongkos - dp) + penyesuaian setelah berat akhir
- tanggal_janji_jadi
- catatan
- foto_desain_url (opsional array, tapi MVP satu dulu)
- status
- riwayat_status (terstruktur)
- created_by_user_id
- updated_by_user_id

## 4. Validasi / Aturan
- dp <= ongkos
- berat_akhir hanya bisa diisi jika status SIAP
- perubahan ongkos setelah DITERIMA perlu catatan alasan
- batal wajib alasan

## 5. Audit Trail Minimal
Simpan tabel order_history: (order_id, timestamp, user_id, perubahan_json)

## 6. Laporan Harian (MVP)
- Range tanggal (default hari ini)
- Jumlah pesanan baru
- Jumlah selesai (SIAP + DIAMBIL)
- Total DP diterima
- Total ongkos (pesanan baru)
- Total pelunasan (status DIAMBIL hari itu)

## 7. Non-Fungsional
- Target perangkat: Android (utama), iOS (opsional nanti)
- Offline first (tahap lanjut) -> sementara butuh koneksi
- Keamanan: Role-based, jangan simpan DP cash di client tanpa sync
- Backup DB harian (tanggung jawab infra / Supabase auto)

## 8. Teknologi (Usulan Cepat)
- Frontend: Expo React Native (TypeScript)
- Backend: Supabase (Auth + Postgres + Storage) untuk percepatan
- Alternatif: Node/Nest + PostgreSQL self-host (lebih fleksibel tapi lebih lama)

## 9. Milestone MVP
1. Setup proyek & schema
2. Auth + role seeding
3. Form input pesanan + list
4. Detail + update status
5. Laporan harian
6. Hardening + UAT

## 10. Risiko & Mitigasi
- Data hilang (backup) -> gunakan Supabase + export mingguan
- User salah input (validasi & konfirmasi)
- Foto besar (resize client sebelum upload)
- Koneksi lambat (queue offline tahap lanjut)

## 11. Next Steps
- Finalisasi schema SQL
- Generate ERD
- Mulai inisialisasi app Expo & koneksi Supabase
