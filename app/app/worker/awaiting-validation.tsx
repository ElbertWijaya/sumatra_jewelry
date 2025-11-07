import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
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

  const { data, isLoading, isRefetching, refetch } = useQuery<Task[]>({
    queryKey: ['tasks','active'],
    queryFn: () => api.tasks.list(token || '') as Promise<Task[]>,
    enabled: !!token,
    refetchInterval: 12000,
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

  return (
    <View style={s.container}>
      <FlatList
        data={groups.sort((a,b)=> b.orderId - a.orderId)}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<Text style={s.title}>Menunggu Verifikasi</Text>}
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada order yang menunggu verifikasi.</Text> : null}
        renderItem={({ item: g }) => (
          <View style={s.card}>
            <Text style={s.code}>{g.code}</Text>
            {g.tasks.sort((a,b)=>a.id-b.id).map(t => (
              <View key={t.id} style={s.taskRow}>
                <Text style={s.taskStage}>{t.stage || 'Sub-tugas'}</Text>
                <Text style={s.taskMeta}>AWAITING_VALIDATION</Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.dark, padding: 16 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 18, marginBottom: 12 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth:1, borderColor: COLORS.border },
  code: { color: COLORS.gold, fontWeight:'800', fontSize: 14, marginBottom: 6 },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  taskMeta: { color: '#bfae6a', fontSize: 12 },
});
