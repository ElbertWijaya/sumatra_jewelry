# Toko Mas Sumatera App

Aplikasi mobile (Expo React Native) + Backend API (NestJS + PostgreSQL + Prisma) untuk menggantikan pencatatan manual (kertas tempah) di Toko Mas Sumatera.

## Tujuan Utama
- Digitalisasi proses pencatatan order / tempahan.
- Pelacakan status produksi (terima, proses, siap, diambil).
- Manajemen pelanggan dan histori pesanan.
- Estimasi berat & ongkos.
- Multi user (kasir, admin, owner).

## Stack
- Mobile: Expo (React Native, TypeScript)
- Backend: NestJS (REST), Prisma ORM, PostgreSQL
- Auth: JWT (role-based)
- Validasi: class-validator / DTO
- Logging: pino (opsional nanti)
- Testing: Jest

## Fitur Minimum (MVP)
1. Auth (login) + seeding user awal.
2. CRUD Pesanan (create + list + detail + update status).
3. Field pesanan: Nama pelanggan, No HP, Jenis, Kadar, Berat target, Berat akhir, Ongkos, DP, Janji jadi, Catatan, Foto desain (URL placeholder awal), Status.
4. Riwayat perubahan status (order_history).
5. Laporan harian sederhana (endpoint agregasi).

## Struktur Direktori
```
app/              -> (nantinya) source code mobile Expo
backend/          -> NestJS API + Prisma schema
docs/             -> Dokumen (requirements, ERD, arsitektur, roadmap)
```

## Backend (Langkah Teknis)
1. Install dependencies: (npm install di folder backend)
2. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL`.
3. Jalankan migrasi: `npx prisma migrate dev --name init`
4. Generate client: `npx prisma generate`
5. Seed user admin (nanti buat script seed).
6. Run dev: `npm run start:dev`

## API High-Level
- POST /api/auth/register (sementara untuk seed awal)
- POST /api/auth/login -> { accessToken }
- CRUD (akan ditambah): /api/orders

## Next
- Tambah modul Orders (service, controller, DTO, policy status).
- Middleware / guard JWT + Role.
- Endpoint laporan harian.
- Inisialisasi proyek Expo.

## Roadmap Lanjutan
- Upload foto (S3 / local storage sementara)
- Notifikasi WA (webhook pihak ketiga)
- Offline support di mobile
- Multi cabang (tambah branch_id pada order)

Silakan konfirmasi jika ingin saya lanjutkan: implement modul Orders + guard JWT, lalu init project Expo.
