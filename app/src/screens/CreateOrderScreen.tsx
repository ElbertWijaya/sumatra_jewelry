import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
// Pastikan menambahkan dependency: expo install expo-camera (untuk modal kamera lanjutan)
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api, API_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, BENTUK_BATU_OPTIONS, emptyStone, StoneFormItem } from '../constants/orderOptions';
import { FormSection } from '../components/FormSection';
import { Field } from '../components/Field';
import { InlineSelect } from '../components/InlineSelect';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import ImagePreviewModal from '@/src/components/ImagePreviewModal';

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
  // Removed: ongkos
  const [dp, setDp] = useState('');
  const [hargaEmasPerGram, setHargaEmasPerGram] = useState('');
  const [hargaPerkiraan, setHargaPerkiraan] = useState('');
  const [hargaAkhir, setHargaAkhir] = useState('');
  const [promisedReadyDate, setPromisedReadyDate] = useState<string>(''); // Tanggal Perkiraan Siap
  const [tanggalSelesai, setTanggalSelesai] = useState<string>('');
  const [tanggalAmbil, setTanggalAmbil] = useState<string>('');
  const [showPicker, setShowPicker] = useState<null | { field: 'ready' | 'selesai' | 'ambil'; date: Date }>(null);
  // Image reference now via upload, store returned path
  const [referensiGambarUrls, setReferensiGambarUrls] = useState<string[]>([]); // multi image only (relative paths from server)
  const [uploading, setUploading] = useState(false);
  const [localImageName, setLocalImageName] = useState<string | null>(null);
  // Image preview (zoom only) modal state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Advanced camera modal
  const [showCamera, setShowCamera] = useState(false);
  // Gunakan any agar tidak error: 'Camera' refers to a value but is being used as a type
  // (Alternatif lebih ketat jika tipe tersedia: useRef<InstanceType<typeof Camera> | null>(null))
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  // (Cropping logic removed per new requirement: now only preview zoom after upload)
  const [catatan, setCatatan] = useState('');
  const [stones, setStones] = useState<StoneFormItem[]>([]);
  // Expanded selectors (single-line then expand on press)
  const [expandedField, setExpandedField] = useState<null | 'jenisBarang' | 'jenisEmas' | 'warnaEmas'>(null); // retained for compatibility if needed later
  const [expandedStoneIndex, setExpandedStoneIndex] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
  const payloadRaw: any = {
      customerName,
      customerAddress: customerAddress || undefined,
      customerPhone: customerPhone || undefined,
      jenisBarang,
      jenisEmas,
      warnaEmas,
  // removed: kadar, beratTarget
  // ongkos removed
      dp: dp ? Number(dp) : undefined,
      hargaEmasPerGram: hargaEmasPerGram ? Number(hargaEmasPerGram) : undefined,
      hargaPerkiraan: hargaPerkiraan ? Number(hargaPerkiraan) : undefined,
      hargaAkhir: hargaAkhir ? Number(hargaAkhir) : undefined,
  promisedReadyDate: promisedReadyDate || undefined,
      tanggalSelesai: tanggalSelesai || undefined,
      tanggalAmbil: tanggalAmbil || undefined,
  referensiGambarUrls: referensiGambarUrls.length ? referensiGambarUrls : undefined,
      catatan: catatan || undefined,
      stones: stones.length ? stones.filter(s => s.bentuk && s.jumlah).map(s => ({
        bentuk: s.bentuk,
        jumlah: Number(s.jumlah || 0),
        berat: s.berat ? Number(s.berat) : undefined,
      })) : undefined,
      };
      // Filter undefined to avoid them being stripped weirdly
      const payload: any = {};
      Object.entries(payloadRaw).forEach(([k,v])=>{
        if (v !== undefined) payload[k] = v;
      });
      console.log('[CreateOrderSubmit] payload', payload);
      return api.orders.create(token || '', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      onCreated && onCreated();
      Alert.alert('Sukses', 'Order dibuat');
  setCustomerName(''); setCustomerAddress(''); setCustomerPhone(''); setJenisBarang(''); setJenisEmas(''); setWarnaEmas(''); setDp(''); setHargaEmasPerGram(''); setHargaPerkiraan(''); setHargaAkhir(''); setPromisedReadyDate(''); setTanggalSelesai(''); setTanggalAmbil(''); setReferensiGambarUrls([]); setCatatan(''); setStones([]); setLocalImageName(null);
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Gagal membuat order'),
  });

  const disabled = !customerName || !jenisBarang || !jenisEmas || !warnaEmas || mutation.isPending || uploading;

  // Menggunakan CameraView (expo-camera versi baru)

  // --- Orientation Normalization Helper ---
  const normalizeOrientation = async (asset: { uri: string; width?: number; height?: number; exif?: any; fileName?: string | null; mimeType?: string | null }) => {
    const orientation = asset?.exif?.Orientation || asset?.exif?.orientation;
    const rotateMap: Record<number, number> = { 3: 180, 6: 90, 8: 270 };
    let rotated = asset;
    if (orientation && rotateMap[orientation]) {
      try {
        const result = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ rotate: rotateMap[orientation] }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        rotated = { ...asset, uri: result.uri, width: result.width, height: result.height };
      } catch {}
    } else {
      // do a no-op to ensure orientation baked in on some Android devices
      try {
        const noop = await ImageManipulator.manipulateAsync(asset.uri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
        rotated = { ...asset, uri: noop.uri, width: noop.width, height: noop.height };
      } catch {}
    }
    // Ensure width/height set
    if (!rotated.width || !rotated.height) rotated = { ...rotated, width: asset.width || 1, height: asset.height || 1 };
    return rotated;
  };

  // Convert relative /uploads path to absolute for Image component
  const toDisplayUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };

  // No custom crop function now (native editor handles it)

  const updateStone = (idx: number, patch: Partial<StoneFormItem>) => {
    setStones(prev => prev.map((s,i)=> i===idx ? { ...s, ...patch } : s));
  };
  const removeStone = (idx: number) => setStones(prev => prev.filter((_,i)=>i!==idx));
  const addStone = () => setStones(prev => [...prev, emptyStone()]);

  const renderSelectRow = (fieldKey: 'jenisBarang' | 'jenisEmas' | 'warnaEmas', label: string, value: string, options: string[], onChange: (v:string)=>void) => (
    <InlineSelect label={label} value={value} options={options} onChange={onChange} />
  );

  const pickDate = (field: 'ready' | 'selesai' | 'ambil') => {
    const currentVal = (field === 'ready' ? promisedReadyDate : field === 'selesai' ? tanggalSelesai : tanggalAmbil) || new Date().toISOString().slice(0,10);
    setShowPicker({ field, date: new Date(currentVal) });
  };

  const onDateChange = (_: any, selected?: Date) => {
    if (!showPicker) return;
    if (Platform.OS !== 'ios') setShowPicker(null);
    if (selected) {
      const iso = selected.toISOString().slice(0,10);
      if (showPicker.field === 'ready') setPromisedReadyDate(iso);
      if (showPicker.field === 'selesai') setTanggalSelesai(iso);
      if (showPicker.field === 'ambil') setTanggalAmbil(iso);
    }
  };

  return (
    <>
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
          {referensiGambarUrls.filter(Boolean).map((url, i) => {
            const display = toDisplayUrl(url);
            return (
              <View key={url + i} style={{ marginRight:10, alignItems:'center' }}>
                <TouchableOpacity onPress={()=> setPreviewUrl(display)}>
                  <Image source={{ uri: display }} style={{ width:90, height:90, borderRadius:6, backgroundColor:'#eee' }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{
                  setReferensiGambarUrls(prev=> prev.filter(u=>u!==url));
                }} style={{ marginTop:4 }}>
                  <Text style={{ fontSize:11, color:'#b22' }}>Hapus</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
    {/* Aspect selection removed: always free-form crop */}
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
          <Button title={uploading ? 'Mengupload...' : 'Pilih dari Galeri'} onPress={async ()=>{
            if(uploading) return;
            if(!token){ Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
            try {
              setUploading(true);
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if(!perm.granted){ Alert.alert('Izin ditolak'); return; }
              const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, exif: true });
              if(result.canceled) return;
              let asset = await normalizeOrientation(result.assets[0]);
              const uploaded = await handleUploadAsset(token || '', asset.uri, asset.fileName, asset.mimeType);
              setReferensiGambarUrls(prev => [...prev, uploaded.url]);
              setLocalImageName(asset.fileName || 'design.jpg');
            } catch(e:any){ Alert.alert('Upload gagal', e.message || 'Error'); }
            finally { setUploading(false); }
          }} />
  <Button title='Kamera' onPress={async ()=>{
            try {
              if (!cameraPermission || !cameraPermission.granted) {
                const perm = await requestCameraPermission();
                if (!perm.granted) { Alert.alert('Izin kamera ditolak'); return; }
              }
              setShowCamera(true);
            } catch(e:any){ Alert.alert('Gagal buka kamera', e.message || 'Error'); }
          }} />
          {referensiGambarUrls.length ? <Button title='Reset Semua' color='#b22' onPress={()=>{ setReferensiGambarUrls([]); setLocalImageName(null); }} /> : null}
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
  {/* Ongkos removed */}
      </FormSection>

      <FormSection title='Tanggal'>
        <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={()=>pickDate('ready')}><Text>Perkiraan Siap: {promisedReadyDate || '-'}</Text></TouchableOpacity>
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
  {/* (Crop feature dihapus) */}
  {/* Advanced Camera Modal */}
  <Modal visible={showCamera} animationType='slide' onRequestClose={()=>setShowCamera(false)}>
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <View style={{ flex:1 }}>
        <CameraView
          ref={(r)=> { cameraRef.current = r; }}
          style={{ flex:1 }}
          facing={cameraType}
          ratio="16:9"
          onCameraReady={()=>{ /* ready */ }}
        />
        <View style={{ position:'absolute', top:40, left:20 }}>
          <TouchableOpacity onPress={()=>setShowCamera(false)} style={{ backgroundColor:'rgba(0,0,0,0.5)', padding:10, borderRadius:30 }}>
            <Text style={{ color:'#fff' }}>Tutup</Text>
          </TouchableOpacity>
        </View>
        <View style={{ position:'absolute', bottom:40, width:'100%', flexDirection:'row', justifyContent:'space-around', alignItems:'center' }}>
          <TouchableOpacity onPress={()=> setCameraType(p=> p === 'back' ? 'front' : 'back')} style={{ backgroundColor:'rgba(255,255,255,0.2)', padding:14, borderRadius:40 }}>
            <Text style={{ color:'#fff' }}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={async ()=>{
            if(!cameraRef.current) return;
            try {
              setUploading(true);
              const photo = await (cameraRef.current as any)?.takePictureAsync({ quality:1, exif:true, skipProcessing:false });
              const normalized = await normalizeOrientation(photo as any);
              const uploaded = await handleUploadAsset(token || '', normalized.uri, 'camera.jpg', 'image/jpeg');
              setReferensiGambarUrls(prev => [...prev, uploaded.url]);
              setLocalImageName('camera.jpg');
              setShowCamera(false);
            } catch(e:any){ Alert.alert('Gagal ambil foto', e.message || 'Error'); }
            finally { setUploading(false); }
          }} style={{ width:80, height:80, borderRadius:40, backgroundColor:'#fff', justifyContent:'center', alignItems:'center' }}>
            <Text style={{ fontWeight:'600' }}>Foto</Text>
          </TouchableOpacity>
          <View style={{ width:80 }} />
        </View>
      </View>
    </View>
  </Modal>
  {previewUrl && <ImagePreviewModal url={previewUrl} onClose={()=> setPreviewUrl(null)} />}
  </>
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
  // Legacy crop styles removed
});

async function compressImage(uri: string) {
  try {
    const info: any = await FileSystem.getInfoAsync(uri);
    const large = info && info.size && info.size > 4.8 * 1024 * 1024;
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],
      { compress: large ? 0.55 : 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch { return uri; }
}

async function uploadAsset(token: string, asset: { uri: string; fileName?: string | null; mimeType?: string | null }) {
  if(!token) throw new Error('Token hilang');
  if(!asset?.uri) throw new Error('URI kosong');
  const safeMime = asset.mimeType && asset.mimeType.includes('/') ? asset.mimeType : 'image/jpeg';
  const finalUri = await compressImage(asset.uri);
  const form = new FormData();
  const ensuredName = asset.fileName && /\./.test(asset.fileName) ? asset.fileName : `design_${Date.now()}.jpg`;
  form.append('file', { uri: finalUri, name: ensuredName, type: safeMime } as any);
  const endpoint = `${API_URL.replace(/\/$/, '')}/files/upload`;
  const uploadRes = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form as any });
  if(!uploadRes.ok){ const t = await uploadRes.text(); throw new Error(t); }
  return uploadRes.json();
}

async function handleUploadAsset(token: string, uri: string, fileName?: string | null, mimeType?: string | null) {
  return uploadAsset(token, { uri, fileName, mimeType });
}

// (ImagePreviewModal dipindah ke file terpisah)
