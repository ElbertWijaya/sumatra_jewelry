import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { useFocusEffect } from '@react-navigation/native';

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

  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const toggle = (orderId: number) => setExpanded(p => ({ ...p, [orderId]: !p[orderId] }));

  return (
    <View style={s.container}>
      <FlatList
        data={groups.sort((a,b)=> b.orderId - a.orderId)}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<Text style={s.title}>Ditugaskan kepada saya</Text>}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada order yang perlu diterima.</Text> : null}
        renderItem={({ item: g }) => (
          <TouchableOpacity style={s.card} activeOpacity={0.9} onPress={() => toggle(g.orderId)}>
            <View style={s.cardHeader}>
              <Text style={s.code}>{g.code}</Text>
              <TouchableOpacity
                style={s.btnPrimary}
                onPress={() => mAcceptMine.mutate(g.orderId)}
                disabled={mAcceptMine.isPending}
              >
                {mAcceptMine.isPending ? <ActivityIndicator color="#1b1b1b" size="small" /> : <Text style={s.btnPrimaryText}>Terima Order</Text>}
              </TouchableOpacity>
            </View>
            {expanded[g.orderId] && (
              <OrderDetailInline orderId={g.orderId} />
            )}
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

// Inline order detail fetch component
const OrderDetailInline: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { token } = useAuth();
  const { data, isLoading } = useQuery<any>({
    queryKey: ['order', orderId],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
    staleTime: 0,
  });
  if (isLoading) return <View style={s.detailBox}><ActivityIndicator color={COLORS.gold} /></View>;
  const det: any = data || {};
  return (
    <View style={s.detailBox}>
      <View style={s.detailRow}><Text style={s.detailKey}>Customer</Text><Text style={s.detailVal} numberOfLines={1}>{det.customerName || '-'}</Text></View>
      <View style={s.detailRow}><Text style={s.detailKey}>Jenis</Text><Text style={s.detailVal} numberOfLines={1}>{det.jenisBarang || det.jenis || '-'}</Text></View>
      {det.ringSize ? <View style={s.detailRow}><Text style={s.detailKey}>Ukuran Cincin</Text><Text style={s.detailVal}>{det.ringSize}</Text></View> : null}
      <View style={s.detailRow}><Text style={s.detailKey}>Perkiraan Siap</Text><Text style={s.detailVal}>{det.promisedReadyDate ? det.promisedReadyDate.slice(0,10) : '-'}</Text></View>
      {det.catatan ? <View style={[s.detailRow,{alignItems:'flex-start'}]}><Text style={s.detailKey}>Catatan</Text><Text style={[s.detailVal,{flex:1}]} numberOfLines={3}>{det.catatan}</Text></View> : null}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.dark, padding: 16 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 18, marginBottom: 12 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth:1, borderColor: COLORS.border },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 },
  code: { color: COLORS.gold, fontWeight:'800', fontSize: 14 },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  taskMeta: { color: '#bfae6a', fontSize: 12, marginTop: 2 },
  btnPrimary: { backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color: '#1b1b1b', fontWeight:'800' },
  btnGhost: { borderWidth:1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnGhostText: { color: COLORS.gold, fontWeight:'800' },
  detailBox: { backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, padding:8, marginBottom:6 },
  detailRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  detailKey: { color: COLORS.gold, fontSize: 11, fontWeight:'700' },
  detailVal: { color: COLORS.yellow, fontSize: 12, fontWeight:'700', marginLeft: 8, flexShrink: 1 },
});
