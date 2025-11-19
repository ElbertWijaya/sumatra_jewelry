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
  const { data, isLoading, isRefetching, refetch } = useQuery<any>({
    queryKey: ['inventory','list', q, category, status],
    queryFn: () => api.inventory.search(token || '', { q, category, status, limit: 100 }),
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
            <Text style={s.meta}>{item.location || '-'}</Text>
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
});
