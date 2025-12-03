import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { InlineSelect } from '@ui/atoms/InlineSelect';
import { JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS } from '@constants/orderOptions';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const InventoryDetailScreen: React.FC = () => {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const { id, edit } = useLocalSearchParams();
  const invId = Number(id);
  const canEdit = ['ADMINISTRATOR','INVENTORY'].includes(String(user?.jobRole || user?.job_role || '').toUpperCase());
  const { data } = useQuery<any>({ queryKey: ['inventory','detail', invId], queryFn: () => api.inventory.get(token || '', invId), enabled: !!token && !!invId });
  const item = data || {};
  const [editMode, setEditMode] = React.useState(Boolean(edit));
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
    ringSize:'',
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
      ringSize: raw.ring_size || raw.size || '',
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
  // no image grid on this page (summary kept minimal per request)

  const resetFormFromItem = () => {
    const normalized = normalizeInventory(item);
    if (normalized) setForm(normalized);
  };

  const statusChipStyle = (raw: any) => {
    const st = String(raw?.statusEnum || raw?.status_enum || form.statusEnum || 'DRAFT').toUpperCase();
    if (st === 'ACTIVE') return { backgroundColor: '#6bbf59', borderColor: '#4e9a3e' };
    if (st === 'RESERVED') return { backgroundColor: '#f0ad4e', borderColor: '#d48c1f' };
    if (st === 'SOLD') return { backgroundColor: '#d9534f', borderColor: '#b52b27' };
    if (st === 'RETURNED') return { backgroundColor: '#5bc0de', borderColor: '#2fa5c4' };
    if (st === 'DAMAGED') return { backgroundColor: '#9e9e9e', borderColor: '#7a7a7a' };
    return { backgroundColor: '#c7b26a', borderColor: COLORS.gold };
  };

  const formatDate = (v?: any) => {
    if (!v) return '-';
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString();
    } catch { return '-'; }
  };

  const isRingCategory = (cat?: string) => {
    const s = String(cat || '').toLowerCase();
    return s.includes('ring') || s.includes('cincin') || s.includes('women ring') || s.includes('man ring') || s === 'wr' || s === 'mr';
  };

  return (
    <>
      <ScrollView style={{ flex:1, backgroundColor: COLORS.dark }} contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <Text style={{ color: COLORS.gold, fontWeight:'800', fontSize:16 }}>Detail Stok</Text>
          {canEdit && !editMode && (
            <TouchableOpacity onPress={()=> setEditMode(true)} style={{ paddingVertical:8, paddingHorizontal:12, backgroundColor:'#2b261f', borderRadius:10, borderWidth:1, borderColor:COLORS.border }}>
              <Text style={{ color: COLORS.gold, fontWeight:'800' }}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary card removed per request (info already shown below) */}

        {/* Perhiasan */}
        <View style={s.card}>
          <Text style={s.title}>Informasi Perhiasan</Text>
          <View style={s.divider} />
          {editMode && canEdit ? (
            <>
              {/* Barcode (read-only, positioned above Kode) */}
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="barcode-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Barcode</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{(item?.barcode || '-') as any}</Text></View>
              <Text style={s.inputLabel}>Kode</Text>
              <TextInput editable value={form.code} onChangeText={(v)=>setForm(f=>({...f, code:v}))} style={s.input} />
              <Text style={s.inputLabel}>Nama</Text>
              <TextInput editable value={form.name} onChangeText={(v)=>setForm(f=>({...f, name:v}))} style={s.input} />
              <Text style={s.inputLabel}>Kategori</Text>
              <TextInput editable value={form.category} onChangeText={(v)=>setForm(f=>({...f, category:v}))} style={s.input} />
              {isRingCategory(form.category) && (
                <>
                  <Text style={s.inputLabel}>Ring Size</Text>
                  <TextInput editable value={form.ringSize} onChangeText={(v)=>setForm(f=>({...f, ringSize:v}))} style={s.input} />
                </>
              )}
            </>
          ) : (
            <>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="barcode-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Barcode</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{(item?.barcode || '-') as any}</Text></View>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="pricetag-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Kode</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.code || '-'}</Text></View>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="cube-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Nama</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.name || '-'}</Text></View>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="albums-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Kategori</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.category || '-'}</Text></View>
              {isRingCategory(form.category) && (
                <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="resize-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Ring Size</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.ringSize || '-'}</Text></View>
              )}
            </>
          )}
        </View>

        {/* Emas */}
        <View style={s.card}>
          <Text style={s.title}>Informasi Emas</Text>
          <View style={s.divider} />
          {editMode && canEdit ? (
            <>
              <Text style={s.inputLabel}>Jenis Emas</Text>
              <InlineSelect label="" value={form.goldType} options={JENIS_EMAS_OPTIONS} onChange={(v)=> setForm(f=>({...f, goldType:v}))} styleHeader={s.select} disabled={false} />
              <Text style={s.inputLabel}>Warna Emas</Text>
              <InlineSelect label="" value={form.goldColor} options={WARNA_EMAS_OPTIONS} onChange={(v)=> setForm(f=>({...f, goldColor:v}))} styleHeader={s.select} disabled={false} />
              <Text style={s.inputLabel}>Berat (gr)</Text>
              <TextInput editable value={form.weightNet} onChangeText={(v)=>setForm(f=>({...f, weightNet:v}))} style={s.input} keyboardType="decimal-pad" />
            </>
          ) : (
            <>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="medal-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Jenis</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.goldType || '-'}</Text></View>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="color-palette-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Warna</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.goldColor || '-'}</Text></View>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="speedometer-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Berat</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.weightNet || '-'}</Text></View>
            </>
          )}
        </View>

        {/* Lokasi & Status */}
        <View style={s.card}>
          <Text style={s.title}>Informasi Lokasi & Status</Text>
          <View style={s.divider} />
          {editMode && canEdit ? (
            <>
              <Text style={s.inputLabel}>Cabang / Area</Text>
              <InlineSelect label="" value={form.branchLocation} options={['ASIA','SUN_PLAZA']} onChange={(v)=> setForm(f=>({...f, branchLocation:v}))} styleHeader={s.select} disabled={false} />
              <Text style={s.inputLabel}>Penempatan Fisik</Text>
              <InlineSelect label="" value={form.placement} options={['ETALASE','PENYIMPANAN']} onChange={(v)=> setForm(f=>({...f, placement:v}))} styleHeader={s.select} disabled={false} />
              <Text style={s.inputLabel}>Status</Text>
              <InlineSelect label="" value={form.statusEnum} options={['DRAFT','ACTIVE','RESERVED','SOLD','RETURNED','DAMAGED']} onChange={(v)=> setForm(f=>({...f, statusEnum:v}))} styleHeader={s.select} disabled={false} />
            </>
          ) : (
            <>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="business-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Cabang</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.branchLocation || '-'}</Text></View>
              <View style={s.kvRow}><View style={s.kvKeyWrap}><Ionicons name="archive-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Penempatan</Text></View><Text style={s.kvColon}>:</Text><Text style={s.kvVal}>{form.placement || '-'}</Text></View>
              <View style={s.kvRow}>
                <View style={s.kvKeyWrap}><Ionicons name="ellipse-outline" size={14} color={COLORS.gold} style={s.kvIcon} /><Text style={s.kvKey}>Status</Text></View>
                <Text style={s.kvColon}>:</Text>
                <View style={{ paddingVertical: 2 }}>
                  <View style={[{ alignSelf:'flex-start', borderRadius:10, paddingHorizontal:10, paddingVertical:4, borderWidth:1 }, statusChipStyle(item)]}>
                    <Text style={{ color:'#181512', fontWeight:'900' }}>{String(item?.statusEnum || item?.status_enum || form.statusEnum || 'DRAFT')}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Identifikasi section removed per request (barcode moved to Perhiasan) */}

        {/* Tanggal */}
        <View style={s.card}>
          <Text style={s.title}>Informasi Tanggal</Text>
          <View style={s.divider} />
          <View style={s.dateRow}>
            <Ionicons name="calendar" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={s.row}><Text style={s.key}>Dibuat:</Text> <Text style={s.val}>{formatDate(item?.createdAt || item?.created_at)}</Text></Text>
          </View>
          <View style={s.dateRow}>
            <Ionicons name="calendar-clear" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={s.row}><Text style={s.key}>Diubah:</Text> <Text style={s.val}>{formatDate(item?.updatedAt || item?.updated_at)}</Text></Text>
          </View>
        </View>
      {editMode && canEdit ? (
        <>
          <Text style={s.label}>Detail Batu</Text>
          {form.stones.map((sStone, idx) => (
            <View key={idx} style={{flexDirection:'row', alignItems:'center', marginTop:6}}>
              <>
                <TextInput editable value={sStone.bentuk} onChangeText={(v)=> setForm(f=> ({...f, stones: f.stones.map((x,i)=> i===idx? { ...x, bentuk:v }: x) }))} style={[s.input,{flex:2, marginRight:4}]} placeholder="Bentuk" placeholderTextColor={COLORS.yellow} />
                <TextInput editable value={String(sStone.jumlah)} onChangeText={(v)=> setForm(f=> ({...f, stones: f.stones.map((x,i)=> i===idx? { ...x, jumlah:Number(v)||0 }: x) }))} style={[s.input,{flex:1, marginRight:4}]} keyboardType="numeric" placeholder="Jumlah" placeholderTextColor={COLORS.yellow} />
                <TextInput editable value={sStone.berat!=null? String(sStone.berat):''} onChangeText={(v)=> setForm(f=> ({...f, stones: f.stones.map((x,i)=> i===idx? { ...x, berat: v? Number(v): undefined }: x) }))} style={[s.input,{flex:1}]} keyboardType="decimal-pad" placeholder="Berat" placeholderTextColor={COLORS.yellow} />
              </>
              <TouchableOpacity onPress={()=> setForm(f=> ({...f, stones: f.stones.filter((_,i)=> i!==idx) }))} style={{marginLeft:4}}>
                <Text style={{color:'#b33', fontWeight:'800'}}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={()=> setForm(f=> ({...f, stones: [...f.stones, { bentuk:'', jumlah:0 }] }))} style={[s.saveBtn,{marginTop:10, backgroundColor:'#333'}]}>
            <Text style={[s.saveTxt,{color:COLORS.gold}]}>Tambah Batu</Text>
          </TouchableOpacity>
        </>
      ) : null}
        {/* Batu */}
        {form.stones.length > 0 && !editMode ? (
          <View style={s.card}>
            <Text style={s.title}>Informasi Ringkasan Batu</Text>
            <View style={s.divider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {form.stones.map((stone, index) => (
                <View key={index} style={s.stoneCard}>
                  <Text style={s.stoneTitle}>{stone.bentuk || '-'}</Text>
                  <Text style={s.stoneDetail}>Jumlah: {stone.jumlah || '-'}</Text>
                  <Text style={s.stoneDetail}>Berat: {stone.berat ? `${stone.berat} ct` : '-'}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Foto dihapus sesuai permintaan (sudah ada di halaman sebelumnya) */}

        {editMode && canEdit && (
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <TouchableOpacity onPress={()=>{ resetFormFromItem(); setEditMode(false); }} style={[s.saveBtn,{ backgroundColor:'#333', flex:1, marginRight:8 }]}>
              <Text style={[s.saveTxt,{ color:COLORS.gold }]}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> mUpdate.mutate(undefined, { onSuccess: ()=> setEditMode(false) })} style={[s.saveBtn,{ flex:1 }]}>
              <Text style={s.saveTxt}>Simpan</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const s = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, backgroundColor: COLORS.card, borderWidth:1, borderColor: COLORS.border, marginBottom: 12 },
  title: { color: COLORS.gold, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  divider: { height:1, backgroundColor: COLORS.border, opacity: 0.8, marginBottom: 8 },
  row: { color: COLORS.yellow, marginBottom: 4 },
  rowMuted: { color: '#9f8f5a' },
  key: { color: COLORS.gold, fontWeight:'700' },
  val: { color: COLORS.yellow, fontWeight:'600' },
  kvRow: { flexDirection:'row', alignItems:'flex-start', marginBottom: 6 },
  kvKeyWrap: { width: 120, flexDirection:'row', alignItems:'center' },
  kvIcon: { marginRight: 6 },
  kvKey: { color: COLORS.gold, fontWeight:'700' },
  kvColon: { width: 10, textAlign:'center', color: COLORS.gold, fontWeight:'700' },
  kvVal: { flex:1, color: COLORS.yellow, fontWeight:'600' },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  imageGridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumbWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', marginRight: 8, marginBottom: 8, backgroundColor: '#222', borderWidth: 1, borderColor: COLORS.border },
  imageThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  imageOverlay: { position:'absolute', left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.35)', paddingVertical:2, alignItems:'center' },
  viewText: { color:'#fff', fontSize:11, fontWeight:'700' },
  label: { color: COLORS.gold, fontWeight:'700', marginTop: 10 },
  inputLabel: { color: COLORS.gold, fontWeight:'700', marginTop: 10 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth:1, borderColor: COLORS.border, color: COLORS.yellow, padding: 10, marginTop: 6 },
  select: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, color: COLORS.yellow, fontWeight: '600', fontSize: 15, paddingVertical: 8, paddingHorizontal: 10, marginTop: 6 },
  saveBtn: { marginTop: 16, backgroundColor: COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems:'center' },
  saveTxt: { color:'#1b1b1b', fontWeight:'900' },
  chip: { backgroundColor:'#1b1815', borderColor: COLORS.border, borderWidth:1, borderRadius: 10, paddingVertical:4, paddingHorizontal:10 },
  chipTxt: { color: COLORS.yellow, fontWeight:'700', fontSize: 11 },
  stoneCard: { width: 120, padding: 10, borderRadius: 10, backgroundColor: '#1d1a16', borderWidth: 1, borderColor: COLORS.border, marginRight: 12 },
  stoneTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  stoneDetail: { color: COLORS.yellow, fontSize: 12, marginBottom: 2 },
});
