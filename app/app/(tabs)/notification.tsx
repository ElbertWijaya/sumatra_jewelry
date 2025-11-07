import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';

type Order = {
  id: number;
  code?: string | null;
  customerName?: string | null;
  status?: string | null;
  updatedAt?: string | null;
};

export default function NotificationScreen() {
  const { token } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useQuery<Order[]>({
    queryKey: ['orders','notifications'],
    queryFn: () => api.orders.list(token || '') as Promise<Order[]>,
    enabled: !!token,
    refetchInterval: 6000,
    refetchOnWindowFocus: true,
  });

  const orders = Array.isArray(data) ? data : [];
  const items = orders
    .map(o => ({
      id: o.id,
      title: o.code || `Order #${o.id}`,
      subtitle: `${(o.customerName || 'Tanpa Nama')} • ${String(o.status || '-').replace(/_/g,' ')}`,
      time: o.updatedAt ? new Date(o.updatedAt) : null,
    }))
    .sort((a,b) => {
      const va = a.time?.getTime() ?? 0;
      const vb = b.time?.getTime() ?? 0;
      return vb - va;
    })
    .slice(0, 20);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications" size={20} color="#FFD700" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              {item.time && <Text style={styles.time}>{item.time.toLocaleString('id-ID')}</Text>}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications" size={28} color="#bfae6a" />
            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
          </View>
        }
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181512' },
  row: { flexDirection: 'row', padding: 12, borderRadius: 10, backgroundColor: '#23201c', marginBottom: 10, borderWidth: 1, borderColor: '#4e3f2c' },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,215,0,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  textWrap: { flex: 1 },
  title: { color: '#FFD700', fontWeight: '700', marginBottom: 2 },
  subtitle: { color: '#ffe082', fontSize: 12, marginBottom: 2 },
  time: { color: '#bfae6a', fontSize: 11 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#bfae6a', marginTop: 8 },
});

