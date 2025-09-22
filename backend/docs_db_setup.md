# Setup Database Lokal (MySQL)

## Opsi 1: Install MySQL/MariaDB Native
1. Install MySQL 8 atau MariaDB (Windows installer)
2. Buat database: `sumatra_jewelry`
3. Buat user: `sumatra` password `sumatra` (opsional; atau gunakan user Anda)
4. Pastikan plugin auth adalah `mysql_native_password`
5. Pastikan `.env` sesuai: `DATABASE_URL=mysql://user:pass@localhost:3306/sumatra_jewelry`

## Migrasi & Seed
```
# di folder backend
npx prisma migrate deploy
# Jika perlu seed
# npx prisma db seed atau npm run seed
```

Jika mengubah schema (generate migrasi baru):
```
npx prisma migrate dev --name <deskripsi>
```

Lihat schema via Prisma Studio:
```
npx prisma studio
```
