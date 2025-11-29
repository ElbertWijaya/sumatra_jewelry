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
    weightNet:'',
    name:'',
    goldType:'',
    goldColor:'',
    barcode:'',
  });
  const [branchLocation, setBranchLocation] = useState<'ASIA'|'SUN_PLAZA'|''>('');
  const [placement, setPlacement] = useState<'ETALASE'|'PENYIMPANAN'|''>('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [stones, setStones] = useState<StoneFormItem[]>([]);
  const [expandedStoneIndex, setExpandedStoneIndex] = useState<number | null>(null);
  // Status awal tidak diperlukan di form input inventory; gunakan default backend.

  const [uploading, setUploading] = useState(false);

  const pickFromGallery = async () => {
    if (uploading) return;
    if (!token) { Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
    try {
      setUploading(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Izin ditolak'); return; }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: false });
      if (pickerResult.canceled) return;
      const asset = pickerResult.assets?.[0];
      if (!asset?.uri) return;
      const f = new FormData();
      f.append('file', { uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.mimeType || 'image/jpeg' } as any);
      const res: any = await api.files.upload(token || '', f);
      if (res?.url) setImages(prev => [...prev, res.url]);
    } catch(e:any) { Alert.alert('Upload gagal', e.message || String(e)); }
    finally { setUploading(false); }
  };

  const takePhoto = async () => {
    if (uploading) return;
    if (!token) { Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
    try {
      setUploading(true);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('Izin kamera ditolak'); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      const f = new FormData();
      f.append('file', { uri: asset.uri, name: asset.fileName || 'camera.jpg', type: asset.mimeType || 'image/jpeg' } as any);
      const res: any = await api.files.upload(token || '', f);
      if (res?.url) setImages(prev => [...prev, res.url]);
    } catch(e:any) { Alert.alert('Gagal ambil foto', e.message || String(e)); }
    finally { setUploading(false); }
  };

  // Total batu (ct) untuk karat; digunakan sebagai nilai otomatis
  const totalStoneWeightCt = useMemo(() => {
    const validStones = stones.filter(s => s.bentuk && (s.jumlah || s.berat));
    return validStones.reduce((acc, s) => acc + (Number(s.berat || 0) || 0), 0);
  }, [stones]);

  const formatCt = (n?: number) => {
    if (n == null || Number.isNaN(n)) return '';
    return String(parseFloat(Number(n).toFixed(4)));
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
        branchLocation: branchLocation || undefined,
        placement: placement || undefined,
        weightNet: form.weightNet ? Number(form.weightNet) : undefined,
        stoneCount: totalCount || undefined,
        stoneWeight: totalWeight || undefined,
        dimensions: validStones.length ? JSON.stringify(validStones) : undefined,
        name: form.name || undefined,
        barcode: form.barcode || undefined,
        stones: validStones.map(s => ({ bentuk: s.bentuk, jumlah: Number(s.jumlah || 0), berat: s.berat ? Number(s.berat) : undefined })),
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
        <Text style={s.label}>Barcode</Text>
        <TextInput value={form.barcode} onChangeText={(v)=>setForm(f=>({...f, barcode:v}))} placeholder="Scan/ketik barcode" placeholderTextColor={COLORS.yellow} style={s.input} />
      </View>

      {/* BERAT & LOKASI */}
      <View style={s.cardSection}>
        <View style={s.sectionHeaderRow}>
          <Ionicons name="location" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>BERAT & LOKASI</Text>
        </View>
        <View style={s.divider} />
        <Text style={s.label}>Cabang / Area</Text>
        <InlineSelect label="" value={branchLocation} options={['ASIA','SUN_PLAZA']} onChange={(v)=> setBranchLocation(v as any)} styleHeader={s.select} />
        <Text style={s.label}>Penempatan Fisik</Text>
        <InlineSelect label="" value={placement} options={['ETALASE','PENYIMPANAN']} onChange={(v)=> setPlacement(v as any)} styleHeader={s.select} />
        <Text style={s.label}>Berat Bersih (gr)</Text>
        <TextInput value={form.weightNet} onChangeText={(v)=>setForm(f=>({...f, weightNet:v}))} placeholder="mis. 3.5" placeholderTextColor={COLORS.yellow} style={s.input} keyboardType="decimal-pad" />
        <Text style={s.label}>Karat (otomatis dari total ct batu)</Text>
        <View style={s.valueBox}><Text style={{ color: COLORS.yellow }}>{totalStoneWeightCt ? `${formatCt(totalStoneWeightCt)} ct` : '-'}</Text></View>
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
        </View>
        <View style={s.imageBtnRow}>
          <View style={{alignItems:'center', marginRight:8}}>
            <TouchableOpacity style={s.imageIconBtn} onPress={pickFromGallery} disabled={uploading}>
              <Ionicons name="image" size={22} color={COLORS.gold} />
            </TouchableOpacity>
            <Text style={s.imageIconLabel}>Dari Galeri</Text>
          </View>
          <View style={{alignItems:'center', marginRight:8}}>
            <TouchableOpacity style={s.imageIconBtn} onPress={takePhoto} disabled={uploading}>
              <Ionicons name="camera" size={22} color={COLORS.gold} />
            </TouchableOpacity>
            <Text style={s.imageIconLabel}>Foto Baru</Text>
          </View>
          {images.length > 0 && (
            <View style={{alignItems:'center'}}>
              <TouchableOpacity style={s.imageIconBtn} onPress={()=> setImages([])} disabled={uploading}>
                <Ionicons name="trash" size={22} color="#b22" />
              </TouchableOpacity>
              <Text style={[s.imageIconLabel,{color:'#b22'}]}>Reset</Text>
            </View>
          )}
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
  imageBtnRow: { flexDirection:'row', alignItems:'center', gap:12, marginTop:10 },
  imageIconBtn: { backgroundColor:'rgba(35,32,28,0.85)', borderRadius:12, borderWidth:1, borderColor:COLORS.border, padding:8 },
  imageIconLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center', letterSpacing: 0.1 },
  submitBtn: { marginTop: 16, backgroundColor: COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems:'center' },
  submitTxt: { color:'#1b1b1b', fontWeight:'900' }
});
