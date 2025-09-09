import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert, Image, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api, API_URL } from '../api/client';
import { InlineSelect } from '../components/InlineSelect';
import ImagePreviewModal from '@/src/components/ImagePreviewModal';

type Props = { visible: boolean; order: any | null; onClose(): void; onChanged?(): void };

const ROLE_TEMPLATES: Record<string, string[]> = {
  DESIGNER: ['3D Design', 'Print Resin', 'Pengecekan'],
  CASTER: ['Pasang Tiang', 'Cor', 'Kasih Ke Admin'],
  CARVER: ['Reparasi', 'Cap', 'Kasih Ke Admin'],
  DIAMOND_SETTER: ['Pasang Berlian', 'Kasih Ke Admin'],
  FINISHER: ['Chrome Warna', 'Kasih Ke Admin'],
  INVENTORY: ['Input Data Inventory'],
};
const ROLE_OPTIONS = Object.keys(ROLE_TEMPLATES) as (keyof typeof ROLE_TEMPLATES)[];

export const OrderActionsModal: React.FC<Props> = ({ visible, order, onClose, onChanged }) => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<'assign'|'validate'>('assign');
  const [role, setRole] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [validations, setValidations] = useState<any[]>([]);
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { if (!visible) return; setTab('assign'); setRole(''); setSelectedStages([]); setSelectedUserId(''); setUsers([]); setValidations([]); setOrderDetail(null); }, [visible]);

  useEffect(() => { // load users filtered by selected job role
    (async () => {
      if (!token || !visible) return;
      try { const res = await api.users.list(token, role ? { jobRole: role } : undefined); setUsers(res); } catch (e: any) { /* ignore */ }
    })();
  }, [role, token, visible]);

  useEffect(() => { // load awaiting validations for this order
    (async () => {
      if (!token || !visible || !order) return;
      try { const res = await api.tasks.awaitingValidation(token, order.id); setValidations(res); } catch (e:any) { /* ignore */ }
    })();
  }, [token, visible, order]);

  useEffect(() => { // get latest order detail for header section
    (async () => {
      if (!token || !visible || !order?.id) return;
      try { const det = await api.orders.get(token, order.id); setOrderDetail(det); } catch {}
    })();
  }, [token, visible, order?.id]);

  const toggleStage = (stage: string) => setSelectedStages(s => s.includes(stage) ? s.filter(x=>x!==stage) : [...s, stage]);

  const canValidate = user?.jobRole === 'ADMINISTRATOR' || user?.jobRole === 'SALES';

  const doAssignBulk = async () => {
    if (!token || !order) return;
    if (!role) { Alert.alert('Assign Tugas', 'Pilih Role Pekerjaan terlebih dahulu.'); return; }
    if (!selectedUserId) { Alert.alert('Assign Tugas', 'Pilih orang yang akan ditugaskan.'); return; }
    const cleaned = (ROLE_TEMPLATES[role] || []).filter(st => selectedStages.includes(st)).map(st => ({ stage: st }));
    if (cleaned.length === 0) { Alert.alert('Assign Tugas', 'Pilih minimal satu sub-task.'); return; }
    try {
      const payload = {
        orderId: Number(order.id),
        role: String(role),
        userId: String(selectedUserId),
        subtasks: Array.isArray(cleaned) ? cleaned : [],
      };
      await api.tasks.assignBulk(token, payload);
      Alert.alert('Assign', 'Tugas berhasil dibuat.');
      onChanged?.();
      onClose();
    } catch (e: any) { Alert.alert('Gagal Assign', e.message || String(e)); }
  };

  const renderAssign = () => (
    <>
      {/* Polished order detail */}
      <View style={styles.detailCard}>
        {(() => {
          const det = orderDetail || order || {};
          const fmt = (n?: number) => (n == null ? '-' : `Rp ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`);
          const badgeStyle = (() => {
            const s = (det.status || '').toUpperCase();
            if (s === 'DRAFT') return styles.badgeNeutral;
            if (s === 'DITERIMA' || s === 'DALAM_PROSES') return styles.badgeInfo;
            if (s === 'SELESAI') return styles.badgeSuccess;
            if (s === 'DIBATALKAN') return styles.badgeDanger;
            return styles.badgeNeutral;
          })();
          return (
            <>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text style={styles.detailTitle}>{det.code ? `#${det.code}` : `#${det.id}`}</Text>
                {det.status ? (
                  <Text style={[styles.badgeBase, badgeStyle]}>{String(det.status)}</Text>
                ) : null}
              </View>
              <Text style={styles.detailSubtitle}>{det.customerName || '-'}</Text>
              {/* Info rows */}
              <View style={styles.rowGrid}>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Telepon</Text><Text style={styles.infoValue}>{det.customerPhone || '-'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Jenis</Text><Text style={styles.infoValue}>{det.jenisBarang || '-'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Alamat</Text><Text style={styles.infoValue}>{det.customerAddress || '-'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Emas</Text><Text style={styles.infoValue}>{det.jenisEmas || '-'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Warna</Text><Text style={styles.infoValue}>{det.warnaEmas || '-'}</Text></View>
              </View>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Pembayaran</Text>
              <View style={styles.rowGrid}>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Harga/gr</Text><Text style={styles.infoValue}>{fmt(det.hargaEmasPerGram)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>DP</Text><Text style={styles.infoValue}>{fmt(det.dp)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Perkiraan</Text><Text style={styles.infoValue}>{fmt(det.hargaPerkiraan)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Harga Akhir</Text><Text style={styles.infoValue}>{fmt(det.hargaAkhir)}</Text></View>
              </View>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Tanggal</Text>
              <View style={styles.rowGrid}>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Perkiraan Siap</Text><Text style={styles.infoValue}>{formatDateOnly(det.promisedReadyDate)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Selesai</Text><Text style={styles.infoValue}>{formatDateOnly(det.tanggalSelesai)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Ambil</Text><Text style={styles.infoValue}>{formatDateOnly(det.tanggalAmbil)}</Text></View>
              </View>
              {det.stones?.length ? (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionTitle}>Batu</Text>
                  <View style={styles.pillRow}>
                    {det.stones.map((s: any, idx: number) => (
                      <View key={idx} style={styles.pill}><Text style={styles.pillText}>{`${s.bentuk || '-'}${s.jumlah ? ` x${s.jumlah}` : ''}${s.berat ? ` • ${s.berat} gr` : ''}`}</Text></View>
                    ))}
                  </View>
                </>
              ) : null}
              {(() => { const imgs = (det?.referensiGambarUrls) as string[] | undefined; return Array.isArray(imgs) && imgs.length; })() ? (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionTitle}>Referensi Gambar</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop:8 }}>
                    {(det.referensiGambarUrls as string[]).map((u: string, idx: number) => (
                      <TouchableOpacity key={u+idx} onPress={() => setPreviewUrl(u)}>
                        <Image source={{ uri: toDisplayUrl(u) }} style={styles.thumbImg} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : null}
              {det.catatan ? (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionTitle}>Catatan</Text>
                  <Text style={styles.noteText}>{det.catatan}</Text>
                </>
              ) : null}
            </>
          );
        })()}
      </View>

      {/* Assign UI */}
      <InlineSelect label="Role Pekerjaan" value={role} options={(ROLE_OPTIONS as any)} onChange={(r)=> { setRole(r); setSelectedStages([]); setSelectedUserId(''); }} />
      <InlineSelect label="Pilih Orang" value={selectedUserId} options={users.filter(u => !role || u.jobRole === role).map(u=>({ label: u.fullName, value: u.id }))} onChange={(v)=> setSelectedUserId(v)} disabled={!role} />
      <Text style={styles.section}>Sub-tasks</Text>
      {(ROLE_TEMPLATES[role] || []).map((st) => {
        const active = selectedStages.includes(st);
        return (
          <TouchableOpacity key={st} onPress={()=> toggleStage(st)} style={[styles.stageItem, active && styles.stageItemActive]}>
            <Text style={[styles.stageText, active && styles.stageTextActive]}>{st}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 12 }} />
  <TouchableOpacity onPress={doAssignBulk} style={styles.primary}><Text style={styles.primaryText}>Simpan & Assign</Text></TouchableOpacity>
  {previewUrl && <ImagePreviewModal url={toDisplayUrl(previewUrl)} onClose={()=> setPreviewUrl(null)} />}
    </>
  );

  const doValidate = async (taskId: number) => {
    if (!token) return;
    try { await api.tasks.validate(token, taskId); const res = await api.tasks.awaitingValidation(token!, order!.id); setValidations(res); onChanged?.(); } catch (e:any) { Alert.alert('Gagal validasi', e.message || String(e)); }
  };

  const renderValidate = () => (
    <View>
      {!canValidate ? <Text>Anda tidak memiliki akses untuk validasi.</Text> : (
        validations.length === 0 ? <Text>Tidak ada tugas yang menunggu validasi.</Text> : (
          <FlatList data={validations} keyExtractor={(it)=>String(it.id)} renderItem={({item}) => (
            <View style={styles.valCard}>
              <Text style={{ fontWeight:'600' }}>{item.stage || 'Tanpa Stage'}</Text>
              <Text style={{ color:'#555' }}>Oleh: {item.assignedTo?.fullName || '-'}</Text>
              {item.notes ? <Text style={{ color:'#333' }}>Catatan: {item.notes}</Text> : null}
              <View style={{ height: 8 }} />
              <TouchableOpacity onPress={()=> doValidate(item.id)} style={[styles.primary, { paddingVertical: 8 }]}><Text style={styles.primaryText}>Validasi</Text></TouchableOpacity>
            </View>
          )} />
        )
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, paddingTop: 12 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={{ color:'#1976d2' }}>Tutup</Text></TouchableOpacity>
          <Text style={styles.title}>Order #{order?.code || order?.id}</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={()=> setTab('assign')} style={[styles.tab, tab==='assign' && styles.tabActive]}><Text style={tab==='assign'?styles.tabActiveText:styles.tabText}>Detail & Assign</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=> setTab('validate')} style={[styles.tab, tab==='validate' && styles.tabActive]}><Text style={tab==='validate'?styles.tabActiveText:styles.tabText}>Validasi</Text></TouchableOpacity>
        </View>
        <FlatList
          data={[{ key: 'content' }]}
          keyExtractor={(it)=>it.key}
          contentContainerStyle={{ padding:16 }}
          renderItem={() => (tab === 'assign' ? renderAssign() : renderValidate()) as any}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomWidth:1, borderBottomColor:'#eee' },
  title: { fontWeight:'700', fontSize:16 },
  tabs: { flexDirection:'row', marginTop: 8 },
  tab: { flex:1, paddingVertical: 12, alignItems:'center', borderBottomWidth:2, borderBottomColor:'transparent' },
  tabActive: { borderBottomColor:'#1976d2' },
  tabText: { color:'#666' },
  tabActiveText: { color:'#1976d2', fontWeight:'700' },
  section: { fontWeight:'700', marginBottom: 8, marginTop: 8 },
  subtaskRow: { flexDirection:'row', gap: 8, alignItems:'center', marginBottom: 8 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:10, paddingVertical:8, flex:1 },
  removeBtn: { padding:8 },
  addBtn: { paddingVertical: 10 },
  primary: { backgroundColor:'#1976d2', paddingVertical: 12, borderRadius: 8, alignItems:'center' },
  primaryText: { color:'white', fontWeight:'700' },
  valCard: { padding: 12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom: 8, backgroundColor:'#fff' },
  stageItem: { paddingVertical:10, paddingHorizontal:12, borderWidth:1, borderColor:'#ddd', borderRadius:8, marginBottom:8, backgroundColor:'#fff' },
  stageItemActive: { backgroundColor:'#e3f2fd', borderColor:'#90caf9' },
  stageText: { color:'#111' },
  stageTextActive: { color:'#0b5394', fontWeight:'700' },
  detailCard: { padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, backgroundColor:'#fafafa', marginBottom:12 },
  detailTitle: { fontSize:18, fontWeight:'800', color:'#111' },
  detailSubtitle: { marginTop:2, color:'#444', marginBottom:8 },
  rowGrid: { flexDirection:'row', flexWrap:'wrap' },
  infoRow: { width:'50%', paddingVertical:4 },
  infoLabel: { color:'#888', fontSize:12 },
  infoValue: { color:'#222', fontWeight:'600' },
  sectionDivider: { height:1, backgroundColor:'#eee', marginVertical:10 },
  sectionTitle: { fontWeight:'700', color:'#222' },
  pillRow: { flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:6 },
  pill: { paddingVertical:6, paddingHorizontal:10, borderRadius:16, borderWidth:1, borderColor:'#ddd', backgroundColor:'#fff' },
  pillText: { color:'#333', fontSize:12 },
  thumbImg: { width:72, height:72, borderRadius:8, backgroundColor:'#eee', marginRight:8 },
  noteText: { color:'#333', marginTop:6 },
  badgeBase: { paddingHorizontal:8, paddingVertical:4, borderRadius:8, fontSize:12, overflow:'hidden' },
  badgeNeutral: { backgroundColor:'#eceff1', color:'#37474f' },
  badgeInfo: { backgroundColor:'#e3f2fd', color:'#0b5394' },
  badgeSuccess: { backgroundColor:'#e8f5e9', color:'#2e7d32' },
  badgeDanger: { backgroundColor:'#ffebee', color:'#c62828' },
});

function toDisplayUrl(p?: string) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return p.startsWith('/uploads') ? base + p : p;
}

function formatDateOnly(p?: string) {
  if (!p) return '-';
  // If it's a pure date string (YYYY-MM-DD), build a local date to avoid TZ shifts
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(p);
  let d: Date;
  if (m) {
    const [y, mo, da] = p.split('-').map(Number);
    d = new Date(y, (mo || 1) - 1, da || 1);
  } else {
    d = new Date(p);
  }
  if (isNaN(d.getTime())) return p;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
