# Setup Database Lokal (PostgreSQL)

## Opsi 1: Install PostgreSQL Native
1. Install PostgreSQL 15 (Windows installer dari postgresql.org)
2. Buat database: `tokomas`
3. Buat user: `tokouser` password `secretpass`
4. Grant: `GRANT ALL PRIVILEGES ON DATABASE tokomas TO tokouser;`
5. Pastikan `.env` sesuai: `DATABASE_URL=postgresql://tokouser:secretpass@localhost:5432/tokomas?schema=public`

## Opsi 2: Docker (Butuh Docker Desktop)
```
docker compose up -d db
```

## Migrasi & Seed
```
# di folder backend
npx prisma migrate dev --name init
npm run seed
```

Jika mengubah schema:
```
npx prisma migrate dev --name <deskripsi>
```

Lihat schema via Prisma Studio:
```
npx prisma studio
```
