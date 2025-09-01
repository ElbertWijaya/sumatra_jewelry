# Jalankan dari root repo (sumatra_jewelry)
# 1. Buat folder backend
New-Item -ItemType Directory -Name backend -Force | Out-Null
Set-Location backend

# 2. Simpan package.json (atau salin manual dari draft)
# 3. Install dependencies
npm install

# 4. Inisialisasi Prisma (file sudah ada schema.prisma dari draft)
npx prisma migrate dev --name init

# 5. Jalan server dev
npm run dev