import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { OrderActionsModal } from './OrderActionsModal';

type Task = {
  id: number;
  stage?: string | null;
  status: 'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'AWAITING_VALIDATION'|'DONE'|'CANCELLED';
  notes?: string | null;
  createdAt: string;
  orderId: number;
  order?: any;
  assignedTo?: { id: string; fullName: string } | null;
};

type Group = { orderId: number; order?: any; tasks: Task[] };

export default function MyTasksScreen() {
  const { token, user } = useAuth();
  const [all, setAll] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'inbox'|'working'>('inbox');
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const load = useCallback(async () => {
    if (!token) return; setLoading(true);
    try {
      const res: Task[] = await api.tasks.list(token);
      const mine = Array.isArray(res) ? res.filter(t => t.assignedTo?.id === user?.id) : [];
      setAll(mine);
    } catch (e:any) {
      Alert.alert('Gagal memuat', e.message || String(e));
    } finally { setLoading(false); }
  }, [token, user?.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    // simple realtime via polling
    const t = setInterval(() => { load(); }, 15000);
    return () => clearInterval(t);
  }, [load]);

  const startTask = async (task: Task) => {
    if (!token) return;
    try {
      await api.tasks.start(token, task.id);
    } catch (e:any) { throw e; }
  };

  const requestDone = async (task: Task) => {
    if (!token || !user?.id) return;
    try {
      await api.tasks.requestDone(token, task.id, task.notes || undefined);
    } catch (e:any) { throw e; }
  };

  const startGroup = async (g: Group) => {
    if (!token) return;
    const orderId = g.orderId;
    setProcessing(p => ({ ...p, [orderId]: true }));
    try {
      const targets = g.tasks.filter(t => t.status === 'ASSIGNED');
      if (targets.length === 0) return;
      await Promise.all(targets.map(t => startTask(t)));
      await load();
    } catch (e:any) {
      Alert.alert('Gagal mulai', e.message || String(e));
    } finally {
      setProcessing(p => ({ ...p, [orderId]: false }));
    }
  };

  const requestDoneGroup = async (g: Group) => {
    if (!token) return;
    const orderId = g.orderId;
    setProcessing(p => ({ ...p, [orderId]: true }));
    try {
      const targets = g.tasks.filter(t => t.status === 'IN_PROGRESS');
      if (targets.length === 0) return;
      await Promise.all(targets.map(t => requestDone(t)));
      Alert.alert('Request', 'Semua tugas diminta validasi');
      await load();
    } catch (e:any) {
      Alert.alert('Gagal request selesai', e.message || String(e));
    } finally {
      setProcessing(p => ({ ...p, [orderId]: false }));
    }
  };

  const toggleCheck = async (t: Task, value: boolean) => {
    if (!token) return;
    try {
      if (value) await api.tasks.check(token, t.id);
      else await api.tasks.uncheck(token, t.id);
      await load();
    } catch (e:any) { Alert.alert('Gagal update checklist', e.message || String(e)); }
  };

  // group tasks by order
  const groups: Group[] = useMemo(() => {
    const byOrder = new Map<number, Group>();
    for (const t of all) {
      const g = byOrder.get(t.orderId) || { orderId: t.orderId, order: t.order, tasks: [] };
      g.tasks.push(t);
      byOrder.set(t.orderId, g);
    }
    return Array.from(byOrder.values());
  }, [all]);

  const filteredGroups = useMemo(() => {
    if (tab === 'inbox') return groups.filter(g => g.tasks.some(t => t.status === 'ASSIGNED'));
    return groups.filter(g => g.tasks.some(t => t.status === 'IN_PROGRESS' || t.status === 'AWAITING_VALIDATION'));
  }, [groups, tab]);

  const renderGroup = ({ item }: { item: Group }) => {
    const pending = item.tasks.filter(t => t.status === 'ASSIGNED');
    const working = item.tasks.filter(t => t.status === 'IN_PROGRESS');
    const waiting = item.tasks.filter(t => t.status === 'AWAITING_VALIDATION');
    const busy = !!processing[item.orderId];
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => { setSelectedOrder(item.order || { id: item.orderId }); setDetailOpen(true); }} style={styles.card}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <Text style={styles.title}>Order #{item.order?.code || item.orderId}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Text style={styles.countPill}>{item.tasks.length} tugas</Text>
            {tab === 'inbox' && pending.length > 0 ? (
              <TouchableOpacity disabled={busy} onPress={()=> startGroup(item)} style={[styles.smallBtn, busy && styles.smallBtnDisabled]}>
                <Text style={styles.smallBtnText}>{busy ? '...' : 'Mulai'}</Text>
              </TouchableOpacity>
            ) : null}
            {tab === 'working' && working.length > 0 ? (
              <TouchableOpacity disabled={busy} onPress={()=> requestDoneGroup(item)} style={[styles.smallBtn, busy && styles.smallBtnDisabled]}>
                <Text style={styles.smallBtnText}>{busy ? '...' : 'Request Selesai'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {item.order?.customerName ? <Text style={styles.subtle}>{item.order.customerName} • {item.order?.jenisBarang} • {item.order?.jenisEmas}</Text> : null}
        <View style={styles.divider} />
        {item.tasks.sort((a,b)=> String(a.stage||'').localeCompare(String(b.stage||''))).map(t => (
          <View key={t.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stage}>{t.stage || 'Tanpa Stage'}</Text>
              <Text style={styles.subtleSmall}>Status: {t.status}</Text>
            </View>
            {tab === 'working' && (t.status === 'IN_PROGRESS' || t.status === 'AWAITING_VALIDATION') ? (
              <TouchableOpacity onPress={() => toggleCheck(t, !(t as any).isChecked)} style={[styles.checkPill, (t as any).isChecked && styles.checkPillActive]}>
                <Text style={[styles.checkPillText, (t as any).isChecked && styles.checkPillTextActive]}>{(t as any).isChecked ? 'Checked' : 'Checklist'}</Text>
              </TouchableOpacity>
            ) : t.status === 'AWAITING_VALIDATION' ? (
              <Text style={styles.badge}>Menunggu Validasi</Text>
            ) : null}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex:1 }}>
      <View style={styles.tabs}>
        <TouchableOpacity onPress={()=> setTab('inbox')} style={[styles.tab, tab==='inbox' && styles.tabActive]}><Text style={tab==='inbox'?styles.tabActiveText:styles.tabText}>Inbox</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=> setTab('working')} style={[styles.tab, tab==='working' && styles.tabActive]}><Text style={tab==='working'?styles.tabActiveText:styles.tabText}>Sedang Dikerjakan</Text></TouchableOpacity>
      </View>
  <FlatList
        data={filteredGroups}
        keyExtractor={(it)=> String(it.orderId)}
        renderItem={renderGroup}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={!loading ? <Text style={{ textAlign:'center', marginTop: 40 }}>Tidak ada item</Text> : null}
      />
  <OrderActionsModal visible={detailOpen} order={selectedOrder} onClose={()=> setDetailOpen(false)} onChanged={()=> load()} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection:'row', borderBottomWidth:1, borderBottomColor:'#eee' },
  tab: { flex:1, paddingVertical: 12, alignItems:'center', borderBottomWidth:2, borderBottomColor:'transparent' },
  tabActive: { borderBottomColor:'#1976d2' },
  tabText: { color:'#666' },
  tabActiveText: { color:'#1976d2', fontWeight:'700' },
  card: { backgroundColor:'#fff', borderWidth:1, borderColor:'#eee', borderRadius:8, padding:12, marginBottom:12 },
  title: { fontSize:16, fontWeight:'700', color:'#111' },
  subtle: { color:'#555', marginTop:4 },
  subtleSmall: { color:'#777', fontSize:12 },
  divider: { height:1, backgroundColor:'#f0f0f0', marginVertical:8 },
  row: { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:6 },
  stage: { fontWeight:'600', color:'#222' },
  smallBtn: { backgroundColor:'#1976d2', paddingVertical:6, paddingHorizontal:10, borderRadius:6 },
  smallBtnText: { color:'#fff', fontWeight:'700' },
  smallBtnDisabled: { opacity: 0.6 },
  badge: { backgroundColor:'#fff8e1', color:'#ff8f00', paddingHorizontal:8, paddingVertical:4, borderRadius:6, overflow:'hidden' },
  countPill: { backgroundColor:'#eef3ff', color:'#3056d3', paddingHorizontal:8, paddingVertical:4, borderRadius:6, overflow:'hidden', fontWeight:'700' },
  checkPill: { borderWidth:1, borderColor:'#bbb', paddingHorizontal:10, paddingVertical:4, borderRadius:16 },
  checkPillActive: { backgroundColor:'#e8f5e9', borderColor:'#a5d6a7' },
  checkPillText: { color:'#333' },
  checkPillTextActive: { color:'#2e7d32', fontWeight:'700' },
});
