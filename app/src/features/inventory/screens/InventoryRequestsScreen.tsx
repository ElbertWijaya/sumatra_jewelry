import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 24 }}
        data={items}
        keyExtractor={(it) => String(it.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={s.headerBlock}>
            <Text style={s.headerTitle}>Request Inventory Aktif</Text>
            <Text style={s.headerSubtitle}>Daftar order yang menunggu dibuatkan stok inventory. Otomatis refresh setiap beberapa detik.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            {isLoading ? (
              <>
                <ActivityIndicator color={COLORS.gold} size="small" />
                <Text style={s.empty}>Memuat request inventory...</Text>
              </>
            ) : (
              <Text style={s.empty}>Tidak ada request inventory.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const order = item.order || {};
          const customer = order.customerName || order.customer_name || '-';
          const jenisBarang = order.jenisBarang || order.item_type || order.jenis || '-';
          const jenisEmas = order.jenisEmas || order.goldType || order.gold_type || '-';
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.headerLeft}>
                  <View style={s.iconBadge}><Ionicons name="download" size={16} color={COLORS.gold} /></View>
                  <Text style={s.title} numberOfLines={1}>{order.code || `Order #${item.orderId}`}</Text>
                  <View style={s.statusPill}><Text style={s.statusText}>REQUEST INVENTORY</Text></View>
                </View>
                <Text style={s.badge}>Task: {item.taskCount}</Text>
              </View>

              <View style={s.goldDivider} />

              <View style={s.infoRow}>
                <View style={s.thumbnailBox}>
                  <Ionicons name="cube" size={24} color={COLORS.gold} />
                </View>
                <View style={{ flex:1, gap:6 }}>
                  <View style={s.infoPillPrimary}>
                    <Text style={s.infoLabel}>Customer</Text>
                    <Text style={s.infoValue} numberOfLines={1}>{customer}</Text>
                  </View>
                  <View style={s.infoPill}>
                    <Text style={s.infoLabel}>Jenis Barang</Text>
                    <Text style={s.infoValue} numberOfLines={1}>{jenisBarang}</Text>
                  </View>
                  <View style={s.infoPill}>
                    <Text style={s.infoLabel}>Jenis Emas</Text>
                    <Text style={s.infoValue} numberOfLines={1}>{jenisEmas}</Text>
                  </View>
                </View>
              </View>

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
          );
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  headerBlock: { marginBottom: 12 },
  headerTitle: { color: COLORS.gold, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { color: COLORS.yellow, fontSize: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 },
  headerLeft: { flexDirection:'row', alignItems:'center', gap:8, flex:1, minWidth:0 },
  iconBadge: { backgroundColor:'#2b2522', padding:6, borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 15, letterSpacing:0.3, flexShrink:1 },
  statusPill: { paddingHorizontal:8, paddingVertical:4, borderRadius:999, borderWidth:1, borderColor:COLORS.border, backgroundColor:'#201c18' },
  statusText: { color: COLORS.yellow, fontWeight:'800', fontSize:10, letterSpacing:0.6 },
  badge: { color: COLORS.yellow, fontWeight:'700', fontSize: 11, marginLeft: 8 },
  goldDivider: { height: 2, backgroundColor: 'rgba(255,215,0,0.16)', borderRadius: 999, marginVertical: 8 },
  infoRow: { flexDirection:'row', gap: 10, marginBottom: 6 },
  thumbnailBox: { width: 70, height: 70, borderRadius: 12, borderWidth:1, borderColor:COLORS.border, backgroundColor:'#201c18', alignItems:'center', justifyContent:'center' },
  infoPillPrimary: { minWidth:0, backgroundColor:'rgba(35,32,28,0.9)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 },
  infoPill: { minWidth:0, backgroundColor:'rgba(35,32,28,0.9)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 },
  infoLabel: { color: COLORS.gold, fontSize:11, fontWeight:'700' },
  infoValue: { color: COLORS.yellow, fontSize:12, fontWeight:'800', marginTop:2 },
  footerRow: { flexDirection:'row', alignItems:'center', marginTop: 10 },
  btnGhost: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  btnGhostText: { color: COLORS.yellow, fontWeight:'800' },
  btnPrimary: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color:'#1b1b1b', fontWeight:'900' },
  emptyWrap: { paddingVertical: 32, alignItems:'center', justifyContent:'center' },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 8 },
});
