import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { InlineSelect } from '@ui/atoms/InlineSelect';
import { JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS } from '@constants/orderOptions';

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
  const [form, setForm] = React.useState({
    code:'',
    category:'',
    name:'',
    weightNet:'',
    goldType:'',
    goldColor:'',
    branchLocation:'',
    placement:'',
    statusEnum:'',
    stones: [] as { bentuk:string; jumlah:number; berat?:number }[],
  });

  const normalizeInventory = React.useCallback((raw: any) => {
    if (!raw) return null;
    const toNumberString = (val: any) => (val != null && val !== '' ? String(val) : '');
    return {
      code: raw.code || '',
      category: raw.category || '',
      name: raw.name || '',
      weightNet: toNumberString(raw.weightNet ?? raw.weight_net ?? ''),
      goldType: raw.goldType || raw.gold_type || '',
      goldColor: raw.goldColor || raw.gold_color || '',
      branchLocation: raw.branchLocation || raw.branch_location || '',
      placement: raw.placement || raw.placement_location || '',
      statusEnum: raw.statusEnum || raw.status_enum || 'DRAFT',
      stones: Array.isArray(raw.inventorystone)
        ? raw.inventorystone.map((s: any) => ({
            bentuk: s.bentuk,
            jumlah: Number(s.jumlah) || 0,
            berat: s.berat != null ? Number(s.berat) : undefined,
          }))
        : [],
    };
  }, []);

  React.useEffect(() => {
    const normalized = normalizeInventory(item);
    if (normalized) setForm(normalized);
  }, [item?.id, normalizeInventory]);
  const mUpdate = useMutation({ mutationFn: async () => api.inventory.update(token || '', invId, {
    code: form.code,
    category: form.category,
    name: form.name,
    weightNet: form.weightNet ? Number(form.weightNet) : undefined,
    goldType: form.goldType || undefined,
    goldColor: form.goldColor || undefined,
    branchLocation: form.branchLocation as any || undefined,
    placement: form.placement as any || undefined,
    statusEnum: form.statusEnum as any || undefined,
    stones: form.stones.map(s => ({ bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat }))
  }), onSuccess: ()=> { qc.invalidateQueries({ queryKey: ['inventory','detail', invId] }); Alert.alert('Sukses','Data disimpan.'); } });
  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.dark }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.label}>Kode</Text>
      <TextInput editable={canEdit} value={form.code} onChangeText={(v)=>setForm(f=>({...f, code:v}))} style={s.input} />
      <Text style={s.label}>Kategori</Text>
      <TextInput editable={canEdit} value={form.category} onChangeText={(v)=>setForm(f=>({...f, category:v}))} style={s.input} />
      <Text style={s.label}>Nama</Text>
      <TextInput editable={canEdit} value={form.name} onChangeText={(v)=>setForm(f=>({...f, name:v}))} style={s.input} />
      <Text style={s.label}>Cabang / Area</Text>
      <InlineSelect label="" value={form.branchLocation} options={['ASIA','SUN_PLAZA']} onChange={(v)=> setForm(f=>({...f, branchLocation:v}))} styleHeader={s.select} disabled={!canEdit} />
      <Text style={s.label}>Penempatan Fisik</Text>
      <InlineSelect label="" value={form.placement} options={['ETALASE','PENYIMPANAN']} onChange={(v)=> setForm(f=>({...f, placement:v}))} styleHeader={s.select} disabled={!canEdit} />
      <Text style={s.label}>Berat (gr)</Text>
      <TextInput editable={canEdit} value={form.weightNet} onChangeText={(v)=>setForm(f=>({...f, weightNet:v}))} style={s.input} keyboardType="decimal-pad" />
      <Text style={s.label}>Jenis Emas</Text>
      <InlineSelect label="" value={form.goldType} options={JENIS_EMAS_OPTIONS} onChange={(v)=> setForm(f=>({...f, goldType:v}))} styleHeader={s.select} disabled={!canEdit} />
      <Text style={s.label}>Warna Emas</Text>
      <InlineSelect label="" value={form.goldColor} options={WARNA_EMAS_OPTIONS} onChange={(v)=> setForm(f=>({...f, goldColor:v}))} styleHeader={s.select} disabled={!canEdit} />
      <Text style={s.label}>Status</Text>
      <InlineSelect label="" value={form.statusEnum} options={['DRAFT','ACTIVE','RESERVED','SOLD','RETURNED','DAMAGED']} onChange={(v)=> setForm(f=>({...f, statusEnum:v}))} styleHeader={s.select} disabled={!canEdit} />
      <Text style={s.label}>Detail Batu</Text>
      {form.stones.map((sStone, idx) => (
        <View key={idx} style={{flexDirection:'row', alignItems:'center', marginTop:6}}>
          <TextInput editable={canEdit} value={sStone.bentuk} onChangeText={(v)=> setForm(f=> ({...f, stones: f.stones.map((x,i)=> i===idx? { ...x, bentuk:v }: x) }))} style={[s.input,{flex:2, marginRight:4}]} placeholder="Bentuk" placeholderTextColor={COLORS.yellow} />
          <TextInput editable={canEdit} value={String(sStone.jumlah)} onChangeText={(v)=> setForm(f=> ({...f, stones: f.stones.map((x,i)=> i===idx? { ...x, jumlah:Number(v)||0 }: x) }))} style={[s.input,{flex:1, marginRight:4}]} keyboardType="numeric" placeholder="Jumlah" placeholderTextColor={COLORS.yellow} />
          <TextInput editable={canEdit} value={sStone.berat!=null? String(sStone.berat):''} onChangeText={(v)=> setForm(f=> ({...f, stones: f.stones.map((x,i)=> i===idx? { ...x, berat: v? Number(v): undefined }: x) }))} style={[s.input,{flex:1}]} keyboardType="decimal-pad" placeholder="Berat" placeholderTextColor={COLORS.yellow} />
          {canEdit && (
            <TouchableOpacity onPress={()=> setForm(f=> ({...f, stones: f.stones.filter((_,i)=> i!==idx) }))} style={{marginLeft:4}}>
              <Text style={{color:'#b33', fontWeight:'800'}}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {canEdit && (
        <TouchableOpacity onPress={()=> setForm(f=> ({...f, stones: [...f.stones, { bentuk:'', jumlah:0 }] }))} style={[s.saveBtn,{marginTop:10, backgroundColor:'#333'}]}>
          <Text style={[s.saveTxt,{color:COLORS.gold}]}>Tambah Batu</Text>
        </TouchableOpacity>
      )}
      {canEdit && (
        <TouchableOpacity onPress={()=>mUpdate.mutate()} style={s.saveBtn}><Text style={s.saveTxt}>Simpan Perubahan</Text></TouchableOpacity>
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  label: { color: COLORS.gold, fontWeight:'700', marginTop: 10 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth:1, borderColor: COLORS.border, color: COLORS.yellow, padding: 10, marginTop: 6 },
  select: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, color: COLORS.yellow, fontWeight: '600', fontSize: 15, paddingVertical: 8, paddingHorizontal: 10, marginTop: 6 },
  saveBtn: { marginTop: 16, backgroundColor: COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems:'center' },
  saveTxt: { color:'#1b1b1b', fontWeight:'900' }
});
