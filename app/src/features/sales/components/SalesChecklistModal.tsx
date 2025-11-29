import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const SalesChecklistModal: React.FC<{ visible: boolean; orderId: number | null; onClose: () => void }>= ({ visible, orderId, onClose }) => {
  const { token } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useQuery<any[]>({
    queryKey: ['tasks','order', orderId, 'sales-checklist'],
    queryFn: () => api.tasks.listByOrder(token || '', Number(orderId)),
    enabled: !!token && !!orderId && visible,
    refetchInterval: visible ? 6000 : false,
  });
  const tasks = Array.isArray(data) ? data : [];
  const grouped = tasks.slice().sort((a,b)=> String(a.stage||'').localeCompare(String(b.stage||''))).map(t => ({
    id: t.id,
    stage: t.stage || 'Sub-tugas',
    status: String(t.status || '').replace(/_/g,' '),
    isChecked: !!t.isChecked,
    actor: t.assignedTo?.fullName || t.assignedToName || t.assignedToId || '-',
  }));
  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
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
          {grouped.length === 0 ? (
            <Text style={s.empty}>Belum ada data checklist.</Text>
          ) : (
            grouped.map(g => (
              <View key={g.id} style={s.row}>
                <View style={{ flex:1 }}>
                  <Text style={s.stage} numberOfLines={1}>{g.stage}</Text>
                  <Text style={s.meta} numberOfLines={1}>{g.status} • {g.actor}</Text>
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
  meta: { color:'#bfae6a', fontSize:12, marginTop:2 },
  checkBadge: { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:6, paddingHorizontal:10, borderRadius:10, borderWidth:1, borderColor: COLORS.border, backgroundColor:'rgba(43,37,34,0.9)' },
  checked: { borderColor:'#2e7d32', backgroundColor:'rgba(46,125,50,0.12)' },
  checkText: { fontWeight:'800' },
});
