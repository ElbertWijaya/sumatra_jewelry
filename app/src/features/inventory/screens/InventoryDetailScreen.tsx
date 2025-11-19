import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const InventoryDetailScreen: React.FC = () => {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const invId = Number(id);
  const canEdit = ['ADMINISTRATOR','INVENTORY'].includes(String(user?.jobRole || user?.job_role || '').toUpperCase());
  const { data, isLoading, refetch } = useQuery<any>({ queryKey: ['inventory','detail', invId], queryFn: () => api.inventory.get(token || '', invId), enabled: !!token && !!invId });
  const item = data || {};
  const [form, setForm] = React.useState({ code:'', category:'', name:'', location:'', weightNet:'' });
  React.useEffect(()=>{ if (item?.id) setForm({ code:item.code||'', category:item.category||'', name:item.name||'', location:item.location||'', weightNet: item.weightNet!=null ? String(item.weightNet) : '' }); }, [item?.id]);
  const mUpdate = useMutation({ mutationFn: async () => api.inventory.update(token || '', invId, { code: form.code, category: form.category, name: form.name, location: form.location, weightNet: form.weightNet ? Number(form.weightNet) : undefined }), onSuccess: ()=> { qc.invalidateQueries({ queryKey: ['inventory','detail', invId] }); Alert.alert('Sukses','Data disimpan.'); } });
  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.dark }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.label}>Kode</Text>
      <TextInput editable={canEdit} value={form.code} onChangeText={(v)=>setForm(f=>({...f, code:v}))} style={s.input} />
      <Text style={s.label}>Kategori</Text>
      <TextInput editable={canEdit} value={form.category} onChangeText={(v)=>setForm(f=>({...f, category:v}))} style={s.input} />
      <Text style={s.label}>Nama</Text>
      <TextInput editable={canEdit} value={form.name} onChangeText={(v)=>setForm(f=>({...f, name:v}))} style={s.input} />
      <Text style={s.label}>Lokasi</Text>
      <TextInput editable={canEdit} value={form.location} onChangeText={(v)=>setForm(f=>({...f, location:v}))} style={s.input} />
      <Text style={s.label}>Berat (gr)</Text>
      <TextInput editable={canEdit} value={form.weightNet} onChangeText={(v)=>setForm(f=>({...f, weightNet:v}))} style={s.input} keyboardType="decimal-pad" />
      {canEdit && (
        <TouchableOpacity onPress={()=>mUpdate.mutate()} style={s.saveBtn}><Text style={s.saveTxt}>Simpan Perubahan</Text></TouchableOpacity>
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  label: { color: COLORS.gold, fontWeight:'700', marginTop: 10 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth:1, borderColor: COLORS.border, color: COLORS.yellow, padding: 10, marginTop: 6 },
  saveBtn: { marginTop: 16, backgroundColor: COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems:'center' },
  saveTxt: { color:'#1b1b1b', fontWeight:'900' }
});
