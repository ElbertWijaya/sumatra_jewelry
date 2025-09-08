import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InlineSelect } from '../components/InlineSelect';

type Props = { visible: boolean; order: any | null; onClose(): void; onChanged?(): void };

const ROLE_TEMPLATES: Record<string, string[]> = {
  DESIGNER: ['3D Design', 'Print Resin', 'Pengecekan'],
  CASTER: ['Pasang Tiang', 'Cor', 'Kasih Ke Admin'],
  CARVER: ['Reparasi', 'Cap', 'Kasih Ke Admin'],
  DIAMOND_SETTER: ['Pasang Berlian', 'Kasih Ke Admin'],
  FINISHER: ['Chrome Warna', 'Kasih Ke Admin'],
  INVENTORY: ['Input Data Inventory'],
};
const ROLE_OPTIONS = Object.keys(ROLE_TEMPLATES) as (keyof typeof ROLE_TEMPLATES)[];

export const OrderActionsModal: React.FC<Props> = ({ visible, order, onClose, onChanged }) => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<'assign'|'validate'>('assign');
  const [role, setRole] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [validations, setValidations] = useState<any[]>([]);

  useEffect(() => { if (!visible) return; setTab('assign'); setRole(''); setSelectedStages([]); setSelectedUserId(''); setUsers([]); setValidations([]); }, [visible]);

  useEffect(() => { // load users filtered by selected job role
    (async () => {
      if (!token || !visible) return;
      try { const res = await api.users.list(token, role ? { jobRole: role } : undefined); setUsers(res); } catch (e: any) { /* ignore */ }
    })();
  }, [role, token, visible]);

  useEffect(() => { // load awaiting validations for this order
    (async () => {
      if (!token || !visible || !order) return;
      try { const res = await api.tasks.awaitingValidation(token, order.id); setValidations(res); } catch (e:any) { /* ignore */ }
    })();
  }, [token, visible, order]);

  const toggleStage = (stage: string) => setSelectedStages(s => s.includes(stage) ? s.filter(x=>x!==stage) : [...s, stage]);

  const canValidate = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'kasir';

  const doAssignBulk = async () => {
    if (!token || !order) return;
    if (!role) { Alert.alert('Assign Tugas', 'Pilih Role Pekerjaan terlebih dahulu.'); return; }
    if (!selectedUserId) { Alert.alert('Assign Tugas', 'Pilih orang yang akan ditugaskan.'); return; }
    const cleaned = (ROLE_TEMPLATES[role] || []).filter(st => selectedStages.includes(st)).map(st => ({ stage: st }));
    if (cleaned.length === 0) { Alert.alert('Assign Tugas', 'Pilih minimal satu sub-task.'); return; }
    try {
      await api.tasks.assignBulk(token, { orderId: order.id, role, userId: selectedUserId, subtasks: cleaned });
      Alert.alert('Assign', 'Tugas berhasil dibuat.');
      onChanged?.();
      onClose();
    } catch (e: any) { Alert.alert('Gagal Assign', e.message || String(e)); }
  };

  const renderAssign = () => (
    <View>
  <InlineSelect label="Role Pekerjaan" value={role} options={ROLE_OPTIONS as any} onChange={(r)=> { setRole(r); setSelectedStages([]); }} />
  <InlineSelect label="Pilih Orang" value={selectedUserId} options={users.map(u=>`${u.id} • ${u.fullName}`)} onChange={(v)=> setSelectedUserId(v.split(' • ')[0])} />
      <Text style={styles.section}>Sub-tasks</Text>
      {(ROLE_TEMPLATES[role] || []).map((st) => {
        const active = selectedStages.includes(st);
        return (
          <TouchableOpacity key={st} onPress={()=> toggleStage(st)} style={[styles.stageItem, active && styles.stageItemActive]}> 
            <Text style={[styles.stageText, active && styles.stageTextActive]}>{st}</Text>
          </TouchableOpacity>
        );
      })}
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
  stageItem: { paddingVertical:10, paddingHorizontal:12, borderWidth:1, borderColor:'#ddd', borderRadius:8, marginBottom:8, backgroundColor:'#fff' },
  stageItemActive: { backgroundColor:'#e3f2fd', borderColor:'#90caf9' },
  stageText: { color:'#111' },
  stageTextActive: { color:'#0b5394', fontWeight:'700' },
});
