import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '@lib/api/client';
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
  const total = Number(data?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const anyFilterActive = !!(q || category || status || branchLocation || placement || statusEnum || goldType || goldColor);
  const onResetFilters = () => {
    setQ(''); setCategory(''); setStatus(''); setBranchLocation(''); setPlacement(''); setStatusEnum(''); setGoldType(''); setGoldColor(''); setPage(1);
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/inventory/[id]', params: { id: String(item.id) } })}
          >
            <View style={s.headerRow}>
              <Text style={s.title}>{item.code || '(Tanpa Kode)'}</Text>
              <Text style={s.badge}>{item.category || '-'}</Text>
            </View>
            <Text style={s.meta}>{item.name || '-'}</Text>
            <Text style={s.meta}>
              {(item.branchLocation || item.branch_location || '-')}
              {' • '}
              {(item.placement || item.placement_location || '-')}
            </Text>
            <Text style={s.meta}>
              Status: {(item.statusEnum || item.status_enum || 'DRAFT')}
              {' • Berat Bersih: '}
              {item.weightNet != null && item.weightNet !== ''
                ? `${item.weightNet} gr`
                : item.weight_net != null && item.weight_net !== ''
                ? `${item.weight_net} gr`
                : '-'}
              {' • '}Jenis Emas: {(item.goldType || item.gold_type || '-')}
              {' • '}Warna: {(item.goldColor || item.gold_color || '-')}
            </Text>
            <View style={s.exoticDivider} />
          </TouchableOpacity>
        )}
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
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  title: { color: COLORS.gold, fontWeight:'800' },
  badge: { color: COLORS.yellow, fontWeight:'700', fontSize: 11 },
  meta: { color: COLORS.yellow, fontSize: 12, marginTop: 2 },
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
  modalBackdrop: { flex:1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' },
  modalCard: { width:'90%', backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.gold, padding: 16 },
  modalTitle: { color: COLORS.gold, fontWeight:'800', fontSize:16 },
  modalDivider: { height: 2, backgroundColor: COLORS.gold, opacity: 0.2, borderRadius: 2, marginVertical: 10 },
});
