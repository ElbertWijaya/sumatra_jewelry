import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const SalesChecklistModal: React.FC<{ visible: boolean; orderId: number | null; onClose: () => void }>= ({ visible: isOpen, orderId, onClose }) => {
  const { token } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useQuery<any[]>({
    queryKey: ['tasks','order', orderId, 'sales-checklist'],
    queryFn: () => api.tasks.listByOrder(token || '', Number(orderId)),
    enabled: !!token && !!orderId && isOpen,
    refetchInterval: isOpen ? 6000 : false,
  });
  const tasks = Array.isArray(data) ? data : [];
  // Filter out marker rows like 'Awal' (not actual checklist items)
  const visibleTasks = tasks.filter((t: any) => {
    const stage = String(t?.stage || '').trim();
    if (!stage) return false;
    return !/^awal$/i.test(stage); // exclude 'Awal'
  });
  // Sort unchecked first, then by stage name
  const grouped: { id: number; stage: string; isChecked: boolean }[] = visibleTasks
    .slice()
    .sort((a: any, b: any) => {
      const ac = !!a.isChecked; const bc = !!b.isChecked;
      if (ac !== bc) return ac ? 1 : -1;
      return String(a.stage||'').localeCompare(String(b.stage||''));
    })
    .map((t: any) => ({ id: Number(t.id), stage: String(t.stage || 'Sub-tugas'), isChecked: !!t.isChecked }));
  // Progress summary
  const total = grouped.length;
  const done = grouped.reduce((n: number, g: { isChecked: boolean }) => n + (g.isChecked ? 1 : 0), 0);
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  // Active worker info: show who is currently working (exclude DONE/CANCELLED)
  const activeWorker = React.useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const active = list.find((t: any) => {
      const s = String(t?.status || '').toUpperCase();
      const hasAssignee = !!(t?.assignedTo || t?.assignedToId || t?.assignedToName);
      return hasAssignee && s !== 'DONE' && s !== 'CANCELLED' && s !== 'CANCELED';
    });
    if (!active) return null;
    const name = active.assignedTo?.fullName || active.assignedToName || active.assignedTo?.email || active.assignedToId || 'Pengguna';
    return { name } as any;
  }, [tasks]);
  return (
    <Modal visible={isOpen} transparent animationType='fade' onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>Checklist Pekerja</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}><Ionicons name='close' size={18} color={COLORS.gold} /></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={()=>refetch()} style={s.refresh} activeOpacity={0.85}>
            <Ionicons name='refresh' size={14} color={COLORS.gold} style={{ marginRight:6 }} />
            <Text style={s.refreshText}>{isRefetching || isLoading ? 'Memuat...' : 'Refresh'}</Text>
          </TouchableOpacity>
          {/* Active worker info at top */}
          {activeWorker && (
            <View style={s.workerHeader}>
              <Ionicons name='briefcase-outline' size={14} color={COLORS.gold} style={{ marginRight:8 }} />
              <Text style={s.workerText}>Sedang dikerjakan oleh <Text style={s.workerName}>{activeWorker.name}</Text></Text>
            </View>
          )}
          {/* Progress summary */}
          <View style={s.progressWrap}>
            <Text style={s.progressText}>Progress {done}/{total} • {pct}%</Text>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: `${Math.min(100, Math.max(0, pct))}%` }]} />
            </View>
          </View>
          <View style={s.divider} />
          {grouped.length === 0 ? (
            <Text style={s.empty}>Belum ada data checklist.</Text>
          ) : (
            grouped.map(g => (
              <View key={g.id} style={s.row}>
                <View style={{ flex:1 }}>
                  <Text style={s.stage} numberOfLines={1}>{g.stage}</Text>
                </View>
                <View style={[s.checkBadge, g.isChecked ? s.checked : undefined]}>
                  <Ionicons name={g.isChecked ? 'checkbox' : 'square-outline'} size={16} color={g.isChecked ? '#2e7d32' : COLORS.gold} />
                  <Text style={[s.checkText, { color: g.isChecked ? '#2e7d32' : COLORS.yellow }]}>{g.isChecked ? 'Checked' : 'Checklist'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth:1, borderColor: COLORS.border },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize:16 },
  closeBtn: { padding:6, borderRadius:999, borderWidth:1, borderColor: COLORS.border },
  refresh: { alignSelf:'flex-end', flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,215,0,0.08)', paddingHorizontal:10, paddingVertical:6, borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.18)', marginBottom: 8 },
  refreshText: { color: COLORS.gold, fontWeight:'800', fontSize: 12 },
  empty: { color:'#bfae6a' },
  row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:6, borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'rgba(255,215,0,0.12)' },
  stage: { color: COLORS.yellow, fontWeight:'700' },
  workerHeader: { flexDirection:'row', alignItems:'center', backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 10, paddingVertical:8, paddingHorizontal:10, borderWidth:1, borderColor:'rgba(255,215,0,0.18)', marginBottom: 10 },
  workerText: { color: COLORS.yellow, fontWeight:'700' },
  workerName: { color: COLORS.gold, fontWeight:'800' },
  progressWrap: { marginBottom: 10 },
  progressText: { color: COLORS.yellow, fontWeight:'700', marginBottom: 6 },
  progressBarBg: { height: 8, backgroundColor:'rgba(255,215,0,0.12)', borderRadius: 999, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.gold },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,215,0,0.15)', marginBottom: 8 },
  checkBadge: { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:6, paddingHorizontal:10, borderRadius:10, borderWidth:1, borderColor: COLORS.border, backgroundColor:'rgba(43,37,34,0.9)' },
  checked: { borderColor:'#2e7d32', backgroundColor:'rgba(46,125,50,0.12)' },
  checkText: { fontWeight:'800' },
});
