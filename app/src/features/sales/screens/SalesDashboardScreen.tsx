import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

interface Task { id: number; orderId: number; stage?: string | null; status?: string | null; isChecked?: boolean; assignedToId?: string | null; assignedTo?: { fullName?: string | null } | null; order?: any; }
interface OrderRow { id: number; code?: string | null; status?: string | null; promisedReadyDate?: string | null; customerName?: string | null; jenisBarang?: string | null; }

export const SalesDashboardScreen: React.FC = () => {
  const { token, user } = useAuth();
  const { data: ordersData, isLoading: loadingOrders, refetch: refetchOrders, isRefetching: refetchingOrders } = useQuery<OrderRow[]>({
    queryKey: ['orders','sales-dashboard'],
    queryFn: () => api.orders.list(token || '') as any,
    enabled: !!token,
    refetchInterval: 12000,
  });
  const { data: tasksData, isLoading: loadingTasks, refetch: refetchTasks, isRefetching: refetchingTasks } = useQuery<Task[]>({
    queryKey: ['tasks','sales-dashboard'],
    queryFn: () => api.tasks.list(token || '') as any,
    enabled: !!token,
    refetchInterval: 6000,
  });

  const activeOrders = React.useMemo(() => {
    const rows = Array.isArray(ordersData) ? ordersData : [];
    return rows.filter(o => {
      const s = String(o.status || '').toUpperCase();
      return s === 'MENUNGGU' || s === 'DALAM_PROSES';
    });
  }, [ordersData]);

  // Monitoring groups: group tasks by order
  const monitoring = React.useMemo(() => {
    const tasks = Array.isArray(tasksData) ? tasksData : [];
    const byOrder = new Map<number, { order: any; workers: string[]; checked: number; total: number }>();
    tasks.forEach(t => {
      const oid = t.orderId;
      const o = t.order || {};
      if (!byOrder.has(oid)) byOrder.set(oid, { order: o, workers: [], checked: 0, total: 0 });
      const rec = byOrder.get(oid)!;
      const s = String(t.status || '').toUpperCase();
      if (s === 'IN_PROGRESS') {
        rec.total += 1;
        if (t.isChecked) rec.checked += 1;
      }
      if (t.assignedTo?.fullName) {
        const name = t.assignedTo.fullName;
        if (!rec.workers.includes(name)) rec.workers.push(name);
      }
    });
    return Array.from(byOrder.entries()).map(([orderId, rec]) => ({ orderId, ...rec }));
  }, [tasksData]);

  // Notifications: last 6 tasks status changes (simple heuristic: tasks with status AWAITING_VALIDATION or ASSIGNED recently)
  const notifications = React.useMemo(() => {
    const tasks = Array.isArray(tasksData) ? tasksData : [];
    return tasks.filter(t => {
      const s = String(t.status || '').toUpperCase();
      return s === 'AWAITING_VALIDATION' || s === 'ASSIGNED';
    }).slice(-6).reverse();
  }, [tasksData]);

  const refreshing = refetchingOrders || refetchingTasks || loadingOrders || loadingTasks;

  return (
    <FlatList
      style={{ flex:1, backgroundColor: COLORS.dark }}
      contentContainerStyle={{ padding:16, paddingBottom: 40 }}
      data={monitoring}
      keyExtractor={m => String(m.orderId)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { refetchOrders(); refetchTasks(); }} />}
      ListHeaderComponent={(
        <View>
          <Text style={s.heroTitle}>Dashboard Sales</Text>
          <Text style={s.heroSubtitle}>Pantau pesanan aktif dan progres pekerja real-time</Text>

          <View style={s.section}>
            <View style={s.sectionHeader}> 
              <Ionicons name='notifications-outline' size={18} color={COLORS.gold} style={{ marginRight:6 }} />
              <Text style={s.sectionTitle}>Notifikasi Terbaru</Text>
            </View>
            {notifications.length === 0 ? (<Text style={stylesEmpty.empty}>Belum ada notifikasi.</Text>) : (
              notifications.map(n => {
                const code = n.order?.code || `#${n.orderId}`;
                const statusLabel = String(n.status || '').replace(/_/g,' ');
                return (
                  <View key={n.id} style={stylesNotif.notifRow}>
                    <Text style={stylesNotif.notifCode}>{code}</Text>
                    <Text style={stylesNotif.notifStage}>{n.stage || 'Sub-tugas'}</Text>
                    <Text style={stylesNotif.notifStatus}>{statusLabel}</Text>
                  </View>
                );
              })
            )}
          </View>

          <View style={[s.section, { marginTop: 10 }]}>
            <View style={s.sectionHeader}> 
              <Ionicons name='bar-chart-outline' size={18} color={COLORS.gold} style={{ marginRight:6 }} />
              <Text style={s.sectionTitle}>Monitoring</Text>
            </View>
            <Text style={s.sectionCaption}>Pesanan aktif: siapa mengerjakan & progres checklist (IN_PROGRESS)</Text>
          </View>
        </View>
      )}
      renderItem={({ item }) => {
        const code = item.order?.code || `(Order #${item.orderId})`;
        const workersLabel = item.workers.length ? item.workers.join(', ') : 'Belum ditugaskan';
        const pct = item.total > 0 ? Math.round((item.checked / item.total) * 100) : 0;
        return (
          <View style={s.monitorCard}>
            <View style={s.monitorHeader}> 
              <Text style={s.monitorCode} numberOfLines={1}>{code}</Text>
              <View style={s.progressWrap}> 
                <View style={s.progressBar}><View style={[s.progressFill,{ width: `${pct}%` }]} /></View>
                <Text style={s.progressText}>{pct}%</Text>
              </View>
            </View>
            <Text style={s.monitorWorkers} numberOfLines={1}><MaterialCommunityIcons name='account-group-outline' size={14} color={COLORS.gold} /> {workersLabel}</Text>
            <Text style={s.monitorChecklist}>{item.checked}/{item.total} checklist selesai</Text>
            <TouchableOpacity style={s.monitorBtn} activeOpacity={0.85}>
              <Ionicons name='open-outline' size={14} color={'#1b1b1b'} style={{ marginRight:6 }} />
              <Text style={s.monitorBtnText}>Detail</Text>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={s.empty}>Tidak ada data monitoring.</Text>}
    />
  );
};

const s = StyleSheet.create({
  heroTitle: { color: COLORS.gold, fontSize:22, fontWeight:'800', marginBottom:4 },
  heroSubtitle: { color: COLORS.yellow, fontSize:13, marginBottom:12 },
  section: { marginBottom:16 },
  sectionHeader: { flexDirection:'row', alignItems:'center', marginBottom:6 },
  sectionTitle: { color: COLORS.gold, fontSize:16, fontWeight:'800' },
  sectionCaption: { color:'#bfae6a', fontSize:11, fontWeight:'600' },
  empty: { color:'#bfae6a', fontSize:12 },
  notifRow: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.card, borderRadius:10, padding:10, marginBottom:8, borderWidth:1, borderColor:COLORS.border },
  notifCode: { color: COLORS.gold, fontWeight:'800', flex:1 },
  notifStage: { color: COLORS.yellow, fontSize:12, flex:0.9 },
  notifStatus: { color:'#bfae6a', fontSize:11, fontWeight:'700' },
  monitorCard: { backgroundColor: COLORS.card, borderRadius:14, padding:14, borderWidth:1, borderColor:COLORS.border, marginBottom:12 },
  monitorHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  monitorCode: { color: COLORS.gold, fontWeight:'800', fontSize:14, flex:1, marginRight:8 },
  monitorWorkers: { color: COLORS.yellow, fontSize:12, marginBottom:4 },
  monitorChecklist: { color:'#bfae6a', fontSize:11, marginBottom:8 },
  progressWrap: { flexDirection:'row', alignItems:'center', gap:8 },
  progressBar: { width:80, height:6, backgroundColor:'rgba(255,215,0,0.18)', borderRadius:999, overflow:'hidden' },
  progressFill: { height:'100%', backgroundColor: COLORS.gold },
  progressText: { color: COLORS.gold, fontSize:11, fontWeight:'800' },
  monitorBtn: { flexDirection:'row', alignItems:'center', alignSelf:'flex-end', backgroundColor: COLORS.gold, paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  monitorBtnText: { color:'#1b1b1b', fontWeight:'800', fontSize:12 },
});

// Split notification & empty styles to avoid TS confusion using 's' variable reuse above
const stylesNotif = StyleSheet.create({
  notifRow: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.card, borderRadius:10, padding:10, marginBottom:8, borderWidth:1, borderColor:COLORS.border },
  notifCode: { color: COLORS.gold, fontWeight:'800', flex:1 },
  notifStage: { color: COLORS.yellow, fontSize:12, flex:0.9 },
  notifStatus: { color:'#bfae6a', fontSize:11, fontWeight:'700' },
});
const stylesEmpty = StyleSheet.create({ empty: { color:'#bfae6a', fontSize:12 } });
