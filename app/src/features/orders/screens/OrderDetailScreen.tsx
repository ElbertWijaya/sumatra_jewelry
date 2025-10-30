import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_URL } from '@lib/api/client';
import ImagePreviewModal from '@ui/molecules/ImagePreviewModal';
import { useAuth } from '@lib/context/AuthContext';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const OrderDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const orderId = Number(id);
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
    refetchInterval: 12000,
  });

  const det: any = data || {};
  const stones: any[] = Array.isArray(det.stones) ? det.stones : [];
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const formatDateStr = (s?: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s).slice(0, 10);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatIDR = (n?: number | null) => {
    if (n == null) return '-';
    try {
      return 'Rp ' + Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } catch {
      return 'Rp ' + String(n);
    }
  };

  const toDisplayUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };

  // Tabs state: 'detail' | 'verif'
  const [tab, setTab] = React.useState<'detail'|'verif'>('detail');

  // Edit modal state
  const [editOpen, setEditOpen] = React.useState(false);
  const [form, setForm] = React.useState<any>({});
  React.useEffect(() => { setForm({
    customerName: det.customerName || '',
    customerPhone: det.customerPhone || '',
    customerAddress: det.customerAddress || '',
    jenisBarang: det.jenisBarang || det.jenis || '',
    jenisEmas: det.jenisEmas || '',
    warnaEmas: det.warnaEmas || '',
    ringSize: det.ringSize || '',
    promisedReadyDate: det.promisedReadyDate || '',
    tanggalSelesai: det.tanggalSelesai || '',
    catatan: det.catatan || ''
  }); }, [det]);

  const updateOrder = useMutation({
    mutationFn: async (patch: any) => api.orders.update(token || '', orderId, patch),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', orderId] }); queryClient.invalidateQueries({ queryKey: ['orders','inprogress'] }); setEditOpen(false); },
  });

  const deleteOrder = useMutation({
    mutationFn: async () => api.orders.remove(token || '', orderId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders','inprogress'] }); router.back(); },
  });

  // Assign modal state
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignRole, setAssignRole] = React.useState('');
  const [assignUserId, setAssignUserId] = React.useState('');
  const [roleOpen, setRoleOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  // Saran subtask; tetap fleksibel bisa tambah baru
  const SUGGEST_SUBTASKS = ['Desain 3D','Cetak Lilin','Pengecoran','Finishing','Pasang Batu','Quality Check'];
  const [selectedSubtasks, setSelectedSubtasks] = React.useState<string[]>([]);
  const toggleSubtask = (s: string) => setSelectedSubtasks(prev => prev.includes(s) ? prev.filter(x => x!==s) : [...prev, s]);
  const [newSubtask, setNewSubtask] = React.useState('');
  const addNewSubtask = () => {
    const t = newSubtask.trim();
    if (!t) return;
    setSelectedSubtasks(prev => prev.includes(t) ? prev : [...prev, t]);
    setNewSubtask('');
  };
  const assignTasks = useMutation({
    mutationFn: async () => api.tasks.assignBulk(token || '', {
      orderId,
      role: assignRole,
      userId: assignUserId,
      subtasks: selectedSubtasks.map(stage => ({ stage }))
    }),
    onSuccess: () => { setAssignOpen(false); setSelectedSubtasks([]); setAssignRole(''); setAssignUserId(''); queryClient.invalidateQueries({ queryKey: ['tasks','order', orderId] }); },
  });

  // Verification tab query
  const { data: verifData, refetch: refetchVerif } = useQuery({
    queryKey: ['order-verif', orderId],
    queryFn: () => api.tasks.awaitingValidation(token || '', orderId),
    enabled: !!token && !!orderId,
    refetchInterval: 12000,
  });
  const { data: tasksByOrder } = useQuery({
    queryKey: ['tasks','order', orderId],
    queryFn: () => api.tasks.listByOrder(token || '', orderId),
    enabled: !!token && !!orderId,
    refetchInterval: 12000,
  });
  const activeAssignee = React.useMemo(() => {
    const list = Array.isArray(tasksByOrder) ? tasksByOrder : [];
    // Active if the task has an assignee and status not DONE
    const active = list.find((t: any) => {
      const s = String(t?.status || '').toUpperCase();
      const hasAssignee = !!(t?.assignedTo || t?.assignedToId || t?.assignedToName);
      return hasAssignee && s !== 'DONE' && s !== 'CANCELLED' && s !== 'CANCELED';
    });
    if (!active) return null;
    const name = active.assignedTo?.fullName || active.assignedToName || active.assignedTo?.email || active.assignedToId || 'Pengguna';
    const userId = active.assignedTo?.id || active.assignedToId || null;
    return { name, userId } as any;
  }, [tasksByOrder]);
  const validateTask = useMutation({
    mutationFn: async (taskId: number) => api.tasks.validate(token || '', taskId),
    onSuccess: () => { refetchVerif(); queryClient.invalidateQueries({ queryKey: ['orders','inprogress'] }); },
  });

  const headerTitle = det?.code ? `Order ${det.code}` : `Order #${orderId}`;

  // Dropdown data: roles (fixed list) & users (API)
  const ROLES = ['DESIGNER','CARVER','CASTER','DIAMOND SETTER','FINISHER','INVENTORY'];
  const ROLE_SUBTASKS: Record<string, string[]> = {
    'DESIGNER': ['Gambar 3D','Print Resin','Pengecekan'],
    'CASTER': ['Pasang Tiang','Cor','Kasih Ke Admin'],
    'CARVER': ['Reparasi','Bom','Kasih Ke Admin'],
    'DIAMOND SETTER': ['Pasang Berlian','Kasih Ke Admin'],
    'FINISHER': ['Chrome','Kasih Ke Admin'],
    'INVENTORY': ['Input Data']
  };
  const { data: usersData } = useQuery({
    queryKey: ['users','byRole', assignRole || 'ALL'],
    queryFn: () => api.users.list(token || '', assignRole ? { jobRole: assignRole } : undefined),
    enabled: assignOpen && !!token,
  });
  const users: any[] = Array.isArray(usersData) ? usersData : [];
  const selectedUser = React.useMemo(() => users.find((u:any) => String(u.id) === assignUserId), [users, assignUserId]);
  React.useEffect(() => { setAssignUserId(''); setSelectedSubtasks([]); }, [assignRole]);
  const roleSuggestions = React.useMemo(() => assignRole ? (ROLE_SUBTASKS[assignRole] || []) : [], [assignRole]);

  const onPressEdit = React.useCallback(() => setEditOpen(true), []);
  const deleteOrderRef = React.useRef(deleteOrder);
  React.useEffect(() => { deleteOrderRef.current = deleteOrder; }, [deleteOrder]);
  const onPressDelete = React.useCallback(() => {
    Alert.alert('Hapus Pesanan', 'Yakin ingin menghapus pesanan ini?', [
      { text:'Batal', style:'cancel' },
      { text:'Hapus', style:'destructive', onPress: () => deleteOrderRef.current.mutate() }
    ]);
  }, []);

  const screenOptions = React.useMemo(() => ({
    title: headerTitle,
    headerRight: () => (
      <View style={{ flexDirection:'row' }}>
        <TouchableOpacity onPress={onPressEdit} style={{ paddingHorizontal:12 }}>
          <Ionicons name="create-outline" size={18} color={COLORS.gold} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressDelete} style={{ paddingRight: 12 }}>
          <Ionicons name="trash-outline" size={18} color="#d9534f" />
        </TouchableOpacity>
      </View>
    )
  }), [headerTitle]);

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScrollView style={{ flex:1, backgroundColor: COLORS.dark }} contentContainerStyle={{ padding: 16 }}>
        {error ? <Text style={{ color:'#c62828', marginBottom: 8 }}>{String((error as any).message)}</Text> : null}
        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setTab('detail')} style={[styles.tabItem, tab==='detail' && styles.tabItemActive]}>
            <Text style={[styles.tabText, tab==='detail' && styles.tabTextActive]}>Detail Pesanan</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('verif')} style={[styles.tabItem, tab==='verif' && styles.tabItemActive]}>
            <Text style={[styles.tabText, tab==='verif' && styles.tabTextActive]}>Verifikasi Pekerja</Text>
          </TouchableOpacity>
        </View>

        {tab === 'detail' && (
        <>
        <View style={styles.assignWrap}>
          {activeAssignee ? (
            <View style={styles.assigneeInfo}>
              <MaterialCommunityIcons name="account-hard-hat-outline" size={16} color={'#1b1b1b'} style={{ marginRight:6 }} />
              <Text style={styles.assigneeText}>Sedang dikerjakan oleh {activeAssignee.name}</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setAssignOpen(true)} style={styles.assignBtnPrimary}>
              <MaterialCommunityIcons name="account-plus-outline" size={16} color={'#1b1b1b'} style={{ marginRight:6 }} />
              <Text style={styles.assignBtnTextDark}>Assign Pekerjaan</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Informasi Customer</Text>
          <View style={styles.divider} />
          <Text style={styles.row}><Text style={styles.key}>Nama:</Text> <Text style={styles.val}>{det.customerName || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Telp:</Text> <Text style={styles.val}>{det.customerPhone || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Alamat:</Text> <Text style={styles.val}>{det.customerAddress || '-'}</Text></Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Informasi Order</Text>
          <View style={styles.divider} />
          <Text style={styles.row}><Text style={styles.key}>Jenis:</Text> <Text style={styles.val}>{det.jenisBarang || det.jenis || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Jenis Emas:</Text> <Text style={styles.val}>{det.jenisEmas || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Warna:</Text> <Text style={styles.val}>{det.warnaEmas || '-'}</Text></Text>
          {det.ringSize ? <Text style={styles.row}><Text style={styles.key}>Ukuran Cincin:</Text> <Text style={styles.val}>{det.ringSize}</Text></Text> : null}
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Tanggal</Text>
          <View style={styles.divider} />
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.row}><Text style={styles.key}>Perkiraan Siap:</Text> <Text style={styles.val}>{det.promisedReadyDate ? formatDateStr(det.promisedReadyDate) : '-'}</Text></Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-clear" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.row}><Text style={styles.key}>Selesai:</Text> <Text style={styles.val}>{det.tanggalSelesai ? formatDateStr(det.tanggalSelesai) : '-'}</Text></Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-number" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.row}><Text style={styles.key}>Ambil:</Text> <Text style={styles.val}>{det.tanggalAmbil ? formatDateStr(det.tanggalAmbil) : '-'}</Text></Text>
          </View>
        </View>
        {stones.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.title}>Ringkasan Batu</Text>
            <View style={styles.divider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {stones.map((stone: any, index: number) => (
                <View key={index} style={styles.stoneCard}>
                  <Text style={styles.stoneTitle}>{stone.bentuk || '-'}</Text>
                  <Text style={styles.stoneDetail}>Jumlah: {stone.jumlah || '-'}</Text>
                  <Text style={styles.stoneDetail}>Berat: {stone.berat ? `${stone.berat} ct` : '-'}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.title}>Ringkasan Pembayaran</Text>
          <View style={styles.divider} />
          <Text style={styles.row}><Text style={styles.key}>Harga Emas/gram:</Text> <Text style={styles.val}>{formatIDR(det.hargaEmasPerGram)}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Harga Perkiraan:</Text> <Text style={styles.val}>{formatIDR(det.hargaPerkiraan)}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>DP:</Text> <Text style={styles.val}>{formatIDR(det.dp)}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Harga Akhir:</Text> <Text style={styles.val}>{formatIDR(det.hargaAkhir)}</Text></Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Catatan</Text>
          <View style={styles.divider} />
          <Text style={[styles.row, !det.catatan && styles.rowMuted]}>
            {det.catatan ? String(det.catatan) : 'Tidak ada catatan'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Referensi Gambar</Text>
          <View style={styles.divider} />
          {Array.isArray(det.referensiGambarUrls) && det.referensiGambarUrls.length > 0 ? (
            <View style={styles.imageGridWrap}>
              {det.referensiGambarUrls.slice(0,6).map((url: string, i: number) => {
                const display = toDisplayUrl(url);
                return (
                  <View key={url + i} style={styles.imageThumbWrap}>
                    <Image source={{ uri: display }} style={styles.imageThumb} />
                    <View style={styles.imageOverlay}>
                      <Text onPress={() => setPreviewUrl(display)} style={styles.viewText}>Lihat</Text>
                    </View>
                  </View>
                );
              })}
              {det.referensiGambarUrls.length > 6 && (
                <View style={[styles.imageThumbWrap, {justifyContent:'center',alignItems:'center'}]}>
                  <Text style={{color:COLORS.gold, fontWeight:'700'}}>+{det.referensiGambarUrls.length-6}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.row, styles.rowMuted]}>Tidak ada referensi gambar</Text>
          )}
        </View>
        </>
        )}

        {tab === 'verif' && (
          <View style={styles.card}>
            <Text style={styles.title}>Menunggu Verifikasi</Text>
            <View style={styles.divider} />
            {Array.isArray(verifData) && verifData.length > 0 ? (
              verifData.map((t: any) => (
                <View key={t.id} style={{ paddingVertical:8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border }}>
                  <Text style={styles.row}><Text style={styles.key}>Tahap:</Text> <Text style={styles.val}>{t.stage || '-'}</Text></Text>
                  <Text style={styles.row}><Text style={styles.key}>Dikerjakan oleh:</Text> <Text style={styles.val}>{t.assignedToName || t.assignedToId || '-'}</Text></Text>
                  <View style={{ flexDirection:'row', marginTop:6 }}>
                    <TouchableOpacity onPress={() => validateTask.mutate(Number(t.id))} style={styles.validateBtn}>
                      <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.dark} style={{ marginRight:6 }} />
                      <Text style={styles.validateBtnText}>Verifikasi</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.row, styles.rowMuted]}>Belum ada permintaan verifikasi</Text>
            )}
          </View>
        )}
      </ScrollView>
      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}

      {/* Edit Modal */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Pesanan</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Nama</Text>
              <TextInput style={styles.input} value={form.customerName} onChangeText={(v)=>setForm((s:any)=>({...s, customerName:v}))} placeholder="Nama customer" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Telp</Text>
              <TextInput style={styles.input} value={form.customerPhone} onChangeText={(v)=>setForm((s:any)=>({...s, customerPhone:v}))} placeholder="Nomor telp" placeholderTextColor="#9f8f5a" keyboardType="phone-pad" />
              <Text style={styles.inputLabel}>Alamat</Text>
              <TextInput style={styles.input} value={form.customerAddress} onChangeText={(v)=>setForm((s:any)=>({...s, customerAddress:v}))} placeholder="Alamat" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Jenis Barang</Text>
              <TextInput style={styles.input} value={form.jenisBarang} onChangeText={(v)=>setForm((s:any)=>({...s, jenisBarang:v}))} placeholder="Cincin / Kalung ..." placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Jenis Emas</Text>
              <TextInput style={styles.input} value={form.jenisEmas} onChangeText={(v)=>setForm((s:any)=>({...s, jenisEmas:v}))} placeholder="-" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Warna Emas</Text>
              <TextInput style={styles.input} value={form.warnaEmas} onChangeText={(v)=>setForm((s:any)=>({...s, warnaEmas:v}))} placeholder="-" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Ukuran Cincin</Text>
              <TextInput style={styles.input} value={form.ringSize} onChangeText={(v)=>setForm((s:any)=>({...s, ringSize:v}))} placeholder="-" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Perkiraan Siap (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={form.promisedReadyDate} onChangeText={(v)=>setForm((s:any)=>({...s, promisedReadyDate:v}))} placeholder="2025-10-31" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Tanggal Selesai (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={form.tanggalSelesai} onChangeText={(v)=>setForm((s:any)=>({...s, tanggalSelesai:v}))} placeholder="2025-11-05" placeholderTextColor="#9f8f5a" />
              <Text style={styles.inputLabel}>Catatan</Text>
              <TextInput style={[styles.input,{height:80}]} value={form.catatan} onChangeText={(v)=>setForm((s:any)=>({...s, catatan:v}))} placeholder="Catatan" placeholderTextColor="#9f8f5a" multiline />
            </ScrollView>
            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={()=>setEditOpen(false)} style={[styles.modalBtn, styles.btnGhost]}><Text style={styles.modalBtnText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>updateOrder.mutate(form)} style={[styles.modalBtn, styles.btnPrimary]}>
                <Text style={styles.modalBtnTextDark}>{updateOrder.isPending ? 'Menyimpan...' : 'Simpan'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Modal */}
      <Modal visible={assignOpen} transparent animationType="fade" onRequestClose={() => setAssignOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Assign Pekerjaan</Text>
            <Text style={styles.inputLabel}>Role</Text>
            <TouchableOpacity onPress={()=>setRoleOpen(v=>!v)} style={[styles.input, { flexDirection:'row', alignItems:'center', justifyContent:'space-between' }]}>
              <Text style={{ color: assignRole ? COLORS.yellow : '#9f8f5a' }}>{assignRole || 'Pilih role'}</Text>
              <Ionicons name={roleOpen ? 'chevron-up' : 'chevron-down'} color={COLORS.gold} />
            </TouchableOpacity>
            {roleOpen && (
              <View style={styles.dropdown}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r} onPress={()=>{ setAssignRole(r); setRoleOpen(false); setUserOpen(false); }} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.inputLabel}>User</Text>
            <TouchableOpacity onPress={()=>setUserOpen(v=>!v)} style={[styles.input, { flexDirection:'row', alignItems:'center', justifyContent:'space-between' }]}>
              <Text style={{ color: assignUserId ? COLORS.yellow : '#9f8f5a' }}>
                {selectedUser ? `${selectedUser.fullName || selectedUser.name || selectedUser.email || selectedUser.id}` : 'Pilih user'}
              </Text>
              <Ionicons name={userOpen ? 'chevron-up' : 'chevron-down'} color={COLORS.gold} />
            </TouchableOpacity>
            {userOpen && (
              <View style={styles.dropdown}>
                {users.map((u:any) => {
                  const label = `${u.fullName || u.name || u.email || u.id}`;
                  return (
                    <TouchableOpacity key={u.id} onPress={()=>{ setAssignUserId(String(u.id)); setUserOpen(false); }} style={styles.dropdownItem}>
                      <Text style={styles.dropdownText}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <Text style={[styles.inputLabel,{ marginBottom:6 }]}>Sub Tasks</Text>
            {activeAssignee && (
              <Text style={[styles.rowMuted, { marginBottom: 6 }]}>Pesanan sedang dikerjakan oleh {activeAssignee.name}. Tidak bisa assign lagi sebelum verifikasi disetujui.</Text>
            )}
            {assignRole ? (
              <>
                <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
                  {roleSuggestions.map(s => (
                    <TouchableOpacity key={s} onPress={()=>toggleSubtask(s)} style={[styles.subtaskPill, selectedSubtasks.includes(s) && styles.subtaskPillActive]}>
                      {selectedSubtasks.includes(s) && <Ionicons name="checkmark" size={12} color={COLORS.dark} style={{ marginRight: 4 }} />}
                      <Text style={[styles.subtaskText, selectedSubtasks.includes(s) && styles.subtaskTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                  {selectedSubtasks.filter(s => !roleSuggestions.includes(s)).map(s => (
                    <TouchableOpacity key={s} onPress={()=>toggleSubtask(s)} style={[styles.subtaskPill, styles.subtaskCustom, selectedSubtasks.includes(s) && styles.subtaskPillActive]}>
                      {selectedSubtasks.includes(s) && <Ionicons name="checkmark" size={12} color={COLORS.dark} style={{ marginRight: 4 }} />}
                      <Text style={[styles.subtaskText, selectedSubtasks.includes(s) && styles.subtaskTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', marginTop: 8 }}>
                  <TextInput style={[styles.input, { flex:1 }]} value={newSubtask} onChangeText={setNewSubtask} placeholder="Tambah subtask baru…" placeholderTextColor="#9f8f5a" />
                  <TouchableOpacity onPress={addNewSubtask} style={[styles.modalBtn, styles.btnPrimary, { marginLeft: 8 }]}>
                    <Text style={styles.modalBtnTextDark}>Tambah</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={[styles.rowMuted, { marginTop: 4 }]}>Pilih role terlebih dahulu</Text>
            )}
            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={()=>setAssignOpen(false)} style={[styles.modalBtn, styles.btnGhost]}><Text style={styles.modalBtnText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity disabled={!!activeAssignee || !assignRole || !assignUserId || selectedSubtasks.length===0} onPress={()=>assignTasks.mutate()} style={[styles.modalBtn, styles.btnPrimary, (!!activeAssignee || !assignRole || !assignUserId || selectedSubtasks.length===0) && { opacity:0.6 }]}>
                <Text style={styles.modalBtnTextDark}>{assignTasks.isPending ? 'Mengirim...' : 'Assign'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, backgroundColor: COLORS.card, borderWidth:1, borderColor: COLORS.border, marginBottom: 12 },
  title: { color: COLORS.gold, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  divider: { height:1, backgroundColor: COLORS.border, opacity: 0.8, marginBottom: 8 },
  row: { color: COLORS.yellow, marginBottom: 4 },
  rowMuted: { color: '#9f8f5a' },
  key: { color: COLORS.gold, fontWeight:'700' },
  val: { color: COLORS.yellow, fontWeight:'600' },
  valMuted: { color: '#9f8f5a', fontWeight:'600' },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  imageGridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumbWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', marginRight: 8, marginBottom: 8, backgroundColor: '#222', borderWidth: 1, borderColor: COLORS.border },
  imageThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  imageOverlay: { position:'absolute', left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.35)', paddingVertical:2, alignItems:'center' },
  viewText: { color:'#fff', fontSize:11, fontWeight:'700' },
  tabBar: { flexDirection:'row', backgroundColor:'#1d1a16', borderRadius:10, borderWidth:1, borderColor:COLORS.border, marginBottom:12 },
  tabItem: { flex:1, paddingVertical:8, alignItems:'center' },
  tabItemActive: { backgroundColor:'#2b2522' },
  tabText: { color:'#bfae6a', fontWeight:'700' },
  tabTextActive: { color:COLORS.gold },
  assignWrap: { marginBottom: 12, alignItems:'stretch' },
  assignBtnPrimary: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.gold, paddingHorizontal:14, paddingVertical:10, borderRadius:10 },
  assignBtnTextDark: { color: '#1b1b1b', fontWeight:'800' },
  assigneeInfo: { flexDirection:'row', alignItems:'center', backgroundColor:'#ffe082', paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  assigneeText: { color: '#1b1b1b', fontWeight:'800' },
  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 },
  modalCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth:1, borderColor: COLORS.border },
  modalTitle: { color: COLORS.gold, fontSize:16, fontWeight:'700', marginBottom:8 },
  inputLabel: { color: COLORS.gold, fontWeight:'700', marginTop: 10 },
  input: { borderWidth:1, borderColor: COLORS.border, borderRadius:10, paddingHorizontal:10, paddingVertical:8, color: COLORS.yellow, marginTop:6 },
  dropdown: { borderWidth:1, borderColor: COLORS.border, borderRadius:10, marginTop:6, overflow:'hidden', backgroundColor:'#1d1a16' },
  dropdownItem: { paddingVertical:10, paddingHorizontal:12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  dropdownText: { color: COLORS.yellow, fontWeight:'700' },
  modalBtn: { paddingHorizontal:14, paddingVertical:10, borderRadius:10, marginLeft: 8 },
  btnPrimary: { backgroundColor: COLORS.gold },
  btnGhost: { borderWidth:1, borderColor: COLORS.border },
  modalBtnText: { color: COLORS.yellow, fontWeight:'700' },
  modalBtnTextDark: { color: '#1b1b1b', fontWeight:'700' },
  subtaskPill: { flexDirection:'row', alignItems:'center', borderWidth:1, borderColor: COLORS.border, borderRadius: 999, paddingVertical:6, paddingHorizontal:10, marginRight:8, marginBottom:8, backgroundColor:'#201c18' },
  subtaskCustom: { backgroundColor:'#2b2522', borderStyle:'dashed' },
  subtaskPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  subtaskText: { color:'#d9c77a', fontWeight:'700' },
  subtaskTextActive: { color:'#1b1b1b', fontWeight:'700' },
  validateBtn: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.gold, paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  validateBtnText: { color: '#1b1b1b', fontWeight:'800' },
  stoneCard: { width: 120, padding: 10, borderRadius: 10, backgroundColor: '#1d1a16', borderWidth: 1, borderColor: COLORS.border, marginRight: 12 },
  stoneTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  stoneDetail: { color: COLORS.yellow, fontSize: 12, marginBottom: 2 },
});
