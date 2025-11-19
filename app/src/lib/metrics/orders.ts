// Shared helpers untuk menghitung indikator berbasis tasks & orders
// Tipis tipe agar aman dipakai lintas layar

export type AnyTask = {
  orderId?: number | string | null;
  status?: string | null;
  assignedTo?: { id?: string | number | null } | null;
  assignedToId?: string | number | null;
  assignedToName?: string | null;
};

export type AnyOrder = {
  id?: number | string | null;
  status?: string | null;
};

const upper = (v?: string | null) => String(v || '').toUpperCase();

export function isOrderActiveStatus(status?: string | null) {
  const s = upper(status);
  return s === 'DITERIMA' || s === 'DALAM_PROSES';
}

export function setAssignedOrderIds(tasks?: AnyTask[] | null) {
  const arr = Array.isArray(tasks) ? tasks : [];
  const wanted = arr.filter((t) => {
    const s = upper(t?.status);
    const hasAssignee = !!(t?.assignedTo?.id || t?.assignedToId || t?.assignedToName);
    return hasAssignee && (s === 'ASSIGNED' || s === 'IN_PROGRESS');
  });
  return new Set<number>(wanted.map((t) => Number(t.orderId)).filter(Boolean));
}

export function setAwaitingValidationOrderIds(tasks?: AnyTask[] | null) {
  const arr = Array.isArray(tasks) ? tasks : [];
  const wanted = arr.filter((t) => upper(t?.status) === 'AWAITING_VALIDATION');
  return new Set<number>(wanted.map((t) => Number(t.orderId)).filter(Boolean));
}

export function countDashboardMetrics(orders?: AnyOrder[] | null, tasks?: AnyTask[] | null) {
  const ord = Array.isArray(orders) ? orders : [];
  const aktif = ord.filter((o) => isOrderActiveStatus(o.status)).length;

  const assigned = setAssignedOrderIds(tasks).size;
  const verif = setAwaitingValidationOrderIds(tasks).size;
  const selesai = ord.filter((o) => {
    const s = upper(o.status);
    // Tambah SIAP sebagai status selesai (konfirmasi user)
    return s === 'DONE' || s === 'SELESAI' || s === 'SIAP';
  }).length;

  return { aktif, ditugaskan: assigned, selesai, verifikasi: verif } as const;
}
