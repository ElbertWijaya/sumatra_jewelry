# Arsitektur Aplikasi (Draft)

## Pendekatan Cepat (MVP)
Menggunakan Supabase sebagai backend terpadu (Auth, Postgres, Storage, Edge Functions) + Expo React Native untuk client.

Komponen:
- Mobile App (Expo): UI, state management (zustand / redux toolkit), form (react-hook-form), data fetching (supabase-js / react-query), image picker & upload.
- Supabase: Auth (email OTP / magic link), tabel Postgres, Storage bucket (foto desain), edge functions (logika tambahan jika perlu).
- (Opsional) Dashboard Web ringan (nanti) dengan Next.js untuk laporan advanced.

## Diagram Sederhana
[Client] -> supabase-js -> [Supabase Auth + Postgres + Storage]

## Alur Utama Pesanan
1. User login (token dari Supabase)
2. User buat pesanan (insert orders)
3. Trigger / logic: simpan history (client side insert ke order_history)
4. Update status (update orders + catat ke history)
5. Query list (filter by status, paging sederhana)
6. Laporan harian: agregasi query (SQL view / edge function)

## Keamanan & Akses
- Role disimpan di tabel app_users sinkron dengan auth.users (map via user id)
- RLS: filter akses jika nanti ada multi cabang
- Validasi tambahan di client (double guard)

## Penanganan Foto
- Compress di client (expo-image-manipulator)
- Upload ke bucket 'designs/' + simpan URL di kolom foto_desain_url

## Sinkronisasi Offline (Tahap Lanjut)
- Gunakan expo-sqlite untuk cache orders
- Dual write queue jika offline lalu sync saat online

## Logging & Monitoring
- Supabase log bawaan + manual insert ke order_history

## Roadmap Teknis
1. Inisialisasi repo app Expo (TypeScript)
2. Pasang dependensi UI & Supabase
3. Layout dasar: Login, List Orders, New Order, Order Detail
4. Implement status update + history
5. Laporan harian (SQL view)
6. Hardening (validations + error states)
