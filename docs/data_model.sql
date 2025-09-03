-- Draft schema untuk Toko Mas Sumatera (Supabase / PostgreSQL)
-- Catatan: Sesuaikan naming konvensi (snake_case) & tambahkan RLS policies nanti.

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('admin','kasir','owner','pengrajin')),
  created_at timestamptz default now()
);

create table if not exists orders (
  id bigserial primary key,
  code text generated always as (
    'TM-' || to_char(created_at, 'YYYYMM') || '-' || lpad(id::text,4,'0')
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  customer_name text not null,
  customer_phone text,
  jenis text not null,
  kadar int,
  berat_target numeric(10,2),
  berat_akhir numeric(10,2),
  ongkos numeric(14,2) not null,
  dp numeric(14,2) default 0,
  tanggal_janji_jadi date,
  catatan text,
  foto_desain_url text,
  status text not null default 'DRAFT' check (status in ('DRAFT','DITERIMA','DALAM_PROSES','SIAP','DIAMBIL','BATAL')),
  created_by uuid references app_users(id),
  updated_by uuid references app_users(id)
);

create table if not exists order_history (
  id bigserial primary key,
  order_id bigint references orders(id) on delete cascade,
  changed_at timestamptz default now(),
  user_id uuid references app_users(id),
  change_summary text,
  diff jsonb
);

-- Simple function to auto update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger trg_orders_updated
before update on orders
for each row execute function set_updated_at();

-- Example RLS activation (enable after policies defined)
-- alter table orders enable row level security;
-- alter table order_history enable row level security;

-- Policies (contoh awal, refine later)
-- create policy "allow read" on orders for select using (true);
