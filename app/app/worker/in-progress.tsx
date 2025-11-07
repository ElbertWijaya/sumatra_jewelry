import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c', success:'#2e7d32' };

type Task = {
  id: number;
  orderId: number;
  stage?: string | null;
  status?: string | null;
  isChecked?: boolean;
  assignedToId?: string | null;
  order?: { id: number; code?: string | null; promisedReadyDate?: string | null } | null;
};

function formatDate(s?: string | null) {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s).slice(0,10);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function InProgressScreen() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id || user?.userId || null;

  const { data, isLoading, isRefetching, refetch } = useQuery<Task[]>({
    queryKey: ['tasks','active'],
    queryFn: () => api.tasks.list(token || '') as Promise<Task[]>,
    enabled: !!token,
    refetchInterval: 12000,
  });

  const tasks = Array.isArray(data) ? data : [];
  const mine = tasks.filter(t => String(t.assignedToId || '') === String(userId || ''));
  const groups = Object.values(mine.reduce((acc: Record<string, { orderId: number; code: string; promised?: string | null; tasks: Task[] }>, t) => {
    if (t.status !== 'IN_PROGRESS') return acc;
    const key = String(t.orderId);
    const code = t.order?.code || `(Order #${t.orderId})`;
    const promised = t.order?.promisedReadyDate || null;
    if (!acc[key]) acc[key] = { orderId: t.orderId, code, promised, tasks: [] };
    acc[key].tasks.push(t);
    return acc;
  }, {} as any));

  const canRequestDone = (g: { tasks: Task[] }) => {
    const inprog = g.tasks.filter(t => t.status === 'IN_PROGRESS');
    if (inprog.length === 0) return false;
    return inprog.every(t => !!t.isChecked);
  };

  const mCheck = useMutation({
    mutationFn: (p: { id: number; value: boolean }) => p.value ? api.tasks.check(token || '', p.id) : api.tasks.uncheck(token || '', p.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
    onError: (e: any) => Alert.alert('Gagal', String(e?.message || 'Gagal update checklist')),
  });
  const mRequestDone = useMutation({
    mutationFn: (orderId: number) => api.tasks.requestDoneMine(token || '', orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
    onError: (e: any) => Alert.alert('Gagal', String(e?.message || 'Gagal mengajukan verifikasi')),
  });

  return (
    <View style={s.container}>
      <FlatList
        data={groups.sort((a,b)=> b.orderId - a.orderId)}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<Text style={s.title}>Sedang Dikerjakan</Text>}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada order dalam proses.</Text> : null}
        renderItem={({ item: g }) => {
          const inprog = g.tasks.filter(t => t.status==='IN_PROGRESS');
          const checked = inprog.filter(t => !!t.isChecked).length;
          const total = inprog.length;
          const pct = total > 0 ? Math.round((checked/total) * 100) : 0;
          const ready = canRequestDone(g);
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.code}>{g.code}</Text>
                <View style={s.meta}><Ionicons name='calendar' size={12} color={COLORS.gold} /><Text style={s.metaText}>{formatDate(g.promised)}</Text></View>
              </View>
              <View style={s.progressBar}><View style={[s.progressFill,{ width: `${pct}%` }]} /></View>
              {g.tasks.sort((a,b)=>a.id-b.id).map(t => (
                <View key={t.id} style={s.taskRow}>
                  <View style={{ flex:1 }}>
                    <Text style={s.taskStage}>{t.stage || 'Sub-tugas'}</Text>
                  </View>
                  <TouchableOpacity style={[s.checkBtn, t.isChecked && s.checked]} disabled={mCheck.isPending}
                    onPress={() => mCheck.mutate({ id: t.id, value: !t.isChecked })}
                  >
                    <Ionicons name={t.isChecked ? 'checkbox' : 'square-outline'} size={18} color={t.isChecked ? COLORS.success : COLORS.gold} />
                    <Text style={[s.checkTxt, { color: t.isChecked ? COLORS.success : COLORS.yellow }]}>{t.isChecked ? 'Checked' : 'Checklist'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={s.footerRow}>
                <View style={{ flex:1 }} />
                <TouchableOpacity style={[s.btnPrimary, !ready && s.btnDisabled]} disabled={!ready || mRequestDone.isPending}
                  onPress={() => mRequestDone.mutate(g.orderId)}
                >
                  {mRequestDone.isPending ? <ActivityIndicator color="#1b1b1b" size="small" /> : <Text style={s.btnPrimaryText}>Ajukan Selesai</Text>}
                </TouchableOpacity>
              </View>
              {!ready && <Text style={s.hint}>Centang semua sub-tugas untuk dapat mengajukan verifikasi.</Text>}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.dark, padding: 16 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 18, marginBottom: 12 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth:1, borderColor: COLORS.border },
  cardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 },
  code: { color: COLORS.gold, fontWeight:'800', fontSize: 14 },
  meta: { flexDirection:'row', alignItems:'center', gap: 6 },
  metaText: { color: COLORS.yellow, fontWeight:'700' },
  progressBar: { height: 4, backgroundColor: 'rgba(255,215,0,0.16)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: COLORS.gold },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  checkBtn: { flexDirection:'row', alignItems:'center', gap: 6, paddingVertical:6, paddingHorizontal:10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(43,37,34,0.9)' },
  checked: { borderColor: COLORS.success, backgroundColor: 'rgba(46,125,50,0.12)' },
  checkTxt: { fontWeight:'800' },
  footerRow: { flexDirection:'row', alignItems:'center', marginTop: 8 },
  btnPrimary: { backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color: '#1b1b1b', fontWeight:'800' },
  btnDisabled: { backgroundColor: '#6b6b6b' },
  hint: { color: '#bfae6a', fontSize: 11, marginTop: 4 },
});
