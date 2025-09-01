# Toko Mas Sumatra (Mobile / Expo)

Struktur folder modul mobile aplikasi Toko Mas Sumatra.

## Fitur Awal (Skeleton)
- Autentikasi (placeholder state lokal)
- Navigasi: Auth Stack vs App Tabs
- Tab: Dashboard, Products
- Fetch harga emas (placeholder /gold/price)
- Daftar produk (placeholder /products)
- Theme tokens (colors, spacing, typography)
- Util format mata uang

## Dependency Utama
- expo
- react / react-native
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs
- @tanstack/react-query

Pastikan sudah menginstall:
```bash
cd mobile
npm install
npx expo start
```

## Env
Buat file `.env` (opsional lewat dotenv, tapi Expo auto-expose var `EXPO_PUBLIC_*`):
```
EXPO_PUBLIC_API_URL=https://api.example.com
```

## Aliases (tsconfig.json)
- @theme/*
- @screens/*
- @components/*
- @store/*
- @api/*
- @utils/*
- @hooks/*
- @types/*

## Navigasi
RootNavigator:
- Jika isAuthenticated => AppTabs
- Else => AuthStack

## Menyesuaikan
Ganti placeholder API di:
- src/api/client.ts
- src/api/products.ts
- src/store/pricing/useGoldPrice.ts

## Format Mata Uang
Util `formatCurrency` default: locale `id-ID`, currency `IDR`.

## Langkah Berikut
1. Integrasi backend nyata
2. Tambah sistem auth (JWT / OAuth)
3. State management lebih kuat (Zustand / Jotai / Redux) jika diperlukan
4. Penanganan error global
5. Theming gelap / terang

## Lisensi
Internal / Private.
