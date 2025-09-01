# sumatra_jewelry

Aplikasi internal pelacakan progres pesanan perhiasan dengan alur linear:
Sales → Designer → Caster → Carver → Diamond Setter → Finisher → Inventory → Sales (serah) → Done / Cancel.

## Tujuan
- Transparansi posisi pesanan setiap saat.
- Checklist subtask per tahap (dinamis bisa ditambah).
- Jejak audit (siapa melakukan apa & kapan).
- Notifikasi instan (Socket.IO).
- Fleksibel menambah subtask tanpa migrasi rumit.

## Peran (Roles)
Bos, Sales, Designer, Caster, Carver, Diamond Setter, Finisher, Inventory.

## Alur Ringkas
1. Sales membuat order (1 item per order).
2. Stage role mengerjakan & centang subtasks.
3. (Opsional) Minta verifikasi ke Sales/Bos.
4. Stage selesai → pindah tahap berikut.
5. Inventory input data akhir.
6. Sales serah ke customer → Done (atau Cancel sewaktu perjalanan → stok / catatan).

## Entitas Inti
- roles, users
- stages, stage_subtasks
- orders
- order_stage_progress
- subtask_completion
- verification_requests
- order_files
- inventory_records
- audit_log

Detail ringkas tiap entitas ada di docs/domain-model.md.

## Realtime Events (rencana)
ORDER_CREATED, SUBTASK_COMPLETED, STAGE_COMPLETED, STAGE_STARTED, VERIFY_REQUESTED, VERIFY_DECIDED.

## Teknologi (Usulan)
- Backend: Node.js (Express) + Prisma + MariaDB
- Frontend: React Native (Expo) + Socket.IO client
- Auth: JWT
- Email (Bos): Nodemailer (event penting)

## Setup Backend Singkat
1. `cd backend`
2. `cp .env.example .env` lalu isi variabel.
3. `npx prisma migrate dev --name init`
4. `npm run dev`
5. (Nanti seeding roles + stages).

### API Endpoints
- `GET /health` - Status server
- `GET /sapa` - Salam ramah dalam bahasa Indonesia
- `POST /sapa` - Respons interaktif untuk sapaan

## Lisensi
Internal (harap jangan sebar tanpa izin).

## Status
Draft awal — fokus Sprint 1: model + CRUD + advance stage.