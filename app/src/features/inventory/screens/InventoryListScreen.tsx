import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, TextInput, Modal, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api, API_URL } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS } from '@constants/orderOptions';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const InventoryListScreen: React.FC = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [branchLocation, setBranchLocation] = React.useState('');
  const [placement, setPlacement] = React.useState('');
  const [statusEnum, setStatusEnum] = React.useState('');
  const [goldType, setGoldType] = React.useState('');
  const [goldColor, setGoldColor] = React.useState('');
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const [filterOpen, setFilterOpen] = React.useState(false);
  const { data, isLoading, isRefetching, refetch } = useQuery<any>({
    queryKey: ['inventory','list', q, category, status, branchLocation, placement, statusEnum, goldType, goldColor, page],
    queryFn: () => api.inventory.search(token || '', { q, category, status, branchLocation, placement, statusEnum, goldType, goldColor, limit: pageSize, offset: (page-1)*pageSize }),
    enabled: !!token,
    refetchInterval: 6000,
  });
  const items = Array.isArray(data?.items) ? data.items : [];
    const toDisplayUrl = (p?: string) => {
      if (!p) return '';
      if (/^https?:\/\//i.test(p)) return p;
      const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
      return p.startsWith('/uploads') ? base + p : p;
    };

    const pickFirstImage = (it: any): string | null => {
      const raw = it?.images ?? it?.image ?? it?.photoUrl ?? it?.photo_url ?? null;
      if (!raw) return null;
      try {
        if (Array.isArray(raw)) return raw[0] || null;
        if (typeof raw === 'string') {
          // could be JSON array string or a direct path
          if (raw.trim().startsWith('[')) {
            const arr = JSON.parse(raw);
            return Array.isArray(arr) && arr.length ? arr[0] : null;
          }
          return raw;
        }
      } catch {}
      return null;
    };
  const total = Number(data?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const anyFilterActive = !!(q || category || status || branchLocation || placement || statusEnum || goldType || goldColor);
  const onResetFilters = () => {
    setQ(''); setCategory(''); setStatus(''); setBranchLocation(''); setPlacement(''); setStatusEnum(''); setGoldType(''); setGoldColor(''); setPage(1);
  };

  const statusChipStyle = (raw: any) => {
    const st = String(raw?.statusEnum || raw?.status_enum || 'DRAFT').toUpperCase();
    const base = { backgroundColor: '#c7b26a', borderColor: COLORS.gold } as any;
    if (st === 'ACTIVE') return { backgroundColor: '#6bbf59', borderColor: '#4e9a3e' };
    if (st === 'RESERVED') return { backgroundColor: '#f0ad4e', borderColor: '#d48c1f' };
    if (st === 'SOLD') return { backgroundColor: '#d9534f', borderColor: '#b52b27' };
    if (st === 'RETURNED') return { backgroundColor: '#5bc0de', borderColor: '#2fa5c4' };
    if (st === 'DAMAGED') return { backgroundColor: '#9e9e9e', borderColor: '#7a7a7a' };
    return base;
  };
  return (
    <View style={{ flex:1, backgroundColor: COLORS.dark }}>
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.gold} style={{marginLeft:10, marginRight:6}} />
        <TextInput
          placeholder="Cari kode, nama, lokasi, barcode..."
          placeholderTextColor={COLORS.yellow}
          style={s.searchInput}
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.filterBtn} onPress={() => setFilterOpen(true)}>
          <Ionicons name="filter" size={18} color={COLORS.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={s.filterBtn} onPress={() => { onResetFilters(); refetch(); }}>
          <Ionicons name="close-circle" size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>
      {/* Active filter chips */}
      <View style={{ paddingHorizontal:16 }}>
        {anyFilterActive ? (
          <View style={s.filterRow}>
            {[{label:'Cabang', val:branchLocation, setter:setBranchLocation}, {label:'Penempatan', val:placement, setter:setPlacement}, {label:'Status', val:statusEnum, setter:setStatusEnum}, {label:'Jenis', val:category, setter:setCategory}, {label:'Jenis Emas', val:goldType, setter:setGoldType}, {label:'Warna Emas', val:goldColor, setter:setGoldColor}]
              .filter(f=> !!f.val)
              .map((f,idx)=> (
                <View key={idx} style={[s.chip, s.chipActive, { flexDirection:'row', alignItems:'center' }]}> 
                  <Text style={[s.chipTxtActive]}>{f.label}: {f.val}</Text>
                  <TouchableOpacity onPress={()=>{ f.setter(''); setPage(1); refetch(); }} style={{ marginLeft:6 }}>
                    <Ionicons name="close" size={14} color="#181512" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        ) : (
          <Text style={{ color: COLORS.yellow, paddingVertical:8 }}>Tanpa filter: menampilkan sekitar {pageSize} item stok acak.</Text>
        )}
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada data inventory.</Text> : null}
        renderItem={({ item }) => {
          const firstImg = pickFirstImage(item);
          const imgUri = firstImg ? toDisplayUrl(firstImg) : '';
          return (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/inventory/[id]', params: { id: String(item.id) } })}
            >
              <View style={s.cardRow}>
                <View style={s.thumbWrapLeft}>
                  {imgUri ? (
                    <Image source={{ uri: imgUri }} style={s.thumb} />
                  ) : (
                    <View style={[s.thumb, s.thumbPlaceholder]}>
                      <Ionicons name="image" size={18} color={COLORS.yellow} />
                    </View>
                  )}
                </View>
                <View style={{ flex:1 }}>
                  <View style={s.headerRow}>
                    <Text style={s.title}>{item.code || '(Tanpa Kode)'}</Text>
                    <Text style={[s.badge, s.badgeCategory]}>{item.category || '-'}</Text>
                  </View>
                  <Text style={s.name}>{item.name || '-'}</Text>
                  <View style={s.chipsRow}>
                    <View style={[s.chipSmall, s.chipSoft]}>
                      <Ionicons name="business" size={12} color={COLORS.gold} style={{ marginRight:6 }} />
                      <Text style={s.chipSmallTxt}>{(item.branchLocation || item.branch_location || '-')}</Text>
                    </View>
                    <View style={[s.chipSmall, s.chipSoft]}>
                      <Ionicons name="location" size={12} color={COLORS.gold} style={{ marginRight:6 }} />
                      <Text style={s.chipSmallTxt}>{(item.placement || item.placement_location || '-')}</Text>
                    </View>
                    <View style={[s.chipSmall, statusChipStyle(item)]}>
                      <Ionicons name="ellipse" size={8} color={COLORS.dark} style={{ marginRight:6 }} />
                      <Text style={[s.chipSmallTxt, { color: COLORS.dark }]}>{(item.statusEnum || item.status_enum || 'DRAFT')}</Text>
                    </View>
                  </View>
                  <View style={s.specsRow}>
                    <View style={s.specItem}>
                      <Ionicons name="speedometer" size={14} color={COLORS.gold} style={{ marginRight:6 }} />
                      <Text style={s.specTxt}>
                        {item.weightNet != null && item.weightNet !== ''
                          ? `${item.weightNet} gr`
                          : item.weight_net != null && item.weight_net !== ''
                          ? `${item.weight_net} gr`
                          : '-'}
                      </Text>
                    </View>
                    <View style={s.specItem}>
                      <Ionicons name="medal" size={14} color={COLORS.gold} style={{ marginRight:6 }} />
                      <Text style={s.specTxt}>{(item.goldType || item.gold_type || '-')}</Text>
                    </View>
                    <View style={s.specItem}>
                      <Ionicons name="color-palette" size={14} color={COLORS.gold} style={{ marginRight:6 }} />
                      <Text style={s.specTxt}>{(item.goldColor || item.gold_color || '-')}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={s.exoticDivider} />
              {(['ADMINISTRATOR','INVENTORY'].includes(String(user?.jobRole || user?.job_role || '').toUpperCase())) && (
                <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/inventory/[id]', params: { id: String(item.id), edit: '1' } })}
                    style={s.editMiniBtn}
                    activeOpacity={0.9}
                  >
                    <Text style={s.editMiniTxt}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
      {/* Pagination */}
      <View style={{ paddingHorizontal:16, paddingBottom:16 }}>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <Text style={{ color: COLORS.yellow }}>Page {page} / {totalPages}</Text>
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <TouchableOpacity disabled={page<=1} onPress={()=> { setPage(p=> Math.max(1, p-1)); refetch(); }} style={[s.pageBtn, page<=1 && { opacity:0.4 }]}>
              <Text style={s.pageBtnTxt}>Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={page>=totalPages} onPress={()=> { setPage(p=> Math.min(totalPages, p+1)); refetch(); }} style={[s.pageBtn, page>=totalPages && { opacity:0.4 }]}>
              <Text style={s.pageBtnTxt}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={()=> setFilterOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Filter Stok</Text>
            <View style={s.modalDivider} />
            <Text style={s.filterLabel}>Cabang</Text>
            <View style={s.filterRow}>{['','ASIA','SUN_PLAZA'].map(v=> (
              <TouchableOpacity key={`branch-${v||'ALL'}`} onPress={()=> setBranchLocation(v)} style={[s.chip, branchLocation===v && s.chipActive]}>
                <Text style={[s.chipTxt, branchLocation===v && s.chipTxtActive]}>{v||'ALL'}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={s.filterLabel}>Penempatan</Text>
            <View style={s.filterRow}>{['','ETALASE','PENYIMPANAN'].map(v=> (
              <TouchableOpacity key={`place-${v||'ALL'}`} onPress={()=> setPlacement(v)} style={[s.chip, placement===v && s.chipActive]}>
                <Text style={[s.chipTxt, placement===v && s.chipTxtActive]}>{v||'ALL'}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={s.filterLabel}>Status</Text>
            <View style={s.filterRow}>{['','DRAFT','ACTIVE','RESERVED','SOLD','RETURNED','DAMAGED'].map(v=> (
              <TouchableOpacity key={`status-${v||'ALL'}`} onPress={()=> setStatusEnum(v)} style={[s.chip, statusEnum===v && s.chipActive]}>
                <Text style={[s.chipTxt, statusEnum===v && s.chipTxtActive]}>{v||'ALL'}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={s.filterLabel}>Jenis Perhiasan</Text>
            <View style={s.filterRow}>{['', ...JENIS_BARANG_OPTIONS].map(v=> (
              <TouchableOpacity key={`cat-${v||'ALL'}`} onPress={()=> setCategory(v)} style={[s.chip, category===v && s.chipActive]}>
                <Text style={[s.chipTxt, category===v && s.chipActive && s.chipTxtActive]}>{v||'ALL'}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={s.filterLabel}>Jenis Emas</Text>
            <View style={s.filterRow}>{['', ...JENIS_EMAS_OPTIONS].map(v=> (
              <TouchableOpacity key={`gt-${v||'ALL'}`} onPress={()=> setGoldType(v)} style={[s.chip, goldType===v && s.chipActive]}>
                <Text style={[s.chipTxt, goldType===v && s.chipTxtActive]}>{v||'ALL'}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={s.filterLabel}>Warna Emas</Text>
            <View style={s.filterRow}>{['', ...WARNA_EMAS_OPTIONS].map(v=> (
              <TouchableOpacity key={`gc-${v||'ALL'}`} onPress={()=> setGoldColor(v)} style={[s.chip, goldColor===v && s.chipActive]}>
                <Text style={[s.chipTxt, goldColor===v && s.chipTxtActive]}>{v||'ALL'}</Text>
              </TouchableOpacity>
            ))}</View>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:12 }}>
              <TouchableOpacity onPress={()=> { onResetFilters(); }} style={[s.pageBtn, { backgroundColor:'#333' }]}>
                <Text style={[s.pageBtnTxt, { color: COLORS.gold }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> { setPage(1); setFilterOpen(false); refetch(); }} style={s.pageBtn}>
                <Text style={s.pageBtnTxt}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  searchWrap: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.card, borderRadius: 14, margin: 16, height: 40, borderWidth:1, borderColor: COLORS.border },
  searchInput: { flex:1, color: COLORS.yellow, paddingVertical: 8, paddingRight: 10, backgroundColor:'transparent' },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardRow: { flexDirection:'row', alignItems:'flex-start' },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  title: { color: COLORS.gold, fontWeight:'800' },
  name: { color: COLORS.yellow, fontSize: 12, marginTop: 2 },
  badge: { color: COLORS.yellow, fontWeight:'700', fontSize: 11 },
  badgeCategory: { backgroundColor:'#2b261f', borderRadius:10, paddingHorizontal:8, paddingVertical:2, overflow:'hidden' },
  meta: { color: COLORS.yellow, fontSize: 12, marginTop: 2 },
  chipsRow: { flexDirection:'row', flexWrap:'wrap', gap: 6, marginTop: 6 },
  chipSmall: { flexDirection:'row', alignItems:'center', borderWidth:1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginRight:6, marginBottom:6 },
  chipSmallTxt: { color: COLORS.yellow, fontSize: 11, fontWeight: '700' },
  chipSoft: { backgroundColor: '#1b1815' },
  specsRow: { flexDirection:'row', alignItems:'center', flexWrap:'wrap', marginTop: 6 },
  specItem: { flexDirection:'row', alignItems:'center', marginRight: 12, marginBottom: 4 },
  specTxt: { color: COLORS.yellow, fontSize: 12, fontWeight:'600' },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  filterChipWrap: { marginTop:8, flexBasis:'100%' },
  filterLabel: { color: COLORS.gold, fontWeight:'700', marginBottom:4 },
  filterRow: { flexDirection:'row', flexWrap:'wrap' },
  chip: { paddingVertical:6, paddingHorizontal:12, borderRadius:20, borderWidth:1, borderColor:COLORS.border, marginRight:6, marginBottom:6, backgroundColor:'#181512' },
  chipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  chipTxt: { color: COLORS.yellow, fontWeight:'600', fontSize:12 },
  chipTxtActive: { color: '#181512' },
  pageBtn: { paddingVertical:8, paddingHorizontal:14, backgroundColor: COLORS.gold, borderRadius:10, marginLeft:8 },
  pageBtnTxt: { color:'#181512', fontWeight:'800' },
  exoticDivider: { height: 1.5, backgroundColor: COLORS.gold, opacity: 0.25, marginTop: 8, borderRadius: 2 },
  thumbWrapLeft: { width:76, marginRight:10 },
  thumb: { width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#1b1815' },
  thumbPlaceholder: { alignItems:'center', justifyContent:'center' },
  editMiniBtn: { marginTop: 6, paddingVertical:6, paddingHorizontal:12, borderRadius:10, backgroundColor:'#2b261f', borderWidth:1, borderColor:COLORS.border },
  editMiniTxt: { color: COLORS.gold, fontWeight:'800', fontSize:12 },
  modalBackdrop: { flex:1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' },
  modalCard: { width:'90%', backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.gold, padding: 16 },
  modalTitle: { color: COLORS.gold, fontWeight:'800', fontSize:16 },
  modalDivider: { height: 2, backgroundColor: COLORS.gold, opacity: 0.2, borderRadius: 2, marginVertical: 10 },
});
