import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

type Task = {
  id: number;
  orderId: number;
  stage?: string | null;
  status?: string | null;
  assignedToId?: string | null;
  order?: { id: number; code?: string | null } | null;
};

export default function AssignedScreen() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id || user?.userId || null;
  const router = useRouter();

  const { data, isLoading, isRefetching, refetch, error } = useQuery<Task[]>({
    queryKey: ['tasks','active'],
    queryFn: () => api.tasks.list(token || '') as Promise<Task[]>,
    enabled: !!token,
    refetchInterval: 6000,
    staleTime: 0,
  });

  useFocusEffect(React.useCallback(() => {
    if (token) refetch();
  }, [token, refetch]));

  const tasks = Array.isArray(data) ? data : [];
  const mine = tasks.filter(t => String(t.assignedToId || '') === String(userId || ''));
  const groups = Object.values(mine.reduce((acc: Record<string, { orderId: number; code: string; tasks: Task[] }>, t) => {
    if (t.status !== 'ASSIGNED') return acc;
    const key = String(t.orderId);
    const code = t.order?.code || `(Order #${t.orderId})`;
    if (!acc[key]) acc[key] = { orderId: t.orderId, code, tasks: [] };
    acc[key].tasks.push(t);
    return acc;
  }, {} as any));

  const mAcceptMine = useMutation({
    mutationFn: (orderId: number) => api.tasks.acceptMine(token || '', orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
    onError: (e: any) => Alert.alert('Gagal', String(e?.message || 'Gagal menerima order')),
  });
  const mStart = useMutation({
    mutationFn: (taskId: number) => api.tasks.start(token || '', taskId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
    onError: (e: any) => Alert.alert('Gagal', String(e?.message || 'Gagal memulai tugas')),
  });

  // Removed inline expansion; pressing card now navigates to full order detail screen.

  return (
    <View style={s.container}>
      <FlatList
        data={groups.sort((a,b)=> b.orderId - a.orderId)}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<Text style={s.title}>Ditugaskan kepada saya</Text>}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada order yang perlu diterima.</Text> : null}
        renderItem={({ item: g }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(g.orderId), src: 'worker', fromWorker: '1' } })}
          >
            <View style={s.cardHeader}>
              <View style={s.headerLeft}>
                <View style={s.iconBadge}><MaterialCommunityIcons name="account-tie" size={16} color={COLORS.gold} /></View>
                <Text style={s.code} numberOfLines={1}>{g.code}</Text>
                <View style={s.statusPill}><Text style={s.statusText}>DITUGASKAN</Text></View>
              </View>
              <TouchableOpacity
                style={s.btnPrimary}
                onPress={() => mAcceptMine.mutate(g.orderId)}
                disabled={mAcceptMine.isPending}
              >
                {mAcceptMine.isPending ? <ActivityIndicator color="#1b1b1b" size="small" /> : <Text style={s.btnPrimaryText}>Terima</Text>}
              </TouchableOpacity>
            </View>
            <View style={s.goldDivider} />
            <OrderMetaPreview orderId={g.orderId} />
            {g.tasks.sort((a,b)=>a.id-b.id).map(t => (
              <View key={t.id} style={s.taskRow}>
                <View style={{ flex:1 }}>
                  <Text style={s.taskStage} numberOfLines={1}>{t.stage || 'Sub-tugas'}</Text>
                  <Text style={s.taskMeta}>ASSIGNED</Text>
                </View>
                <TouchableOpacity style={s.btnGhost} onPress={() => mStart.mutate(t.id)} disabled={mStart.isPending}>
                  {mStart.isPending ? <ActivityIndicator color={COLORS.gold} size="small" /> : <Text style={s.btnGhostText}>Mulai</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}


const s = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.dark, padding: 16 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 18, marginBottom: 12 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 12, marginBottom: 12, borderWidth:1, borderColor: COLORS.border },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 },
  headerLeft: { flexDirection:'row', alignItems:'center', gap:8, flex:1, minWidth:0 },
  iconBadge: { backgroundColor:'#2b2522', padding:6, borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  code: { color: COLORS.gold, fontWeight:'800', fontSize: 15, letterSpacing:0.3, flexShrink:1 },
  statusPill: { paddingHorizontal:8, paddingVertical:4, borderRadius:999, borderWidth:1, borderColor:COLORS.border, backgroundColor:'#201c18' },
  statusText: { color: COLORS.yellow, fontWeight:'800', fontSize:10, letterSpacing:0.6 },
  goldDivider: { height: 2, backgroundColor: 'rgba(255,215,0,0.16)', borderRadius: 999, marginVertical: 8 },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  taskMeta: { color: '#bfae6a', fontSize: 12, marginTop: 2 },
  btnPrimary: { backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color: '#1b1b1b', fontWeight:'800' },
  btnGhost: { borderWidth:1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnGhostText: { color: COLORS.gold, fontWeight:'800' },
  // Removed inline detail styles (detailBox, detailRow, detailKey, detailVal) to avoid duplication.
});

// Small meta preview below header (lightweight info)
const OrderMetaPreview: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { token } = useAuth();
  const { data } = useQuery<any>({
    queryKey: ['order','preview', orderId],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
    staleTime: 30_000,
  });
  const o = data || {};
  const customer = o.customerName || '-';
  const jenis = o.jenisBarang || o.jenis || '-';
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:6 }}>
      <View style={{ flex:1, minWidth:0, backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 }}>
        <Text style={{ color: COLORS.gold, fontSize:11, fontWeight:'700' }}>Customer</Text>
        <Text style={{ color: COLORS.yellow, fontSize:12, fontWeight:'800' }} numberOfLines={1}>{customer}</Text>
      </View>
      <View style={{ flex:1, minWidth:0, backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 }}>
        <Text style={{ color: COLORS.gold, fontSize:11, fontWeight:'700' }}>Jenis</Text>
        <Text style={{ color: COLORS.yellow, fontSize:12, fontWeight:'800' }} numberOfLines={1}>{jenis}</Text>
      </View>
    </View>
  );
};
