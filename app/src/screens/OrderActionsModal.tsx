import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InlineSelect } from '../components/InlineSelect';

type Props = { visible: boolean; order: any | null; onClose(): void; onChanged?(): void };

const ROLE_OPTIONS = ['pengrajin','kasir','owner','admin'] as const;

export const OrderActionsModal: React.FC<Props> = ({ visible, order, onClose, onChanged }) => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<'assign'|'validate'>('assign');
  const [role, setRole] = useState<string>('pengrajin');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [subtasks, setSubtasks] = useState<{ stage?: string; notes?: string }[]>([{ stage: '', notes: '' }]);
  const [validations, setValidations] = useState<any[]>([]);

  useEffect(() => { if (!visible) return; setTab('assign'); setRole('pengrajin'); setSubtasks([{ stage: '', notes: '' }]); setSelectedUserId(''); setUsers([]); setValidations([]); }, [visible]);

  useEffect(() => { // load users by role
    (async () => {
      if (!token || !visible) return;
      try { const res = await api.users.list(token, role); setUsers(res); } catch (e: any) { /* ignore */ }
    })();
  }, [role, token, visible]);

  useEffect(() => { // load awaiting validations for this order
    (async () => {
      if (!token || !visible || !order) return;
      try { const res = await api.tasks.awaitingValidation(token, order.id); setValidations(res); } catch (e:any) { /* ignore */ }
    })();
  }, [token, visible, order]);

  const addSubtask = () => setSubtasks(s => [...s, { stage: '', notes: '' }]);
  const updateSubtask = (idx: number, patch: Partial<{ stage: string; notes: string }>) => setSubtasks(s => s.map((t,i)=> i===idx ? { ...t, ...patch } : t));
  const removeSubtask = (idx: number) => setSubtasks(s => s.filter((_,i)=> i!==idx));

  const canValidate = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'kasir';

  const doAssignBulk = async () => {
    if (!token || !order) return;
    if (!selectedUserId) { Alert.alert('Assign Tugas', 'Pilih orang yang akan ditugaskan.'); return; }
    const cleaned = subtasks.map(t => ({ stage: (t.stage||'').trim() || undefined, notes: (t.notes||'').trim() || undefined })).filter(t => t.stage || t.notes);
    if (cleaned.length === 0) { Alert.alert('Assign Tugas', 'Minimal satu sub-task harus diisi.'); return; }
    try {
      await api.tasks.assignBulk(token, { orderId: order.id, role, userId: selectedUserId, subtasks: cleaned });
      Alert.alert('Assign', 'Tugas berhasil dibuat.');
      onChanged?.();
      onClose();
    } catch (e: any) { Alert.alert('Gagal Assign', e.message || String(e)); }
  };

  const renderAssign = () => (
    <View>
      <InlineSelect label="Role" value={role} options={ROLE_OPTIONS as any} onChange={setRole} />
      <InlineSelect label="Pilih Orang" value={selectedUserId} options={users.map(u=>`${u.id} • ${u.fullName}`)} onChange={(v)=> setSelectedUserId(v.split(' • ')[0])} />
      <Text style={styles.section}>Sub-tasks</Text>
      {subtasks.map((t, idx) => (
        <View key={idx} style={styles.subtaskRow}>
          <TextInput placeholder="Stage" value={t.stage} onChangeText={(v)=>updateSubtask(idx,{stage:v})} style={styles.input} />
          <TextInput placeholder="Catatan (opsional)" value={t.notes} onChangeText={(v)=>updateSubtask(idx,{notes:v})} style={[styles.input,{flex:2}]} />
          <TouchableOpacity onPress={()=> removeSubtask(idx)} style={styles.removeBtn}><Text style={{ color:'#c00' }}>Hapus</Text></TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addSubtask} style={styles.addBtn}><Text style={{ color:'#1976d2' }}>+ Tambah Sub-task</Text></TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={doAssignBulk} style={styles.primary}><Text style={styles.primaryText}>Simpan & Assign</Text></TouchableOpacity>
    </View>
  );

  const doValidate = async (taskId: number) => {
    if (!token) return;
    try { await api.tasks.validate(token, taskId); const res = await api.tasks.awaitingValidation(token!, order!.id); setValidations(res); onChanged?.(); } catch (e:any) { Alert.alert('Gagal validasi', e.message || String(e)); }
  };

  const renderValidate = () => (
    <View>
      {!canValidate ? <Text>Anda tidak memiliki akses untuk validasi.</Text> : (
        validations.length === 0 ? <Text>Tidak ada tugas yang menunggu validasi.</Text> : (
          <FlatList data={validations} keyExtractor={(it)=>String(it.id)} renderItem={({item}) => (
            <View style={styles.valCard}>
              <Text style={{ fontWeight:'600' }}>{item.stage || 'Tanpa Stage'}</Text>
              <Text style={{ color:'#555' }}>Oleh: {item.assignedTo?.fullName || '-'}</Text>
              {item.notes ? <Text style={{ color:'#333' }}>Catatan: {item.notes}</Text> : null}
              <View style={{ height: 8 }} />
              <TouchableOpacity onPress={()=> doValidate(item.id)} style={[styles.primary, { paddingVertical: 8 }]}><Text style={styles.primaryText}>Validasi</Text></TouchableOpacity>
            </View>
          )} />
        )
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, paddingTop: 12 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={{ color:'#1976d2' }}>Tutup</Text></TouchableOpacity>
          <Text style={styles.title}>Order #{order?.code || order?.id}</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={()=> setTab('assign')} style={[styles.tab, tab==='assign' && styles.tabActive]}><Text style={tab==='assign'?styles.tabActiveText:styles.tabText}>Assign Tugas</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=> setTab('validate')} style={[styles.tab, tab==='validate' && styles.tabActive]}><Text style={tab==='validate'?styles.tabActiveText:styles.tabText}>Validasi</Text></TouchableOpacity>
        </View>
        <View style={{ padding: 16 }}>
          {tab === 'assign' ? renderAssign() : renderValidate()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomWidth:1, borderBottomColor:'#eee' },
  title: { fontWeight:'700', fontSize:16 },
  tabs: { flexDirection:'row', marginTop: 8 },
  tab: { flex:1, paddingVertical: 12, alignItems:'center', borderBottomWidth:2, borderBottomColor:'transparent' },
  tabActive: { borderBottomColor:'#1976d2' },
  tabText: { color:'#666' },
  tabActiveText: { color:'#1976d2', fontWeight:'700' },
  section: { fontWeight:'700', marginBottom: 8, marginTop: 8 },
  subtaskRow: { flexDirection:'row', gap: 8, alignItems:'center', marginBottom: 8 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:10, paddingVertical:8, flex:1 },
  removeBtn: { padding:8 },
  addBtn: { paddingVertical: 10 },
  primary: { backgroundColor:'#1976d2', paddingVertical: 12, borderRadius: 8, alignItems:'center' },
  primaryText: { color:'white', fontWeight:'700' },
  valCard: { padding: 12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom: 8, backgroundColor:'#fff' },
});
