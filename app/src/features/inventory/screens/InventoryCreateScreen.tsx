import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@lib/context/AuthContext';
import { api, API_URL } from '@lib/api/client';
import * as ImagePicker from 'expo-image-picker';
import { InlineSelect } from '@ui/atoms/InlineSelect';
import { PremiumButton } from '@ui/atoms/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, BENTUK_BATU_OPTIONS, emptyStone, StoneFormItem } from '@constants/orderOptions';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const InventoryCreateScreen: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const ordId = Number(orderId);
  const [form, setForm] = useState({
    code:'',
    category:'', // will store Jenis Barang
    location:'',
    weightNet:'',
    name:'',
    goldType:'',
    goldColor:'',
  });
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [stones, setStones] = useState<StoneFormItem[]>([]);
  const [expandedStoneIndex, setExpandedStoneIndex] = useState<number | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) { Alert.alert('Izin dibutuhkan', 'Mohon izinkan akses galeri.'); return; }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (pickerResult.canceled) return;
    const asset = pickerResult.assets?.[0];
    if (!asset?.uri) return;
    try {
      const f = new FormData();
      f.append('file', { uri: asset.uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
      const res: any = await api.files.upload(token || '', f);
      if (res?.url) setImages(prev => [...prev, res.url]);
    } catch(e:any) { Alert.alert('Gagal upload', e.message || String(e)); }
  };

  const canSubmit = useMemo(() => !saving && ordId && form.category && form.code && images.length > 0, [saving, ordId, form, images]);

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const validStones = stones.filter(s => s.bentuk && (s.jumlah || s.berat));
      const totalCount = validStones.reduce((acc, s) => acc + (Number(s.jumlah || 0) || 0), 0);
      const totalWeight = validStones.reduce((acc, s) => acc + (Number(s.berat || 0) || 0), 0);
      await api.inventory.create(token || '', {
        orderId: ordId,
        code: form.code,
        category: form.category,
        goldType: form.goldType || undefined,
        goldColor: form.goldColor || undefined,
        location: form.location || undefined,
        weightNet: form.weightNet ? Number(form.weightNet) : undefined,
        stoneCount: totalCount || undefined,
        stoneWeight: totalWeight || undefined,
        dimensions: validStones.length ? JSON.stringify(validStones) : undefined,
        name: form.name || undefined,
        images,
      });
      Alert.alert('Sukses', 'Item inventory dibuat. Menunggu verifikasi Sales.');
      router.replace({ pathname: '/inventory' } as any);
    } catch(e:any) {
      Alert.alert('Gagal', e.message || String(e));
    } finally { setSaving(false); }
  };

  const toDisplayUrl = (p?: string) => {
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.dark }} contentContainerStyle={{ padding: 16 }}>
      {/* INFORMASI ITEM */}
      <View style={s.cardSection}>
        <View style={s.sectionHeaderRow}>
          <Ionicons name="cube" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>INFORMASI ITEM</Text>
        </View>
        <View style={s.divider} />
        <Text style={s.label}>Jenis Barang</Text>
        <InlineSelect label="" value={form.category} options={JENIS_BARANG_OPTIONS} onChange={(v)=> setForm(f=> ({ ...f, category: v }))} styleHeader={s.select} />
        <Text style={s.label}>Kode</Text>
        <TextInput value={form.code} onChangeText={(v)=>setForm(f=>({...f, code:v}))} placeholder="Contoh: WO110-1" placeholderTextColor={COLORS.yellow} style={s.input} />
        <Text style={s.label}>Nama/Deskripsi Singkat</Text>
        <TextInput value={form.name} onChangeText={(v)=>setForm(f=>({...f, name:v}))} placeholder="Cincin wanita motif X" placeholderTextColor={COLORS.yellow} style={s.input} />
        <Text style={s.label}>Jenis Emas</Text>
        <InlineSelect label="" value={form.goldType} options={JENIS_EMAS_OPTIONS} onChange={(v)=> setForm(f=> ({ ...f, goldType: v }))} styleHeader={s.select} />
        <Text style={s.label}>Warna Emas</Text>
        <InlineSelect label="" value={form.goldColor} options={WARNA_EMAS_OPTIONS} onChange={(v)=> setForm(f=> ({ ...f, goldColor: v }))} styleHeader={s.select} />
      </View>

      {/* BERAT & LOKASI */}
      <View style={s.cardSection}>
        <View style={s.sectionHeaderRow}>
          <Ionicons name="location" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>BERAT & LOKASI</Text>
        </View>
        <View style={s.divider} />
        <Text style={s.label}>Lokasi (rak/slot)</Text>
        <TextInput value={form.location} onChangeText={(v)=>setForm(f=>({...f, location:v}))} placeholder="A1-03" placeholderTextColor={COLORS.yellow} style={s.input} />
        <Text style={s.label}>Berat Bersih (gr)</Text>
        <TextInput value={form.weightNet} onChangeText={(v)=>setForm(f=>({...f, weightNet:v}))} placeholder="mis. 3.5" placeholderTextColor={COLORS.yellow} style={s.input} keyboardType="decimal-pad" />
      </View>

      {/* BATU / STONE */}
      <View style={s.cardSection}>
        <View style={s.sectionHeaderRow}>
          <Ionicons name="diamond" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>BATU / STONE</Text>
        </View>
        <View style={s.divider} />
        <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#2a2320', borderRadius:8, paddingVertical:6, marginBottom:4}}>
          <Text style={{flex:2, color:COLORS.gold, fontWeight:'bold', textAlign:'left', paddingLeft:8}}>Bentuk</Text>
          <Text style={{flex:1, color:COLORS.gold, fontWeight:'bold', textAlign:'left', paddingLeft:8}}>Jumlah</Text>
          <Text style={{flex:1, color:COLORS.gold, fontWeight:'bold', textAlign:'left', paddingLeft:8}}>Berat</Text>
          <Text style={{width:32}}></Text>
        </View>
        {stones.map((sStone,idx)=>(
          <React.Fragment key={idx}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:4, borderRadius:8, paddingVertical:4}}>
              <TouchableOpacity style={{flex:2, marginHorizontal:4, paddingVertical:6, borderRadius:6, borderWidth:1, borderColor:'#FFD700', backgroundColor:'#23201c', flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingLeft:8, paddingRight:8}} onPress={()=> setExpandedStoneIndex(expandedStoneIndex === idx ? null : idx)}>
                <Text style={{color:'#ffe082', fontWeight:'600', textAlign:'left'}}>{sStone.bentuk || 'Bentuk Batu'}</Text>
                <Text style={{color:'#ffe082'}}>{expandedStoneIndex === idx ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              <TextInput placeholder='Jumlah' style={{flex:1, marginHorizontal:4, color:'#ffe082', backgroundColor:'#23201c', borderRadius:6, borderWidth:1, borderColor:'#FFD700', textAlign:'left', fontWeight:'600', height:36, paddingLeft:8}} placeholderTextColor="#ffe082" value={sStone.jumlah} onChangeText={v=>setStones(prev=> prev.map((x,i)=> i===idx ? { ...x, jumlah:v } : x))} keyboardType='numeric' />
              <View style={{flex:1, marginHorizontal:4, flexDirection:'row', alignItems:'center', backgroundColor:'#23201c', borderRadius:6, borderWidth:1, borderColor:'#FFD700', height:36, paddingLeft:8}}>
                <TextInput placeholder='Berat' style={{flex:1, color:'#ffe082', fontWeight:'600', padding:0}} placeholderTextColor="#ffe082" value={sStone.berat} onChangeText={v=>setStones(prev=> prev.map((x,i)=> i===idx ? { ...x, berat:v } : x))} keyboardType='decimal-pad' />
                <Text style={{ color:'#ffe082', fontWeight:'800', paddingHorizontal:8 }}>ct</Text>
              </View>
              <TouchableOpacity onPress={()=> setStones(prev=> prev.filter((_,i)=> i!==idx))} style={{width:32, alignItems:'center', justifyContent:'center'}}>
                <Ionicons name="close-circle" size={22} color="#b22" />
              </TouchableOpacity>
            </View>
            {expandedStoneIndex === idx && (
              <View style={{marginBottom:8, marginLeft:4, marginRight:4, backgroundColor:'#23201c', borderRadius:8, borderWidth:1, borderColor:'#FFD700', padding:6}}>
                <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                  {BENTUK_BATU_OPTIONS.map(opt => {
                    const active = sStone.bentuk === opt;
                    return (
                      <TouchableOpacity key={opt} onPress={()=>{ setStones(prev=> prev.map((x,i)=> i===idx ? { ...x, bentuk: opt } : x)); setExpandedStoneIndex(null); }} style={{paddingVertical:6, paddingHorizontal:12, borderRadius:6, margin:4, backgroundColor:active ? COLORS.gold : '#181512'}}>
                        <Text style={{color:active ? '#181512' : '#ffe082', fontWeight:'600'}}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </React.Fragment>
        ))}
        <PremiumButton title="TAMBAH BATU" onPress={()=> setStones(prev=> [...prev, emptyStone()])} style={{ alignSelf:'flex-end', marginTop:8, minWidth:160 }} textStyle={{ fontSize:16 }} />
      </View>

      {/* FOTO */}
      <View style={[s.cardSection, { paddingVertical:14 }] }>
        <View style={s.sectionHeaderRow}>
          <Ionicons name="images" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>FOTO</Text>
        </View>
        <View style={s.divider} />
        <View style={s.imagesRow}>
          {images.map((u,idx)=> (
            <Image key={`${u}-${idx}`} source={{ uri: toDisplayUrl(u) }} style={s.thumb} />
          ))}
          <TouchableOpacity onPress={pickImage} style={s.addThumb}><Text style={{ color: COLORS.gold, fontWeight:'800' }}>+</Text></TouchableOpacity>
        </View>
      </View>

      <PremiumButton title={saving ? 'MENYIMPAN...' : 'MASUKKAN KE INVENTORY'} onPress={submit} disabled={!canSubmit} loading={saving} style={{ marginTop: 6 }} textStyle={{ fontSize:18 }} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  label: { color: COLORS.gold, fontWeight:'700', marginTop: 10 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth:1, borderColor: COLORS.border, color: COLORS.yellow, padding: 10, marginTop: 6 },
  valueBox: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth:1, borderColor: COLORS.border, color: COLORS.yellow, padding: 10, marginTop: 6 },
  select: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, color: COLORS.yellow, fontWeight: '600', fontSize: 15, paddingVertical: 8, paddingHorizontal: 10, marginTop: 6 },
  cardSection: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gold, padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' },
  divider: { height: 2, backgroundColor: COLORS.gold, borderRadius: 2, marginBottom: 12, opacity: 0.18 },
  imagesRow: { flexDirection:'row', alignItems:'center', gap: 8, marginTop: 6 },
  thumb: { width: 64, height: 64, borderRadius: 8, borderWidth:1, borderColor: COLORS.border },
  addThumb: { width: 64, height: 64, borderRadius: 8, borderWidth:1, borderColor: COLORS.border, alignItems:'center', justifyContent:'center' },
  submitBtn: { marginTop: 16, backgroundColor: COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems:'center' },
  submitTxt: { color:'#1b1b1b', fontWeight:'900' }
});
