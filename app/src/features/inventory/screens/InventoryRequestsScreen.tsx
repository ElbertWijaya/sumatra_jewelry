import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const InventoryRequestsScreen: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useQuery<any[]>({
    queryKey: ['inventory','requests'],
    queryFn: () => api.inventory.requests(token || '') as Promise<any[]>,
    enabled: !!token,
    refetchInterval: 6000,
  });
  const items = Array.isArray(data) ? data : [];
  return (
    <View style={{ flex:1, backgroundColor: COLORS.dark }}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={items}
        keyExtractor={(it) => String(it.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada request inventory.</Text> : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.title}>Order #{item.order?.code || item.orderId}</Text>
              <Text style={s.badge}>Task: {item.taskCount}</Text>
            </View>
            <Text style={s.meta}>{item.order?.customerName || '-'}</Text>
            <Text style={s.meta}>{item.order?.jenisBarang || item.order?.jenis || '-'}</Text>
            <View style={s.footerRow}>
              <TouchableOpacity style={s.btnGhost} onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(item.orderId) } })}>
                <Ionicons name="open" size={14} color={COLORS.gold} />
                <Text style={s.btnGhostText}>Detail Order</Text>
              </TouchableOpacity>
              <View style={{ flex:1 }} />
              <TouchableOpacity style={s.btnPrimary} onPress={() => router.push({ pathname: '/inventory/create', params: { orderId: String(item.orderId) } })}>
                <Ionicons name="download" size={14} color="#1b1b1b" />
                <Text style={s.btnPrimaryText}>Masukkan ke Inventory</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  title: { color: COLORS.gold, fontWeight:'800' },
  badge: { color: COLORS.yellow, fontWeight:'700', fontSize: 11 },
  meta: { color: COLORS.yellow, fontSize: 12, marginTop: 2 },
  footerRow: { flexDirection:'row', alignItems:'center', marginTop: 10 },
  btnGhost: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  btnGhostText: { color: COLORS.yellow, fontWeight:'800' },
  btnPrimary: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color:'#1b1b1b', fontWeight:'900' },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
});
