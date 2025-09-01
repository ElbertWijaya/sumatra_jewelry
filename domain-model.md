# Domain Model

## roles
- name (Bos, Sales, Designer, Caster, Carver, DiamondSetter, Finisher, Inventory)

## users
- role_id relasi ke roles

## stages
- code (DESIGNER, CASTER, CARVER, DIAMOND_SETTER, FINISHER, INVENTORY, SALES_HANDOVER, DONE, CANCELED)
- order_index (urut linear)
- is_terminal (DONE / CANCELED)

## stage_subtasks
- Dinamis; bisa tambah tanpa ubah kode

## orders
- Satu item per order
- current_stage_id
- status (ACTIVE / DONE / CANCELED)
- due_date (cek keterlambatan)

## order_stage_progress
- Log waktu mulai & selesai tiap stage

## subtask_completion
- Centang subtask per order & stage

## verification_requests
- PENDING → APPROVED / REJECTED oleh Sales/Bos

## order_files
- Referensi desain, foto progres

## inventory_records
- Pencatatan pergerakan barang (RAW_IN, ISSUE_TO_STAGE, FINISHED_IN, RETURNED)

## audit_log
- Aksi penting (CREATE_ORDER, ADVANCE_STAGE, COMPLETE_SUBTASK, UPLOAD_FILE, CANCEL_ORDER, etc.)

## Catatan
- Penambahan subtask: insert row baru pada stage_subtasks → otomatis tampil.
- Linear enforcement: backend cek order_index.
