import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, API_URL } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { OrderActionsModal } from './OrderActionsModal';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

type Order = {
  id: number;
  code?: string | null;
  customerName?: string | null;
  jenisBarang?: string | null;
  jenis?: string | null;
  status?: string | null;
  stoneCount?: number | null;
  totalBerat?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  promisedReadyDate?: string | null;
  tanggalSelesai?: string | null;
  referensiGambarUrls?: string[] | null;
};

function isActiveStatus(status?: string | null) {
  const s = String(status || '').toUpperCase();
  return s === 'DITERIMA' || s === 'DALAM_PROSES';
}

export const MyOrdersScreen: React.FC = () => {
  const { token } = useAuth();
  const { filter } = useLocalSearchParams();
  const { data, error, isLoading, refetch, isRefetching } = useQuery<Order[]>({
    queryKey: ['orders','inprogress'],
    queryFn: () => api.orders.list(token || '') as Promise<Order[]>,
    enabled: !!token,
    refetchInterval: 12000,
    refetchOnWindowFocus: true,
  });
  const allOrders = Array.isArray(data) ? data : [];

  const [query, setQuery] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);
  type StatusFilter = 'SEMUA' | 'AKTIF' | 'DITUGASKAN' | 'SELESAI' | 'VERIFIKASI' | 'BATAL';
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('AKTIF');

  React.useEffect(() => {
    if (filter) {
      if (filter === 'aktif') setStatusFilter('AKTIF');
      else if (filter === 'ditugaskan') setStatusFilter('DITUGASKAN');
      else if (filter === 'selesai') setStatusFilter('SELESAI');
      else if (filter === 'verifikasi') setStatusFilter('VERIFIKASI');
      else if (filter === 'batal') setStatusFilter('BATAL');
      else setStatusFilter('SEMUA');
    }
  }, [filter]);
  const normalized = (s: string) => (s || '').toLowerCase().trim();
  const matchesQuery = (o: Order) => {
    const q = normalized(query);
    if (!q) return true;
    const hay = [o.code || '', o.customerName || '', o.jenisBarang || o.jenis || ''].map(normalized).join(' ');
    return hay.includes(q);
  };

  const filtered = allOrders
    .filter(o => {
      if (statusFilter === 'SEMUA') return true;
      if (statusFilter === 'AKTIF') return isActiveStatus(o.status);
      if (statusFilter === 'DITUGASKAN') {
        const s = String(o.status || '').toUpperCase();
        return s === 'ASSIGNED' || s === 'DITERIMA';
      }
      if (statusFilter === 'VERIFIKASI') {
        const s = String(o.status || '').toUpperCase();
        return s === 'AWAITING_VALIDATION';
      }
      const s = String(o.status || '').toUpperCase();
      if (statusFilter === 'SELESAI') return s === 'DONE' || s === 'SELESAI';
      if (statusFilter === 'BATAL') return s === 'CANCELLED' || s === 'CANCELED' || s === 'DELETED' || s === 'DIBATALKAN';
      return true;
    })
    .filter(matchesQuery)
    .sort((a,b) => {
      const va = Date.parse(String(a.updatedAt || a.createdAt || ''));
      const vb = Date.parse(String(b.updatedAt || b.createdAt || ''));
      if (!isNaN(va) && !isNaN(vb)) return vb - va; // desc by time
      // fallback to id desc
      return (b.id ?? 0) - (a.id ?? 0);
    });

  const [selected, setSelected] = React.useState<Order | null>(null);
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const badgeStyleFor = (status?: string | null) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DRAFT') return { wrap: styles.badgeNeutral, text: styles.badgeNeutralText };
    if (s === 'ASSIGNED' || s === 'DITERIMA') return { wrap: styles.badgeInfo, text: styles.badgeInfoText };
    if (s === 'IN_PROGRESS' || s === 'DALAM_PROSES') return { wrap: styles.badgeProgress, text: styles.badgeProgressText };
    if (s === 'AWAITING_VALIDATION') return { wrap: styles.badgeWarn, text: styles.badgeWarnText };
    if (s === 'DONE' || s === 'SELESAI') return { wrap: styles.badgeSuccess, text: styles.badgeSuccessText };
    if (s === 'CANCELLED' || s === 'CANCELED' || s === 'DELETED' || s === 'DIBATALKAN') return { wrap: styles.badgeDanger, text: styles.badgeDangerText };
    return { wrap: styles.badgeNeutral, text: styles.badgeNeutralText };
  };

  const formatDateStr = (s?: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s).slice(0, 10);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const toDisplayUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };

  const getBestThumbUrl = (urls?: string[] | null): string | null => {
    if (!Array.isArray(urls) || urls.length === 0) return null;
    const cleaned = urls.filter(u => typeof u === 'string' && u.trim().length > 0);
    if (cleaned.length === 0) return null;
    return cleaned[cleaned.length - 1]; // ambil yang terbaru (paling akhir)
  };

  const getEmptyMessage = (filter: StatusFilter) => {
    switch (filter) {
      case 'AKTIF': return 'Tidak ada order aktif';
      case 'DITUGASKAN': return 'Tidak ada order yang ditugaskan';
      case 'SELESAI': return 'Tidak ada order selesai';
      case 'VERIFIKASI': return 'Tidak ada order dalam verifikasi';
      case 'BATAL': return 'Tidak ada order batal';
      default: return 'Tidak ada order';
    }
  };

  const Thumbnail: React.FC<{ url?: string | null }> = ({ url }) => {
    const [loaded, setLoaded] = React.useState(false);
    if (!url) {
      return (
        <View style={styles.thumbWrap}>
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="image" size={18} color={COLORS.gold} />
          </View>
        </View>
      );
    }
    const display = toDisplayUrl(url);
    return (
      <View style={styles.thumbWrap}>
        <Image source={{ uri: display }} style={styles.thumbImg} onLoad={() => setLoaded(true)} />
        {!loaded && <View style={styles.thumbSkeleton} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.gold} style={{marginLeft:10, marginRight:6}} />
        <TextInput
          placeholder="Cari kode, nama customer, atau jenis..."
          placeholderTextColor={COLORS.yellow}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Ionicons name="filter" size={18} color={COLORS.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => { setQuery(''); }}>
          <Ionicons name="close-circle" size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>
      {/* Status segmented filter removed as requested; users will rely on search. */}
      {error ? <Text style={styles.error}>{String((error as any).message)}</Text> : null}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>{getEmptyMessage(statusFilter)}</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(item.id) } })}
            onLongPress={() => { setSelected(item); setOpen(true); }}
            activeOpacity={0.85}
          >
            <View style={styles.itemRow}>
              <View style={styles.topArea}>
                <View style={styles.leftCol}>
                  <Thumbnail url={getBestThumbUrl(item.referensiGambarUrls || undefined)} />
                  <View style={styles.chipsWrap}>
                    {(() => {
                      const photos = Array.isArray(item.referensiGambarUrls) ? item.referensiGambarUrls.filter(Boolean).length : 0;
                      const batu = typeof item.stoneCount === 'number' ? item.stoneCount : null;
                      const berat = typeof item.totalBerat === 'number' ? item.totalBerat : null;
                      const chips: { key: 'foto'|'batu'|'berat'; label: string }[] = [];
                      // Prioritas: Batu > Foto > Berat (fallback)
                      if (typeof batu === 'number' && batu > 0) chips.push({ key:'batu', label: `Batu ${batu}` });
                      if (photos > 0) chips.push({ key:'foto', label: `Foto ${photos}` });
                      if (chips.length < 2 && typeof berat === 'number' && berat > 0) {
                        const bw = Math.round(Number(berat) * 10) / 10; // 1 desimal
                        chips.push({ key:'berat', label: `${bw} g` });
                      }
                      return chips.slice(0,2).map((c, idx) => (
                        <View key={`${c.key}-${idx}`} style={styles.chip}>
                          {c.key === 'foto' && <MaterialCommunityIcons name="camera-outline" size={12} color={COLORS.gold} style={styles.chipIcon} />}
                          {c.key === 'batu' && <MaterialCommunityIcons name="diamond-stone" size={12} color={COLORS.gold} style={styles.chipIcon} />}
                          {c.key === 'berat' && <MaterialCommunityIcons name="scale-balance" size={12} color={COLORS.gold} style={styles.chipIcon} />}
                          <Text style={styles.chipText} numberOfLines={1}>{c.label}</Text>
                        </View>
                      ));
                    })()}
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.rowTop}>
                    <Text style={styles.titleCode} numberOfLines={1} ellipsizeMode='tail'>{item.code || `(Order #${item.id})`}</Text>
                    <View style={[styles.badgeBase, badgeStyleFor(item.status).wrap]}>
                      <Text style={[styles.badgeTextBase, badgeStyleFor(item.status).text]} numberOfLines={1}>
                        {String(item.status || '-').replace(/_/g,' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.nameText} numberOfLines={1} ellipsizeMode='tail'>{item.customerName || '-'}</Text>
                  <Text style={styles.typeText} numberOfLines={1} ellipsizeMode='tail'>{item.jenisBarang || item.jenis || '-'}</Text>

                  {(item.stoneCount != null || item.totalBerat != null) && (
                    <Text style={styles.stoneInfo} numberOfLines={1}>
                      Batu: {item.stoneCount ?? 0}{item.totalBerat ? ` • Total ${Number(item.totalBerat)} gr` : ''}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.sectionDivider} />
              <View style={styles.dateSection}>
                <View style={styles.dateBox}>
                  <View style={styles.dateBoxHeader}>
                    <Ionicons name='calendar-clear' size={12} color={COLORS.gold} style={{ marginRight: 6 }} />
                    <Text style={styles.dateBoxLabel}>Dibuat</Text>
                  </View>
                  <Text style={styles.dateBoxValue}>{formatDateStr(item.createdAt)}</Text>
                </View>
                <View style={styles.vLine} />
                <View style={styles.dateBox}>
                  <View style={styles.dateBoxHeader}>
                    <Ionicons name='calendar' size={12} color={COLORS.gold} style={{ marginRight: 6 }} />
                    <Text style={styles.dateBoxLabel}>Batas Selesai</Text>
                  </View>
                  <Text style={styles.dateBoxValue}>
                    {item.tanggalSelesai ? formatDateStr(item.tanggalSelesai) : 'Tidak ada batas waktu'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <OrderActionsModal
        visible={open}
        order={selected as any}
        onClose={() => { setOpen(false); setSelected(null); }}
        onChanged={() => refetch()}
      />

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Filter</Text>
            <Text style={styles.filterLabel}>Status</Text>
            {(['SEMUA','AKTIF','DITUGASKAN','SELESAI','VERIFIKASI','BATAL'] as StatusFilter[]).map((s) => (
              <TouchableOpacity key={s} style={styles.filterItem} onPress={() => setStatusFilter(s)}>
                <View style={[styles.radio, statusFilter===s && styles.radioActive]} />
                <Text style={styles.filterText}>{s}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setFilterOpen(false)} style={[styles.modalBtn, styles.btnGhost]}><Text style={styles.modalBtnText}>Tutup</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterOpen(false)} style={[styles.modalBtn, styles.btnPrimary]}><Text style={styles.modalBtnTextDark}>Terapkan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor: COLORS.dark },
  error: { color:'#c62828', marginBottom:8 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 32 },
  searchWrap: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 10, height: 40, borderWidth:1, borderColor: COLORS.border },
  searchInput: { flex:1, color: COLORS.yellow, paddingVertical: 8, paddingRight: 10, backgroundColor:'transparent' },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 },
  modalCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth:1, borderColor: COLORS.border },
  modalTitle: { color: COLORS.gold, fontSize:16, fontWeight:'700', marginBottom:8 },
  modalBtn: { paddingHorizontal:14, paddingVertical:10, borderRadius:10, marginLeft: 8 },
  btnPrimary: { backgroundColor: COLORS.gold },
  btnGhost: { borderWidth:1, borderColor: COLORS.border },
  modalBtnText: { color: COLORS.yellow, fontWeight:'700' },
  modalBtnTextDark: { color: '#1b1b1b', fontWeight:'700' },
  filterLabel: { color: COLORS.gold, fontWeight:'700', marginBottom:6 },
  filterItem: { flexDirection:'row', alignItems:'center', paddingVertical:8 },
  radio: { width:16, height:16, borderRadius:8, borderWidth:2, borderColor: COLORS.border, marginRight:10 },
  radioActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  filterText: { color: COLORS.yellow, fontWeight:'700' },
  badgeBase: { paddingVertical:4, paddingHorizontal:8, borderRadius:12, borderWidth:1 },
  badgeTextBase: { fontSize:11, fontWeight:'700' },
  badgeNeutral: { backgroundColor:'#2b2522', borderColor:COLORS.border },
  badgeNeutralText: { color:COLORS.yellow },
  badgeInfo: { backgroundColor:'#203040', borderColor:'#355a7a' },
  badgeInfoText: { color:'#b3daff' },
  badgeProgress: { backgroundColor:'#1f2d20', borderColor:'#2e7d32' },
  badgeProgressText: { color:'#a5d6a7' },
  badgeWarn: { backgroundColor:'#3a2a1a', borderColor:'#ffb300' },
  badgeWarnText: { color:'#ffecb3' },
  badgeSuccess: { backgroundColor:'#1f2d20', borderColor:'#43a047' },
  badgeSuccessText: { color:'#c8e6c9' },
  badgeDanger: { backgroundColor:'#3a1a1a', borderColor:'#c62828' },
  badgeDangerText: { color:'#ffcdd2' },
  itemRow: { padding:14, borderRadius:14, backgroundColor: COLORS.card, marginBottom:12, borderWidth:0.6, borderColor:'rgba(255,215,0,0.12)' },
  cardRow: { flexDirection:'row' },
  code: { fontWeight:'700', color:COLORS.gold, marginBottom:4 },
  titleCode: { color: COLORS.gold, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, marginRight: 8, flexShrink: 1 },
  meta: { color:'#ffe082', fontSize:13 },
  nameText: { color:'#ffe082', fontSize: 15, fontWeight:'700' },
  typeText: { color:'#bfae6a', fontSize: 12, fontWeight:'600', marginTop: 2 },
  subMeta: { color:'#bfae6a', fontSize:11, fontWeight:'600' },
  subMetaMuted: { color:'#9f8f5a' },
  dateRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:6 },
  dateItem: { flexDirection:'row', alignItems:'center' },
  topArea: { flexDirection:'row', alignItems:'flex-start' },
  cardBody: { flex:1, marginLeft: 10 },
  rowTop: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 2 },
  dateBoxes: { flexDirection:'row', gap: 8, marginTop: 8 },
  dateBox: { flex:1, minWidth: 0, backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 },
  dateBoxHeader: { flexDirection:'row', alignItems:'center', marginBottom: 2 },
  dateBoxLabel: { color: COLORS.gold, fontSize: 11, fontWeight:'700', letterSpacing: 0.2 },
  dateBoxValue: { color:'#ffe082', fontSize: 12, fontWeight:'700' },
  leftCol: { width: 56, alignItems:'center' },
  chipsWrap: { marginTop: 6, width: 56, gap: 6 },
  chip: { backgroundColor:'rgba(43,37,34,0.9)', borderColor: COLORS.border, borderWidth:1, borderRadius: 999, paddingVertical:2, paddingHorizontal:8, alignItems:'center', flexDirection:'row', justifyContent:'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  chipIcon: { marginRight: 4 },
  chipText: { color:'#d9c77a', fontSize:10, fontWeight:'700' },
  sectionDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,215,0,0.12)', marginTop: 10, marginBottom: 8 },
  dateSection: { flexDirection:'row', alignItems:'stretch', gap: 10 },
  vLine: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,215,0,0.16)' },
  stoneInfo: { color:'#bfae6a', fontSize:11, marginTop:2 },
  thumbWrap: { width: 56, height: 56, borderRadius: 10, overflow: 'hidden', backgroundColor: '#222', borderWidth: 1, borderColor: COLORS.border },
  thumbImg: { width: 56, height: 56, resizeMode: 'cover' },
  thumbPlaceholder: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#23201c' },
  thumbSkeleton: { ...StyleSheet.absoluteFillObject as any, backgroundColor: '#2b2522' },
});
