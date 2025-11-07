import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '@lib/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

type Task = {
  id: number;
  stage?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; fullName?: string | null } | null;
};

export const OrderVerificationModal: React.FC<{
  visible: boolean;
  orderId: number | null;
  onClose: () => void;
  onChanged?: () => void;
}> = ({ visible, orderId, onClose, onChanged }) => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [toast, setToast] = React.useState<string | null>(null);
  const { data, isLoading, refetch, isRefetching } = useQuery<Task[]>({
    queryKey: ['tasks','awaiting', orderId],
    queryFn: async () => api.tasks.awaitingValidation(token || '', Number(orderId)) as unknown as Promise<Task[]>,
    enabled: !!token && !!orderId && visible,
    refetchOnWindowFocus: true,
    refetchInterval: visible ? 8000 : false,
  });

  const grouped = React.useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const map = new Map<string, { userId: string; fullName: string; tasks: Task[] }>();
    rows.forEach(t => {
      const uid = String(t.assignedToId || 'unknown');
      const name = t.assignedTo?.fullName || uid;
      if (!map.has(uid)) map.set(uid, { userId: uid, fullName: name, tasks: [] });
      map.get(uid)!.tasks.push(t);
    });
    return Array.from(map.values());
  }, [data]);

  const mValidateTask = useMutation({
    mutationFn: (taskId: number) => api.tasks.validate(token || '', taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks','awaiting', orderId] });
      await qc.invalidateQueries({ queryKey: ['tasks','active'] });
      onChanged?.();
      setToast('Tugas berhasil divalidasi');
      setTimeout(() => setToast(null), 1500);
    },
  });
  const mValidateAll = useMutation({
    mutationFn: ({ userId }: { userId: string }) => api.tasks.validateUserForOrder(token || '', Number(orderId), userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks','awaiting', orderId] });
      await qc.invalidateQueries({ queryKey: ['tasks','active'] });
      onChanged?.();
      setToast('Semua tugas untuk pengguna ini tervalidasi');
      setTimeout(() => setToast(null), 1500);
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <LinearGradient
            colors={["rgba(255,215,0,0.18)", "rgba(255,215,0,0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.header}
          >
            <Text style={s.title}>Verifikasi Tugas</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={18} color={COLORS.gold} />
            </TouchableOpacity>
          </LinearGradient>
          {isLoading || isRefetching ? (
            <View style={{ paddingVertical: 16 }}><ActivityIndicator color={COLORS.gold} /></View>
          ) : grouped.length === 0 ? (
            <Text style={s.empty}>Tidak ada tugas menunggu verifikasi.</Text>
          ) : (
            <FlatList
              data={grouped}
              keyExtractor={g => g.userId}
              contentContainerStyle={{ paddingBottom: 8 }}
              renderItem={({ item: g }) => {
                const initials = (g.fullName || '?')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(x => x[0]?.toUpperCase())
                  .join('');
                return (
                  <View style={s.group}>
                    <View style={s.groupHeader}>
                      <View style={s.userMeta}>
                        <View style={s.avatar}><Text style={s.avatarText}>{initials || '?'}</Text></View>
                        <View>
                          <Text style={s.groupTitle}>{g.fullName}</Text>
                          <View style={s.countBadge}><Ionicons name="time-outline" size={12} color="#1b1b1b" /><Text style={s.countBadgeText}>{g.tasks.length} menunggu</Text></View>
                        </View>
                      </View>
                      <TouchableOpacity style={s.btnPrimary} disabled={mValidateAll.isPending}
                        onPress={() => mValidateAll.mutate({ userId: g.userId })}
                        activeOpacity={0.8}
                      >
                        {mValidateAll.isPending ? (
                          <ActivityIndicator color="#1b1b1b" size="small" />
                        ) : (
                          <View style={s.btnRow}><Ionicons name="checkmark-done" size={14} color="#1b1b1b" /><Text style={s.btnPrimaryText}>Validasi Semua</Text></View>
                        )}
                      </TouchableOpacity>
                    </View>
                    {g.tasks.map(t => (
                      <View key={t.id} style={s.taskRow}>
                        <View style={s.taskLeft}>
                          <View style={s.bullet} />
                          <Text style={s.taskStage}>{t.stage || `Task #${t.id}`}</Text>
                        </View>
                        <TouchableOpacity style={s.btnGhost} disabled={mValidateTask.isPending}
                          onPress={() => mValidateTask.mutate(t.id)}
                          activeOpacity={0.85}
                        >
                          {mValidateTask.isPending ? (
                            <ActivityIndicator color={COLORS.gold} size="small" />
                          ) : (
                            <View style={s.btnRow}><Ionicons name="checkmark" size={14} color={COLORS.gold} /><Text style={s.btnGhostText}>Validasi</Text></View>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                );
              }}
            />
          )}
          {toast ? (
            <View style={s.toast}><Ionicons name="checkmark-circle" size={16} color="#0f5132" /><Text style={s.toastText}>{toast}</Text></View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 },
  card: { backgroundColor: COLORS.card, borderRadius: 18, padding: 0, borderWidth:1, borderColor: COLORS.border, maxHeight: '80%', overflow:'hidden',
    ...Platform.select({ android: { elevation: 10 }, ios: { shadowColor:'#000', shadowOpacity:0.2, shadowRadius:12, shadowOffset:{ width:0, height:8 } } }) },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:12, borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:'rgba(255,215,0,0.15)' },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 16 },
  closeBtn: { padding: 6, borderRadius: 999, borderWidth:1, borderColor: COLORS.border },
  empty: { color: COLORS.yellow, textAlign:'center' },
  group: { marginHorizontal:14, marginTop:12, marginBottom: 8, backgroundColor: '#1b1815', borderRadius: 14, padding: 12, borderWidth:1, borderColor:'rgba(255,215,0,0.08)' },
  groupHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 8 },
  userMeta: { flexDirection:'row', alignItems:'center', gap:10 },
  avatar: { width:34, height:34, borderRadius:17, backgroundColor:'rgba(255,215,0,0.15)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.25)' },
  avatarText: { color: COLORS.gold, fontWeight:'900' },
  groupTitle: { color: COLORS.gold, fontWeight:'800' },
  countBadge: { marginTop:2, flexDirection:'row', alignItems:'center', gap:4, backgroundColor: COLORS.gold, paddingHorizontal:8, paddingVertical:2, borderRadius: 999 },
  countBadgeText: { color:'#1b1b1b', fontWeight:'800', fontSize:11 },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical: 8, borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:'rgba(255,215,0,0.08)' },
  taskLeft: { flexDirection:'row', alignItems:'center', gap:8 },
  bullet: { width:6, height:6, borderRadius:3, backgroundColor: COLORS.gold, opacity:0.8 },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  btnPrimary: { backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  btnPrimaryText: { color: '#1b1b1b', fontWeight:'800' },
  btnGhost: { borderWidth:1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor:'rgba(255,215,0,0.05)' },
  btnGhostText: { color: COLORS.gold, fontWeight:'800' },
  btnRow: { flexDirection:'row', alignItems:'center', gap:6 },
  toast: { position:'absolute', bottom:12, alignSelf:'center', backgroundColor:'#d1e7dd', paddingHorizontal:12, paddingVertical:8, borderRadius:12, borderWidth:1, borderColor:'#badbcc', flexDirection:'row', alignItems:'center', gap:6 },
  toastText: { color:'#0f5132', fontWeight:'700' },
});
