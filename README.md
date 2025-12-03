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

### One-Click Backend Start (Windows)
- Gunakan `backend\run.cmd` untuk menjalankan alur otomatis: install deps → audit fix (non-blocking) → prisma generate → build → start server.
- Cukup double-click `run.cmd`. Jendela akan tetap terbuka untuk melihat log/error.

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

## Struktur Frontend (Terbaru)
```
app/
	src/
		features/
			orders/
				screens/           -> Screen terkait pesanan (CreateOrderScreen, OrdersListScreen, OrderActionsModal)
				components/        -> Komponen khusus domain order
				hooks/             -> Hook bisnis logic order
				types/             -> Tipe front-end spesifik order
			auth/
				screens/           -> LoginScreen
				hooks/             -> (rencana) useLogin, dsb
			tasks/
				screens/           -> TasksScreen, MyTasksScreen
				hooks/             -> (rencana) useTasks
		ui/
			atoms/               -> Komponen UI kecil reusable (Field, PremiumButton, InlineSelect, Typography, BasicButton)
			molecules/           -> Komponen gabungan (FormSection, ImagePreviewModal)
			layout/              -> Komponen layout struktural (Card)
			theme/               -> (luxuryTheme, palet warna, dsb)
		lib/
			api/                 -> client.ts API
			context/             -> AuthContext
			utils/               -> Helper umum (currency)
		constants/             -> Konstanta (orderOptions)
		types/                 -> ambient types
		theme/                 -> (central theme entry jika dipisah)
```

### Alias Path TypeScript
Alias berikut ditambahkan di `tsconfig.json` untuk mengurangi relative path:
```
@features/*   -> src/features/*
@ui/*         -> src/ui/*
@lib/*        -> src/lib/*
@constants/*  -> src/constants/*
@types/*      -> src/types/*
@theme/*      -> src/theme/*
```

Contoh penggunaan:
```ts
import { PremiumButton } from '@ui/atoms/PremiumButton';
import { InlineSelect } from '@ui/atoms/InlineSelect';
import { api } from '@lib/api/client';
import { AuthProvider } from '@lib/context/AuthContext';
import { JENIS_BARANG_OPTIONS } from '@constants/orderOptions';
```

### Konvensi Penamaan (Bahasa Indonesia)
- Field domain tetap memakai istilah Indonesia: `jenisBarang`, `warnaEmas`, `catatan`.
- Komponen UI memakai PascalCase: `PremiumButton`, `InlineSelect`.
- Folder feature singular jamak natural: `orders`, `tasks`.

### Cara Menambah Screen Baru (Contoh: Detail Order)
1. Buat file di: `src/features/orders/screens/OrderDetailScreen.tsx`.
2. Jika butuh komponen khusus: `src/features/orders/components/OrderSummaryCard.tsx`.
3. Logic fetch gunakan hook baru di `features/orders/hooks/useOrderDetail.ts`.
4. Import API via `@lib/api/client`.

### Penghapusan / Cleanup
- File kosong `ImageCropper.tsx` dihapus.
- Dump `sumatra_jewelry.sql` dihapus (gunakan backup terstruktur jika diperlukan).

### Langkah Lanjutan Disarankan
1. Tambah test dasar untuk API client.
2. Pisahkan tipe API (response) ke folder `features/orders/types` untuk type safety.
3. Tambah dark/light theme toggle jika diperlukan.

---
Struktur ini memudahkan pencarian: jika ingin modifikasi GUI order → buka `features/orders/` lalu pilih `screens` atau `components`.
