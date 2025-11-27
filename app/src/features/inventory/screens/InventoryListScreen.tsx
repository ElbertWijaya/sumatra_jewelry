import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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
  const { data, isLoading, isRefetching, refetch } = useQuery<any>({
    queryKey: ['inventory','list', q, category, status, branchLocation, placement, statusEnum],
    queryFn: () => api.inventory.search(token || '', { q, category, status, branchLocation, placement, statusEnum, limit: 100 }),
    enabled: !!token,
    refetchInterval: 6000,
  });
  const items = Array.isArray(data?.items) ? data.items : [];
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
        <TouchableOpacity style={s.filterBtn} onPress={() => setQ('')}>
          <Ionicons name="close-circle" size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>
      {/* Filter Bar */}
      <View style={{ paddingHorizontal:16 }}>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
          <View style={s.filterChipWrap}>
            <Text style={s.filterLabel}>Cabang</Text>
            <View style={s.filterRow}>
              {['','ASIA','SUN_PLAZA'].map(v => (
                <TouchableOpacity key={v||'ALL'} onPress={()=> setBranchLocation(v)} style={[s.chip, branchLocation===v && s.chipActive]}>
                  <Text style={[s.chipTxt, branchLocation===v && s.chipTxtActive]}>{v||'ALL'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.filterChipWrap}>
            <Text style={s.filterLabel}>Penempatan</Text>
            <View style={s.filterRow}>
              {['','ETALASE','PENYIMPANAN'].map(v => (
                <TouchableOpacity key={v||'ALL'} onPress={()=> setPlacement(v)} style={[s.chip, placement===v && s.chipActive]}>
                  <Text style={[s.chipTxt, placement===v && s.chipTxtActive]}>{v||'ALL'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.filterChipWrap}>
            <Text style={s.filterLabel}>Status</Text>
            <View style={s.filterRow}>
              {['','DRAFT','ACTIVE','RESERVED','SOLD','RETURNED','DAMAGED'].map(v => (
                <TouchableOpacity key={v||'ALL'} onPress={()=> setStatusEnum(v)} style={[s.chip, statusEnum===v && s.chipActive]}>
                  <Text style={[s.chipTxt, statusEnum===v && s.chipTxtActive]}>{v||'ALL'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
            </Text>
          </TouchableOpacity>
        )}
      />
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
});
