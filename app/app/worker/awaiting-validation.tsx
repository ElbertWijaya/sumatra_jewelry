import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

type Task = {
  id: number;
  orderId: number;
  stage?: string | null;
  status?: string | null;
  assignedToId?: string | null;
  order?: { id: number; code?: string | null } | null;
};

export default function AwaitingValidationScreen() {
  const { token, user } = useAuth();
  const userId = user?.id || user?.userId || null;
  const router = useRouter();

  const { data, isLoading, isRefetching, refetch } = useQuery<Task[]>({
    queryKey: ['tasks','active'],
    queryFn: () => api.tasks.list(token || '') as Promise<Task[]>,
    enabled: !!token,
    refetchInterval: 6000,
  });

  const tasks = Array.isArray(data) ? data : [];
  const mine = tasks.filter(t => String(t.assignedToId || '') === String(userId || ''));
  const groups = Object.values(mine.reduce((acc: Record<string, { orderId: number; code: string; tasks: Task[] }>, t) => {
    if (t.status !== 'AWAITING_VALIDATION') return acc;
    const key = String(t.orderId);
    const code = t.order?.code || `(Order #${t.orderId})`;
    if (!acc[key]) acc[key] = { orderId: t.orderId, code, tasks: [] };
    acc[key].tasks.push(t);
    return acc;
  }, {} as any));

  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const toggle = (orderId: number) => setExpanded(p => ({ ...p, [orderId]: !p[orderId] }));

  return (
    <View style={s.container}>
      <FlatList
        data={groups.sort((a,b)=> b.orderId - a.orderId)}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<Text style={s.title}>Menunggu Verifikasi</Text>}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada order yang menunggu verifikasi.</Text> : null}
        renderItem={({ item: g }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(g.orderId), src: 'worker', fromWorker: '1' } })}
            onLongPress={() => toggle(g.orderId)}
          >
            <View style={s.cardHeader}>
              <View style={s.headerLeft}>
                <View style={s.iconBadge}><Ionicons name="checkmark-done-outline" size={16} color={COLORS.gold} /></View>
                <Text style={s.code} numberOfLines={1}>{g.code}</Text>
              </View>
              <View style={s.statusPill}><Text style={s.statusText}>MENUNGGU VERIFIKASI</Text></View>
            </View>
            <View style={s.goldDivider} />
            <OrderMetaPreview orderId={g.orderId} />
            {expanded[g.orderId] && <OrderDetailInline orderId={g.orderId} />}
            {g.tasks.sort((a,b)=>a.id-b.id).map(t => (
              <View key={t.id} style={s.taskRow}>
                <Text style={s.taskStage}>{t.stage || 'Sub-tugas'}</Text>
                <Text style={s.taskMeta}>AWAITING_VALIDATION</Text>
              </View>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const OrderDetailInline: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { token } = useAuth();
  const { data, isLoading } = useQuery<any>({
    queryKey: ['order', orderId],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
  });
  if (isLoading) return <View style={s.detailBox}><ActivityIndicator color={COLORS.gold} /></View>;
  const det: any = data || {};
  return (
    <View style={s.detailBox}>
      <View style={s.detailRow}><Text style={s.detailKey}>Customer</Text><Text style={s.detailVal} numberOfLines={1}>{det.customerName || '-'}</Text></View>
      <View style={s.detailRow}><Text style={s.detailKey}>Jenis</Text><Text style={s.detailVal} numberOfLines={1}>{det.jenisBarang || det.jenis || '-'}</Text></View>
      {det.ringSize ? <View style={s.detailRow}><Text style={s.detailKey}>Ukuran Cincin</Text><Text style={s.detailVal}>{det.ringSize}</Text></View> : null}
      <View style={s.detailRow}><Text style={s.detailKey}>Perkiraan Siap</Text><Text style={s.detailVal}>{det.promisedReadyDate ? String(det.promisedReadyDate).slice(0,10) : '-'}</Text></View>
      {det.catatan ? <View style={[s.detailRow,{alignItems:'flex-start'}]}><Text style={s.detailKey}>Catatan</Text><Text style={[s.detailVal,{flex:1}]} numberOfLines={3}>{det.catatan}</Text></View> : null}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.dark, padding: 16 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 18, marginBottom: 12 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 12, marginBottom: 12, borderWidth:1, borderColor: COLORS.border },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  headerLeft: { flexDirection:'row', alignItems:'center', gap:8, flex:1, minWidth:0 },
  iconBadge: { backgroundColor:'#2b2522', padding:6, borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  code: { color: COLORS.gold, fontWeight:'800', fontSize: 15, letterSpacing:0.3, flexShrink:1 },
  statusPill: { paddingHorizontal:10, paddingVertical:4, borderRadius:999, borderWidth:1, borderColor:COLORS.border, backgroundColor:'#201c18' },
  statusText: { color: COLORS.yellow, fontWeight:'800', fontSize:10, letterSpacing:0.6 },
  goldDivider: { height: 2, backgroundColor: 'rgba(255,215,0,0.16)', borderRadius: 999, marginVertical: 8 },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  taskMeta: { color: '#bfae6a', fontSize: 12 },
  detailBox: { backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, padding:8, marginBottom:6 },
  detailRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  detailKey: { color: COLORS.gold, fontSize: 11, fontWeight:'700' },
  detailVal: { color: COLORS.yellow, fontSize: 12, fontWeight:'700', marginLeft: 8, flexShrink: 1 },
});

// Lightweight meta preview to add context without expanding
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
  const promised = o.promisedReadyDate ? String(o.promisedReadyDate).slice(0,10) : '-';
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
        <View style={{ flex:1, minWidth:0, backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 }}>
          <Text style={{ color: COLORS.gold, fontSize:11, fontWeight:'700' }}>Customer</Text>
          <Text style={{ color: COLORS.yellow, fontSize:12, fontWeight:'800' }} numberOfLines={1}>{customer}</Text>
        </View>
        <View style={{ flex:1, minWidth:0, backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8 }}>
          <Text style={{ color: COLORS.gold, fontSize:11, fontWeight:'700' }}>Jenis</Text>
          <Text style={{ color: COLORS.yellow, fontSize:12, fontWeight:'800' }} numberOfLines={1}>{jenis}</Text>
        </View>
      </View>
      <View style={{ marginTop: 6, alignSelf:'flex-start', backgroundColor:'#201c18', borderRadius:999, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:COLORS.border }}>
        <Text style={{ color: COLORS.yellow, fontSize:11, fontWeight:'700' }}>Perkiraan Siap: {promised}</Text>
      </View>
    </View>
  );
};
