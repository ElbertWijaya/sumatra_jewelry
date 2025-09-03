import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, BENTUK_BATU_OPTIONS, emptyStone, StoneFormItem } from '../constants/orderOptions';
import { FormSection } from '../components/FormSection';
import { Field } from '../components/Field';
import { InlineSelect } from '../components/InlineSelect';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export const CreateOrderScreen: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jenisBarang, setJenisBarang] = useState('');
  const [jenisEmas, setJenisEmas] = useState('');
  const [warnaEmas, setWarnaEmas] = useState('');
  // Fields removed per spec: kadar, beratTarget
  const [ongkos, setOngkos] = useState('');
  const [dp, setDp] = useState('');
  const [hargaEmasPerGram, setHargaEmasPerGram] = useState('');
  const [hargaPerkiraan, setHargaPerkiraan] = useState('');
  const [hargaAkhir, setHargaAkhir] = useState('');
  const [tanggalJanjiJadi, setTanggalJanjiJadi] = useState<string>('');
  const [tanggalSelesai, setTanggalSelesai] = useState<string>('');
  const [tanggalAmbil, setTanggalAmbil] = useState<string>('');
  const [showPicker, setShowPicker] = useState<null | { field: 'janji' | 'selesai' | 'ambil'; date: Date }>(null);
  // Image reference now via upload, store returned path
  const [referensiGambarUrl, setReferensiGambarUrl] = useState(''); // legacy first image
  const [referensiGambarUrls, setReferensiGambarUrls] = useState<string[]>([]); // multiple images
  const [uploading, setUploading] = useState(false);
  const [localImageName, setLocalImageName] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [stones, setStones] = useState<StoneFormItem[]>([]);
  // Expanded selectors (single-line then expand on press)
  const [expandedField, setExpandedField] = useState<null | 'jenisBarang' | 'jenisEmas' | 'warnaEmas'>(null); // retained for compatibility if needed later
  const [expandedStoneIndex, setExpandedStoneIndex] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.orders.create(token || '', {
      customerName,
      customerAddress: customerAddress || undefined,
      customerPhone: customerPhone || undefined,
      jenisBarang,
      jenisEmas,
      warnaEmas,
  // removed: kadar, beratTarget
      ongkos: Number(ongkos || 0),
      dp: dp ? Number(dp) : undefined,
      hargaEmasPerGram: hargaEmasPerGram ? Number(hargaEmasPerGram) : undefined,
      hargaPerkiraan: hargaPerkiraan ? Number(hargaPerkiraan) : undefined,
      hargaAkhir: hargaAkhir ? Number(hargaAkhir) : undefined,
      tanggalJanjiJadi: tanggalJanjiJadi || undefined,
      tanggalSelesai: tanggalSelesai || undefined,
      tanggalAmbil: tanggalAmbil || undefined,
  referensiGambarUrl: referensiGambarUrl || undefined,
  referensiGambarUrls: referensiGambarUrls.length ? referensiGambarUrls : undefined,
      catatan: catatan || undefined,
      stones: stones.length ? stones.filter(s => s.bentuk && s.jumlah).map(s => ({
        bentuk: s.bentuk,
        jumlah: Number(s.jumlah || 0),
        berat: s.berat ? Number(s.berat) : undefined,
      })) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      onCreated && onCreated();
      Alert.alert('Sukses', 'Order dibuat');
  setCustomerName(''); setCustomerAddress(''); setCustomerPhone(''); setJenisBarang(''); setJenisEmas(''); setWarnaEmas(''); setOngkos(''); setDp(''); setHargaEmasPerGram(''); setHargaPerkiraan(''); setHargaAkhir(''); setTanggalJanjiJadi(''); setTanggalSelesai(''); setTanggalAmbil(''); setReferensiGambarUrl(''); setReferensiGambarUrls([]); setCatatan(''); setStones([]); setLocalImageName(null);
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Gagal membuat order'),
  });

  const disabled = !customerName || !jenisBarang || !jenisEmas || !warnaEmas || !ongkos || mutation.isPending || uploading;

  const updateStone = (idx: number, patch: Partial<StoneFormItem>) => {
    setStones(prev => prev.map((s,i)=> i===idx ? { ...s, ...patch } : s));
  };
  const removeStone = (idx: number) => setStones(prev => prev.filter((_,i)=>i!==idx));
  const addStone = () => setStones(prev => [...prev, emptyStone()]);

  const renderSelectRow = (fieldKey: 'jenisBarang' | 'jenisEmas' | 'warnaEmas', label: string, value: string, options: string[], onChange: (v:string)=>void) => (
    <InlineSelect label={label} value={value} options={options} onChange={onChange} />
  );

  const pickDate = (field: 'janji' | 'selesai' | 'ambil') => {
    const currentVal = (field === 'janji' ? tanggalJanjiJadi : field === 'selesai' ? tanggalSelesai : tanggalAmbil) || new Date().toISOString().slice(0,10);
    setShowPicker({ field, date: new Date(currentVal) });
  };

  const onDateChange = (_: any, selected?: Date) => {
    if (!showPicker) return;
    if (Platform.OS !== 'ios') setShowPicker(null);
    if (selected) {
      const iso = selected.toISOString().slice(0,10);
      if (showPicker.field === 'janji') setTanggalJanjiJadi(iso);
      if (showPicker.field === 'selesai') setTanggalSelesai(iso);
      if (showPicker.field === 'ambil') setTanggalAmbil(iso);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Baru</Text>

      <FormSection title='Informasi Customer'>
        <Field label='Nama Customer' required value={customerName} onChangeText={setCustomerName} />
        <Field label='Alamat Customer' value={customerAddress} onChangeText={setCustomerAddress} />
        <Field label='No Telepon Customer' value={customerPhone} onChangeText={setCustomerPhone} keyboardType='phone-pad' />
      </FormSection>

      <FormSection title='Informasi Order'>
        {renderSelectRow('jenisBarang', 'Jenis Barang', jenisBarang, JENIS_BARANG_OPTIONS, setJenisBarang)}
        {renderSelectRow('jenisEmas', 'Jenis Emas', jenisEmas, JENIS_EMAS_OPTIONS, setJenisEmas)}
        {renderSelectRow('warnaEmas', 'Warna Emas', warnaEmas, WARNA_EMAS_OPTIONS, setWarnaEmas)}
        {/* Removed inputs: Kadar, Berat Target. */}
      </FormSection>

      <FormSection title='Referensi Gambar'>
  <View style={{ marginBottom:12 }}>
        <Text style={styles.label}>Referensi Gambar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:8 }}>
          {[referensiGambarUrl, ...referensiGambarUrls.filter(u=>u && u !== referensiGambarUrl)].filter(Boolean).map((url, i) => (
            <View key={url + i} style={{ marginRight:10, alignItems:'center' }}>
              <Image source={{ uri: url }} style={{ width:90, height:90, borderRadius:6 }} />
              <TouchableOpacity onPress={()=>{
                if(url === referensiGambarUrl){
                  // remove primary
                  const rest = referensiGambarUrls.filter(u=>u!==url);
                  setReferensiGambarUrl(rest[0] || '');
                  setReferensiGambarUrls(rest.slice(1));
                } else {
                  setReferensiGambarUrls(prev=> prev.filter(u=>u!==url));
                }
              }} style={{ marginTop:4 }}>
                <Text style={{ fontSize:11, color:'#b22' }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
          <Button title={uploading ? 'Mengupload...' : referensiGambarUrl ? 'Ganti Foto' : 'Pilih dari Galeri'} onPress={async ()=>{
            if(uploading) return;
            if(!token){ Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
            try {
              setUploading(true);
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if(!perm.granted){ Alert.alert('Izin ditolak'); return; }
              // NOTE: Removed mediaTypes & allowsMultipleSelection due to version mismatch causing cast error (expects array)
              const result = await ImagePicker.launchImageLibraryAsync({
                quality: 0.85,
              });
              if(result.canceled) return;
              const asset = result.assets[0];
              const uploaded = await handleUploadAsset(token, asset.uri, asset.fileName, asset.mimeType);
              if(!referensiGambarUrl){
                setReferensiGambarUrl(uploaded.url);
              } else {
                setReferensiGambarUrls(prev => [...prev, uploaded.url]);
              }
              setLocalImageName(asset.fileName || 'design.jpg');
            } catch(e:any){ Alert.alert('Upload gagal', e.message || 'Error'); }
            finally { setUploading(false); }
          }} />
      <Button title='Kamera' onPress={async ()=>{
            if(uploading) return;
            if(!token){ Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
            try {
              setUploading(true);
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if(!perm.granted){ Alert.alert('Izin kamera ditolak'); return; }
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.85,
              });
              if(result.canceled) return;
              const asset = result.assets[0];
              const uploaded = await handleUploadAsset(token, asset.uri, asset.fileName, asset.mimeType);
              if(!referensiGambarUrl){
                setReferensiGambarUrl(uploaded.url);
              } else {
                setReferensiGambarUrls(prev => [...prev, uploaded.url]);
              }
              setLocalImageName(asset.fileName || 'design.jpg');
            } catch(e:any){ Alert.alert('Upload gagal', e.message || 'Error'); }
            finally { setUploading(false); }
          }} />
          {referensiGambarUrl ? <Button title='Reset Semua' color='#b22' onPress={()=>{ setReferensiGambarUrl(''); setReferensiGambarUrls([]); setLocalImageName(null); }} /> : null}
        </View>
      </View>

  </FormSection>

  <FormSection title='Batu / Stone'>
      {stones.map((s,idx)=>(
        <View key={idx} style={styles.stoneRowWrapper}>
          <View style={styles.stoneRow}> 
            <TouchableOpacity style={[styles.input, styles.stoneInput, styles.stoneSelect]} onPress={()=> setExpandedStoneIndex(expandedStoneIndex === idx ? null : idx)}>
              <Text style={styles.stoneSelectText}>{s.bentuk || 'Bentuk Batu'}</Text>
              <Text style={styles.selectHeaderArrow}>{expandedStoneIndex === idx ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <TextInput placeholder='Jumlah' style={[styles.input,styles.stoneInput]} value={s.jumlah} onChangeText={v=>updateStone(idx,{jumlah:v})} keyboardType='numeric' />
            <TextInput placeholder='Berat' style={[styles.input,styles.stoneInput]} value={s.berat} onChangeText={v=>updateStone(idx,{berat:v})} keyboardType='numeric' />
            <TouchableOpacity onPress={()=>removeStone(idx)} style={styles.removeBtn}><Text style={{color:'#fff'}}>X</Text></TouchableOpacity>
          </View>
          {expandedStoneIndex === idx && (
            <View style={styles.stoneDropdown}> 
              {BENTUK_BATU_OPTIONS.map(opt => {
                const active = s.bentuk === opt;
                return (
                  <TouchableOpacity key={opt} onPress={()=>{ updateStone(idx,{bentuk:opt}); setExpandedStoneIndex(null); }} style={[styles.stoneItem, active && styles.stoneItemActive]}>
                    <Text style={[styles.stoneItemText, active && styles.stoneItemTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      ))}
      <Button title='Tambah Batu' onPress={addStone} />
      </FormSection>

      <FormSection title='Pembayaran'>
        <Field label='Harga Emas per Gram' value={hargaEmasPerGram} onChangeText={setHargaEmasPerGram} keyboardType='numeric' />
        <Field label='Harga Perkiraan' value={hargaPerkiraan} onChangeText={setHargaPerkiraan} keyboardType='numeric' />
        <Field label='DP' value={dp} onChangeText={setDp} keyboardType='numeric' />
        <Field label='Harga Akhir' value={hargaAkhir} onChangeText={setHargaAkhir} keyboardType='numeric' />
        <Field label='Ongkos' required value={ongkos} onChangeText={setOngkos} keyboardType='numeric' />
      </FormSection>

      <FormSection title='Tanggal'>
        <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={()=>pickDate('janji')}><Text>Janji Jadi: {tanggalJanjiJadi || '-'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.dateBtn} onPress={()=>pickDate('selesai')}><Text>Selesai: {tanggalSelesai || '-'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.dateBtn} onPress={()=>pickDate('ambil')}><Text>Ambil: {tanggalAmbil || '-'}</Text></TouchableOpacity>
        </View>
      {showPicker && (
        <DateTimePicker
          value={showPicker.date}
          mode='date'
          display='default'
          onChange={onDateChange}
        />
      )}
      </FormSection>

      <FormSection title='Catatan'>
        <TextInput placeholder='Catatan' style={[styles.input,{height:90}]} value={catatan} onChangeText={setCatatan} multiline />
      </FormSection>

      <View style={{ paddingHorizontal:4, marginTop:10 }}>
        <Button title={mutation.isPending ? 'Menyimpan...' : 'Simpan'} disabled={disabled} onPress={() => mutation.mutate()} />
      </View>
      <View style={{ height: Platform.OS==='web' ? 40 : 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor:'#f7f7f8' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 18 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  subSection: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e1e1e3', backgroundColor:'#fff', padding: 12, borderRadius: 10, marginBottom: 12, fontSize:14 },
  fieldGroup: { marginBottom: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingVertical:6, paddingHorizontal:12, borderRadius:20, borderWidth:1, borderColor:'#888', marginRight:6, marginBottom:6 },
  pillActive: { backgroundColor:'#333', borderColor:'#333' },
  pillText: { color:'#333' },
  pillTextActive: { color:'#fff' },
  label: { marginBottom:6, fontWeight:'500' },
  stoneRow: { flexDirection:'row', alignItems:'center', marginBottom:8 },
  stoneInput: { flex:1, marginRight:6 },
  removeBtn: { backgroundColor:'#d33', padding:8, borderRadius:6 },
  pillSmall: { paddingVertical:4, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:'#888', marginRight:6 },
  pillSmallActive: { backgroundColor:'#333', borderColor:'#333' },
  dateRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  dateBtn: { flex:1, borderWidth:1, borderColor:'#ccc', padding:10, borderRadius:6, marginRight:8 },
  // New expandable select styles
  selectHeader: { flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:12, paddingVertical:10 },
  selectHeaderLabel: { flex:1, fontWeight:'500', color:'#333' },
  selectHeaderValue: { flex:1, textAlign:'right', color:'#555', marginRight:8 },
  selectHeaderArrow: { color:'#666', fontSize:12 },
  stoneRowWrapper: { marginBottom:4 },
  stoneSelect: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:0 },
  stoneSelectText: { color:'#333' },
  stoneDropdown: { marginTop:6, borderWidth:1, borderColor:'#ddd', borderRadius:10, backgroundColor:'#fff', overflow:'hidden' },
  stoneItem: { paddingVertical:10, paddingHorizontal:14, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  stoneItemActive: { backgroundColor:'#222' },
  stoneItemText: { fontSize:13, color:'#333' },
  stoneItemTextActive: { color:'#fff', fontWeight:'600' },
});

async function compressImage(uri: string) {
  try {
    const ImageManipulator = await import('expo-image-manipulator');
    const result = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
    return result.uri;
  } catch { return uri; }
}

async function uploadAsset(token: string, uri?: string, name?: string | null, mimeType?: string | null) {
  if(!token) throw new Error('Token hilang');
  if(!uri) throw new Error('URI kosong');
  // Fallback if mimeType not provided by picker (older android)
  const safeMime = mimeType && mimeType.includes('/') ? mimeType : 'image/jpeg';
  const finalUri = await compressImage(uri);
  const form = new FormData();
  form.append('file', { uri: finalUri, name: name || 'design.jpg', type: safeMime } as any);
  const uploadRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form as any,
  });
  if(!uploadRes.ok){ const t = await uploadRes.text(); throw new Error(t); }
  return uploadRes.json();
}

// Helper to integrate upload result into component state (called inside handlers)
async function handleUploadAsset(token: string, uri?: string, name?: string | null, mimeType?: string | null) {
  const uploaded = await uploadAsset(token, uri, name, mimeType);
  // This function will be re-bound in component scope via closure; using global mutable vars is avoided.
  // Implementation placeholder; real assignment occurs inline where called (state setters in scope).
  return uploaded;
}
