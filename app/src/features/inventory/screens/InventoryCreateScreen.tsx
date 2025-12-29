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

type ItemForm = {
  code: string;
  category: string;
  weightNet: string;
  name: string;
  goldType: string;
  goldColor: string;
  barcode: string;
  branchLocation: ''|'ASIA'|'SUN_PLAZA';
  placement: ''|'ETALASE'|'PENYIMPANAN';
  images: string[];
  stones: StoneFormItem[];
  expandedStoneIndex: number | null;
};

const newItem = (): ItemForm => ({
  code:'', category:'', weightNet:'', name:'', goldType:'', goldColor:'', barcode:'',
  branchLocation:'', placement:'', images:[], stones:[], expandedStoneIndex:null
});

export const InventoryCreateScreen: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const ordId = Number(orderId);
  const [items, setItems] = useState<ItemForm[]>([newItem()]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickFromGallery = async (itemIdx: number) => {
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
      if (res?.url) setItems(prev => prev.map((it, i) => i === itemIdx ? { ...it, images: [...it.images, res.url] } : it));
    } catch(e:any) { Alert.alert('Upload gagal', e.message || String(e)); }
    finally { setUploading(false); }
  };

  const takePhoto = async (itemIdx: number) => {
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
      if (res?.url) setItems(prev => prev.map((it, i) => i === itemIdx ? { ...it, images: [...it.images, res.url] } : it));
    } catch(e:any) { Alert.alert('Gagal ambil foto', e.message || String(e)); }
    finally { setUploading(false); }
  };

  // Total batu (ct) untuk karat; digunakan sebagai nilai otomatis
  const totalStoneWeightCt = useMemo(() => {
    // total untuk item aktif pertama sebagai referensi; ditampilkan per item juga.
    const stones = items[0]?.stones || [];
    const validStones = stones.filter(s => s.bentuk && (s.jumlah || s.berat));
    return validStones.reduce((acc, s) => acc + (Number(s.berat || 0) || 0), 0);
  }, [items]);

  const formatCt = (n?: number) => {
    if (n == null || Number.isNaN(n)) return '';
    return String(parseFloat(Number(n).toFixed(4)));
  };

  const canSubmit = useMemo(() => {
    if (saving || !ordId) return false;
    const validItems = items.filter(it => it.category && it.code && it.images.length > 0);
    return validItems.length > 0;
  }, [saving, ordId, items]);

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      let createdCount = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!(it.category && it.code && it.images.length > 0)) continue; // skip incomplete
        const validStones = (it.stones || []).filter(s => s.bentuk && (s.jumlah || s.berat));
        const totalCount = validStones.reduce((acc, s) => acc + (Number(s.jumlah || 0) || 0), 0);
        const totalWeight = validStones.reduce((acc, s) => acc + (Number(s.berat || 0) || 0), 0);
        await api.inventory.create(token || '', {
          orderId: ordId,
          code: it.code,
          category: it.category,
          goldType: it.goldType || undefined,
          goldColor: it.goldColor || undefined,
          branchLocation: it.branchLocation || undefined,
          placement: it.placement || undefined,
          weightNet: it.weightNet ? Number(it.weightNet) : undefined,
          stoneCount: totalCount || undefined,
          stoneWeight: totalWeight || undefined,
          dimensions: validStones.length ? JSON.stringify(validStones) : undefined,
          name: it.name || undefined,
          barcode: it.barcode || undefined,
          stones: validStones.map(s => ({ bentuk: s.bentuk, jumlah: Number(s.jumlah || 0), berat: s.berat ? Number(s.berat) : undefined })),
          images: it.images,
        });
        createdCount++;
      }
      Alert.alert('Sukses', `Item inventory dibuat: ${createdCount}. Menunggu verifikasi Sales.`);
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
      {items.map((item, idx) => (
        <View key={idx} style={{ marginBottom: 16 }}>
          <View style={[s.cardSection, { borderColor: COLORS.gold }] }>
            <View style={[s.sectionHeaderRow, { justifyContent:'space-between' }]}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <Ionicons name="cube" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
                <Text style={s.sectionTitle}>ITEM #{idx+1}</Text>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                {items.length > 1 && (
                  <TouchableOpacity onPress={()=> setItems(prev => prev.filter((_,i)=> i!==idx))}>
                    <Ionicons name="trash" size={20} color="#b22" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={s.divider} />
            <Text style={s.label}>Jenis Barang</Text>
            <InlineSelect label="" value={item.category} options={JENIS_BARANG_OPTIONS} onChange={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, category: v } : it))} styleHeader={s.select} />
            <Text style={s.label}>Kode</Text>
            <TextInput value={item.code} onChangeText={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, code: v } : it))} placeholder="Contoh: WO110-1" placeholderTextColor={COLORS.yellow} style={s.input} />
            <Text style={s.label}>Nama/Deskripsi Singkat</Text>
            <TextInput value={item.name} onChangeText={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, name: v } : it))} placeholder="Cincin wanita motif X" placeholderTextColor={COLORS.yellow} style={s.input} />
            <Text style={s.label}>Jenis Emas</Text>
            <InlineSelect label="" value={item.goldType} options={JENIS_EMAS_OPTIONS} onChange={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, goldType: v } : it))} styleHeader={s.select} />
            <Text style={s.label}>Warna Emas</Text>
            <InlineSelect label="" value={item.goldColor} options={WARNA_EMAS_OPTIONS} onChange={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, goldColor: v } : it))} styleHeader={s.select} />
            <Text style={s.label}>Barcode</Text>
            <TextInput value={item.barcode} onChangeText={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, barcode: v } : it))} placeholder="Scan/ketik barcode" placeholderTextColor={COLORS.yellow} style={s.input} />
          </View>

          <View style={s.cardSection}>
            <View style={s.sectionHeaderRow}>
              <Ionicons name="location" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
              <Text style={s.sectionTitle}>BERAT & LOKASI</Text>
            </View>
            <View style={s.divider} />
            <Text style={s.label}>Cabang / Area</Text>
            <InlineSelect label="" value={item.branchLocation} options={['ASIA','SUN_PLAZA']} onChange={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, branchLocation: v as any } : it))} styleHeader={s.select} />
            <Text style={s.label}>Penempatan Fisik</Text>
            <InlineSelect label="" value={item.placement} options={['ETALASE','PENYIMPANAN']} onChange={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, placement: v as any } : it))} styleHeader={s.select} />
            <Text style={s.label}>Berat Bersih (gr)</Text>
            <TextInput value={item.weightNet} onChangeText={(v)=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, weightNet: v } : it))} placeholder="mis. 3.5" placeholderTextColor={COLORS.yellow} style={s.input} keyboardType="decimal-pad" />
          </View>

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
            {item.stones.map((sStone, sIdx)=>(
              <React.Fragment key={sIdx}>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom:4, borderRadius:8, paddingVertical:4}}>
                  <TouchableOpacity style={{flex:2, marginHorizontal:4, paddingVertical:6, borderRadius:6, borderWidth:1, borderColor:'#FFD700', backgroundColor:'#23201c', flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingLeft:8, paddingRight:8}} onPress={()=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, expandedStoneIndex: it.expandedStoneIndex === sIdx ? null : sIdx } : it))}>
                    <Text style={{color:'#ffe082', fontWeight:'600', textAlign:'left'}}>{sStone.bentuk || 'Bentuk Batu'}</Text>
                    <Text style={{color:'#ffe082'}}>{item.expandedStoneIndex === sIdx ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  <TextInput placeholder='Jumlah' style={{flex:1, marginHorizontal:4, color:'#ffe082', backgroundColor:'#23201c', borderRadius:6, borderWidth:1, borderColor:'#FFD700', textAlign:'left', fontWeight:'600', height:36, paddingLeft:8}} placeholderTextColor="#ffe082" value={sStone.jumlah} onChangeText={v=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, stones: it.stones.map((x,j)=> j===sIdx ? { ...x, jumlah: v } : x) } : it))} keyboardType='numeric' />
                  <View style={{flex:1, marginHorizontal:4, flexDirection:'row', alignItems:'center', backgroundColor:'#23201c', borderRadius:6, borderWidth:1, borderColor:'#FFD700', height:36, paddingLeft:8}}>
                    <TextInput placeholder='Berat' style={{flex:1, color:'#ffe082', fontWeight:'600', padding:0}} placeholderTextColor="#ffe082" value={sStone.berat} onChangeText={v=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, stones: it.stones.map((x,j)=> j===sIdx ? { ...x, berat: v } : x) } : it))} keyboardType='decimal-pad' />
                    <Text style={{ color:'#ffe082', fontWeight:'800', paddingHorizontal:8 }}>ct</Text>
                  </View>
                  <TouchableOpacity onPress={()=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, stones: it.stones.filter((_,j)=> j!==sIdx) } : it))} style={{width:32, alignItems:'center', justifyContent:'center'}}>
                    <Ionicons name="close-circle" size={22} color="#b22" />
                  </TouchableOpacity>
                </View>
                {item.expandedStoneIndex === sIdx && (
                  <View style={{marginBottom:8, marginLeft:4, marginRight:4, backgroundColor:'#23201c', borderRadius:8, borderWidth:1, borderColor:'#FFD700', padding:6}}>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                      {BENTUK_BATU_OPTIONS.map(opt => {
                        const active = sStone.bentuk === opt;
                        return (
                          <TouchableOpacity key={opt} onPress={()=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, stones: it.stones.map((x,j)=> j===sIdx ? { ...x, bentuk: opt } : x), expandedStoneIndex: null } : it))} style={{paddingVertical:6, paddingHorizontal:12, borderRadius:6, margin:4, backgroundColor:active ? COLORS.gold : '#181512'}}>
                            <Text style={{color:active ? '#181512' : '#ffe082', fontWeight:'600'}}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </React.Fragment>
            ))}
            <PremiumButton title="TAMBAH BATU" onPress={()=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, stones: [...it.stones, emptyStone()] } : it))} style={{ alignSelf:'flex-end', marginTop:8, minWidth:160 }} textStyle={{ fontSize:16 }} />
          </View>

          <View style={[s.cardSection, { paddingVertical:14 }] }>
            <View style={s.sectionHeaderRow}>
              <Ionicons name="images" size={20} color={COLORS.gold} style={{ marginRight: 8 }} />
              <Text style={s.sectionTitle}>FOTO</Text>
            </View>
            <View style={s.divider} />
            <View style={s.imagesRow}>
              {item.images.map((u,uIdx)=> (
                <Image key={`${u}-${uIdx}`} source={{ uri: toDisplayUrl(u) }} style={s.thumb} />
              ))}
            </View>
            <View style={s.imageBtnRow}>
              <View style={{alignItems:'center', marginRight:8}}>
                <TouchableOpacity style={s.imageIconBtn} onPress={()=> pickFromGallery(idx)} disabled={uploading}>
                  <Ionicons name="image" size={22} color={COLORS.gold} />
                </TouchableOpacity>
                <Text style={s.imageIconLabel}>Dari Galeri</Text>
              </View>
              <View style={{alignItems:'center', marginRight:8}}>
                <TouchableOpacity style={s.imageIconBtn} onPress={()=> takePhoto(idx)} disabled={uploading}>
                  <Ionicons name="camera" size={22} color={COLORS.gold} />
                </TouchableOpacity>
                <Text style={s.imageIconLabel}>Foto Baru</Text>
              </View>
              {item.images.length > 0 && (
                <View style={{alignItems:'center'}}>
                  <TouchableOpacity style={s.imageIconBtn} onPress={()=> setItems(prev => prev.map((it,i)=> i===idx ? { ...it, images: [] } : it))} disabled={uploading}>
                    <Ionicons name="trash" size={22} color="#b22" />
                  </TouchableOpacity>
                  <Text style={[s.imageIconLabel,{color:'#b22'}]}>Reset</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}

      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <PremiumButton title="TAMBAH ITEM" onPress={()=> setItems(prev => [...prev, newItem()])} style={{ minWidth:160 }} textStyle={{ fontSize:16 }} />
        <PremiumButton title={saving ? 'MENYIMPAN...' : 'SIMPAN SEMUA ITEM'} onPress={submit} disabled={!canSubmit} loading={saving} style={{ minWidth:200 }} textStyle={{ fontSize:16 }} />
      </View>

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
