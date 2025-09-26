import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
// Migrasi ke react-native-vision-camera
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { api, API_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, BENTUK_BATU_OPTIONS, emptyStone, StoneFormItem } from '../constants/orderOptions';
import { FormSection } from '../components/FormSection';
import { Field } from '../components/Field';
import { InlineSelect } from '../components/InlineSelect';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import ImagePreviewModal from '@/src/components/ImagePreviewModal';

export const CreateOrderScreen: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { token, user } = useAuth();
  const router = useRouter();
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
  // Advanced camera modal (Vision Camera)
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const deviceBack = useCameraDevice('back');
  const deviceFront = useCameraDevice('front');
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const device = cameraType === 'back' ? deviceBack : deviceFront;
  const [camGranted, setCamGranted] = useState(false);
  // (Cropping logic removed per new requirement: now only preview zoom after upload)
  const [catatan, setCatatan] = useState('');
  const [stones, setStones] = useState<StoneFormItem[]>([]);
  // --- Currency helpers (IDR formatting) ---
  const formatIDR = (raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    if (!digits) return '';
    const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${withDots}`;
  };
  const parseIDR = (formatted: string): number | undefined => {
    if (!formatted) return undefined;
    const digits = formatted.replace(/\D/g, '');
    if (!digits) return undefined;
    return Number(digits);
  };
  const makeCurrencyHandler = (setter: (v: string)=>void) => (text: string) => {
    setter(formatIDR(text));
  };
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
  dp: parseIDR(dp),
  hargaEmasPerGram: parseIDR(hargaEmasPerGram),
  hargaPerkiraan: parseIDR(hargaPerkiraan),
  hargaAkhir: parseIDR(hargaAkhir),
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
  setTimeout(() => { router.replace('/home'); }, 500);
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Gagal membuat order'),
  });

  const canCreate = user?.jobRole === 'ADMINISTRATOR' || user?.jobRole === 'SALES';
  const disabled = !customerName || !jenisBarang || !jenisEmas || !warnaEmas || mutation.isPending || uploading || !canCreate;

  // Menggunakan CameraView (expo-camera versi baru)

  // --- Orientation Normalization Helper ---
  const normalizeOrientation = async (asset: { uri: string; width?: number; height?: number; exif?: any; fileName?: string | null; mimeType?: string | null }) => {
    const exif = asset?.exif || {};
    const orientation: number | undefined = exif.Orientation || exif.orientation;
    const ops: any[] = [];
    const w = asset.width || 0;
    const h = asset.height || 0;

    // Heuristic to avoid double-rotation on some Android camera results:
    // If orientation says 90/270 but pixels already portrait (h > w), skip rotate.
    const pixelsPortrait = h > w && w > 0 && h > 0;

    if (orientation) {
      switch (orientation) {
        case 3: // 180°
          ops.push({ rotate: 180 });
          break;
        case 6: // 90° CW (common on portrait)
          if (!pixelsPortrait) ops.push({ rotate: 90 });
          break;
        case 8: // 270° CW
          if (!pixelsPortrait) ops.push({ rotate: 270 });
          break;
        case 2: // Flip horizontal
          ops.push({ flip: ImageManipulator.FlipType.Horizontal });
          break;
        case 4: // Flip vertical
          ops.push({ flip: ImageManipulator.FlipType.Vertical });
          break;
        case 5: // Transpose (rotate 90 + flip H)
          ops.push({ rotate: 90 });
          ops.push({ flip: ImageManipulator.FlipType.Horizontal });
          break;
        case 7: // Transverse (rotate 270 + flip H)
          ops.push({ rotate: 270 });
          ops.push({ flip: ImageManipulator.FlipType.Horizontal });
          break;
      }
    }

    try {
      const result = await ImageManipulator.manipulateAsync(
        asset.uri,
        ops,
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      return { ...asset, uri: result.uri, width: result.width || w || 1, height: result.height || h || 1 };
    } catch {
      // Fallback no-op to bake current pixels without EXIF
      try {
        const noop = await ImageManipulator.manipulateAsync(asset.uri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
        return { ...asset, uri: noop.uri, width: noop.width || w || 1, height: noop.height || h || 1 };
      } catch {
        return { ...asset, width: w || 1, height: h || 1 };
      }
    }
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

  const renderSelectRow = (
    fieldKey: 'jenisBarang' | 'jenisEmas' | 'warnaEmas',
    label: string,
    value: string,
    options: string[],
    onChange: (v:string)=>void,
    styleHeader?: any
  ) => (
    <InlineSelect label={label} value={value} options={options} onChange={onChange} styleHeader={styleHeader} />
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

        {/* Card Section: Informasi Customer (Premium, Fixed) */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-circle" size={22} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>INFORMASI CUSTOMER</Text>
          </View>
          <View style={styles.dividerGold} />
          {/* Nama Customer */}
          <Text style={styles.labelGold}>Nama Customer</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="person" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="Nama Customer..."
              placeholderTextColor="#ffe082"
              value={customerName}
              onChangeText={setCustomerName}
              autoCapitalize="words"
            />
          </View>
          {/* Alamat Customer */}
          <Text style={styles.labelGold}>Alamat Customer</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="location" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="Alamat Customer..."
              placeholderTextColor="#ffe082"
              value={customerAddress}
              onChangeText={setCustomerAddress}
              autoCapitalize="words"
            />
          </View>
          {/* No Telepon Customer */}
          <Text style={styles.labelGold}>No Telepon Customer</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="call" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="No Telepon..."
              placeholderTextColor="#ffe082"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Card Section: Informasi Order (Premium, Carded) */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="cube" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>INFORMASI ORDER</Text>
          </View>
          <View style={styles.dividerGold} />
          <View style={styles.infoOrderRowVertical}>
            <View style={styles.infoOrderRowHorizontal}>
              <View style={styles.infoOrderLabelWrap}>
                <Ionicons name="pricetag" size={16} color={COLORS.gold} style={{marginRight:6}} />
                <Text style={styles.infoOrderMiniLabel}>Jenis Barang</Text>
              </View>
              <View style={{flex:1}}>
                {renderSelectRow('jenisBarang', '', jenisBarang, JENIS_BARANG_OPTIONS, setJenisBarang, styles.selectPremium)}
              </View>
            </View>
            <View style={styles.infoOrderRowHorizontal}>
              <View style={styles.infoOrderLabelWrap}>
                <Ionicons name="color-palette" size={16} color={COLORS.gold} style={{marginRight:6}} />
                <Text style={styles.infoOrderMiniLabel}>Jenis Emas</Text>
              </View>
              <View style={{flex:1}}>
                {renderSelectRow('jenisEmas', '', jenisEmas, JENIS_EMAS_OPTIONS, setJenisEmas, styles.selectPremium)}
              </View>
            </View>
            <View style={styles.infoOrderRowHorizontal}>
              <View style={styles.infoOrderLabelWrap}>
                <Ionicons name="color-fill" size={16} color={COLORS.gold} style={{marginRight:6}} />
                <Text style={styles.infoOrderMiniLabel}>Warna Emas</Text>
              </View>
              <View style={{flex:1}}>
                {renderSelectRow('warnaEmas', '', warnaEmas, WARNA_EMAS_OPTIONS, setWarnaEmas, styles.selectPremium)}
              </View>
            </View>
          </View>
        </View>

        {/* Card Section: Referensi Gambar (Premium, Compact) */}
        <View style={[styles.cardSectionPremium, {paddingVertical:14}]}> 
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="images" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>REFERENSI GAMBAR</Text>
          </View>
          <View style={styles.dividerGold} />
          <View style={styles.imageGridWrap}>
            {referensiGambarUrls.slice(0,4).map((url, i) => {
              const display = toDisplayUrl(url);
              return (
                <View key={url + i} style={styles.imageThumbWrap}>
                  <TouchableOpacity onPress={()=> setPreviewUrl(display)}>
                    <Image source={{ uri: display }} style={styles.imageThumb} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                    setReferensiGambarUrls(prev=> prev.filter(u=>u!==url));
                  }} style={styles.imageRemoveBtn}>
                    <Ionicons name="close-circle" size={18} color="#b22" />
                  </TouchableOpacity>
                </View>
              );
            })}
            {referensiGambarUrls.length > 4 && (
              <View style={[styles.imageThumbWrap, {justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,215,0,0.08)'}]}>
                <Text style={{color:COLORS.gold, fontWeight:'700'}}>+{referensiGambarUrls.length-4}</Text>
              </View>
            )}
          </View>
          <View style={styles.imageBtnRow}>
            <View style={{alignItems:'center', marginRight:8}}>
              <TouchableOpacity style={styles.imageIconBtn} onPress={async ()=>{
                if(uploading) return;
                if(!token){ Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
                try {
                  setUploading(true);
                  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if(!perm.granted){ Alert.alert('Izin ditolak'); return; }
                  const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, exif: true, allowsEditing: false });
                  if(result.canceled) return;
                  let asset = await normalizeOrientation(result.assets[0]);
                  const uploaded = await handleUploadAsset(token || '', asset.uri, asset.fileName, asset.mimeType);
                  setReferensiGambarUrls(prev => [...prev, uploaded.url]);
                  setLocalImageName(asset.fileName || 'design.jpg');
                } catch(e:any){ Alert.alert('Upload gagal', e.message || 'Error'); }
                finally { setUploading(false); }
              }}>
                <Ionicons name="image" size={22} color={COLORS.gold} />
              </TouchableOpacity>
              <Text style={styles.imageIconLabel}>Ambil dari Galeri</Text>
            </View>
            <View style={{alignItems:'center', marginRight:8}}>
              <TouchableOpacity style={styles.imageIconBtn} onPress={async ()=>{
                try {
                  const status = await Camera.requestCameraPermission();
                  if (status !== 'granted') { Alert.alert('Izin kamera ditolak'); return; }
                  setCamGranted(true);
                  setShowCamera(true);
                } catch(e:any){ Alert.alert('Gagal buka kamera', e.message || 'Error'); }
              }}>
                <Ionicons name="camera" size={22} color={COLORS.gold} />
              </TouchableOpacity>
              <Text style={styles.imageIconLabel}>Foto</Text>
            </View>
            {referensiGambarUrls.length ? (
              <View style={{alignItems:'center'}}>
                <TouchableOpacity style={styles.imageIconBtn} onPress={()=>{ setReferensiGambarUrls([]); setLocalImageName(null); }}>
                  <Ionicons name="trash" size={22} color="#b22" />
                </TouchableOpacity>
                <Text style={[styles.imageIconLabel, {color:'#b22'}]}>Reset</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Card Section: Batu / Stone (Premium) */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="diamond" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>BATU / STONE</Text>
          </View>
          <View style={styles.dividerGold} />
          {stones.map((s,idx)=>(
            <View key={idx} style={styles.stoneRowWrapper}>
              <View style={styles.stoneRow}> 
                <TouchableOpacity style={[styles.inputPremiumText, styles.stoneInput, styles.stoneSelect]} onPress={()=> setExpandedStoneIndex(expandedStoneIndex === idx ? null : idx)}>
                  <Text style={styles.stoneSelectText}>{s.bentuk || 'Bentuk Batu'}</Text>
                  <Text style={styles.selectHeaderArrow}>{expandedStoneIndex === idx ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                <TextInput placeholder='Jumlah' style={[styles.inputPremiumText,styles.stoneInput]} placeholderTextColor="#ffe082" value={s.jumlah} onChangeText={v=>updateStone(idx,{jumlah:v})} keyboardType='numeric' />
                <TextInput placeholder='Berat' style={[styles.inputPremiumText,styles.stoneInput]} placeholderTextColor="#ffe082" value={s.berat} onChangeText={v=>updateStone(idx,{berat:v})} keyboardType='numeric' />
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
        </View>

        {/* Card Section: Pembayaran (Premium) */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="cash" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>PEMBAYARAN</Text>
          </View>
          <View style={styles.dividerGold} />
          <Text style={styles.labelGold}>Harga Emas per Gram</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="pricetag" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="Harga Emas per Gram"
              placeholderTextColor="#ffe082"
              value={hargaEmasPerGram}
              onChangeText={makeCurrencyHandler(setHargaEmasPerGram)}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.labelGold}>Harga Perkiraan</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="calculator" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="Harga Perkiraan"
              placeholderTextColor="#ffe082"
              value={hargaPerkiraan}
              onChangeText={makeCurrencyHandler(setHargaPerkiraan)}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.labelGold}>DP</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="wallet" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="DP"
              placeholderTextColor="#ffe082"
              value={dp}
              onChangeText={makeCurrencyHandler(setDp)}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.labelGold}>Harga Akhir</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="cash-outline" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput
              style={styles.inputPremiumText}
              placeholder="Harga Akhir"
              placeholderTextColor="#ffe082"
              value={hargaAkhir}
              onChangeText={makeCurrencyHandler(setHargaAkhir)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Card Section: Tanggal (Premium, Compact) */}
        <View style={[styles.cardSectionPremium, {paddingVertical:14}]}> 
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>TANGGAL</Text>
          </View>
          <View style={styles.dividerGold} />
          <View style={styles.dateRowCompact}>
            <TouchableOpacity style={styles.dateMiniCard} onPress={()=>pickDate('ready')}>
              <Ionicons name="alarm" size={16} color={COLORS.gold} style={{marginBottom:2}} />
              <Text style={styles.dateMiniLabel}>Perkiraan Siap</Text>
              <Text style={styles.dateMiniValue}>{promisedReadyDate || '-'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateMiniCard} onPress={()=>pickDate('selesai')}>
              <Ionicons name="checkmark-done" size={16} color={COLORS.gold} style={{marginBottom:2}} />
              <Text style={styles.dateMiniLabel}>Selesai</Text>
              <Text style={styles.dateMiniValue}>{tanggalSelesai || '-'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateMiniCard} onPress={()=>pickDate('ambil')}>
              <Ionicons name="archive" size={16} color={COLORS.gold} style={{marginBottom:2}} />
              <Text style={styles.dateMiniLabel}>Ambil</Text>
              <Text style={styles.dateMiniValue}>{tanggalAmbil || '-'}</Text>
            </TouchableOpacity>
          </View>
          {showPicker && (
            <DateTimePicker
              value={showPicker.date}
              mode='date'
              display='default'
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Card Section: Catatan (Premium) */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="document-text" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>CATATAN</Text>
          </View>
          <View style={styles.dividerGold} />
          <TextInput
            placeholder='Catatan'
            style={[styles.inputPremiumText,{height:90}]}
            placeholderTextColor="#ffe082"
            value={catatan}
            onChangeText={setCatatan}
            multiline
          />
        </View>

        {!canCreate ? (
          <Text style={{ color:'#c62828', marginBottom:8 }}>Akun Anda tidak memiliki izin untuk membuat order. Silakan login sebagai Sales atau Admin.</Text>
        ) : null}
        <View style={{ paddingHorizontal:4, marginTop:10 }}>
          <Button title={mutation.isPending ? 'Menyimpan...' : 'Simpan'} disabled={disabled} onPress={() => mutation.mutate()} />
        </View>
        <View style={{ height: Platform.OS==='web' ? 40 : 120 }} />
      </ScrollView>
      {/* Advanced Camera Modal (Vision Camera) */}
      <Modal visible={showCamera} animationType='slide' onRequestClose={()=>setShowCamera(false)}>
        <View style={{ flex:1, backgroundColor:'#000' }}>
          <View style={{ flex:1 }}>
            {device && camGranted ? (
              <Camera
                ref={(r: any)=> { cameraRef.current = r as any; }}
                style={{ flex:1 }}
                device={device}
                isActive={true}
                photo={true}
                enableZoomGesture
              />
            ) : (
              <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:'#fff' }}>Memuat kamera...</Text>
              </View>
            )}
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
                const cam = cameraRef.current;
                if(!cam || !device) return;
                try {
                  setUploading(true);
                  const photo = await (cam as any).takePhoto({ qualityPrioritization: 'quality', flash: 'off' });
                  const uri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
                  const normalized = await normalizeOrientation({ uri, width: photo.width, height: photo.height, exif: {} as any } as any);
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

const COLORS = {
  gold: '#FFD700',
  brown: '#4E342E',
  dark: '#181512',
  yellow: '#ffe082',
  white: '#fff',
  black: '#111',
  card: '#23201c',
  border: '#4e3f2c',
};

const styles = StyleSheet.create({
  infoOrderRowVertical: {
    flexDirection: 'column',
    gap: 14,
    marginBottom: 2,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  infoOrderRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
    marginBottom: 0,
    minHeight: 48,
    paddingVertical: 2,
  },
  infoOrderLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 128,
    maxWidth: 150,
    marginRight: 18,
    paddingTop: 6,
  },
  // selectPremium dan infoOrderMiniLabel sudah didefinisikan sebelumnya, hapus duplikat ini
  // infoOrderMiniLabel sudah didefinisikan sebelumnya, hapus duplikat ini
  selectPremium: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    color: COLORS.gold,
    fontWeight: '600',
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  infoOrderMiniLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  imageIconLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.1
  },
  imageGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  imageThumbWrap: {
    width: 64, height: 64, borderRadius: 10, overflow: 'hidden', marginRight: 8, marginBottom: 8, backgroundColor: '#222', borderWidth: 1, borderColor: COLORS.border, position:'relative',
  },
  imageThumb: {
    width: 64, height: 64, borderRadius: 10, backgroundColor: '#eee',
  },
  imageRemoveBtn: {
    position:'absolute', top:2, right:2, backgroundColor:'rgba(0,0,0,0.15)', borderRadius:10, padding:0,
  },
  imageBtnRow: {
    flexDirection:'row', alignItems:'center', gap:12, marginTop:2, marginBottom:2,
  },
  imageIconBtn: {
    backgroundColor:'rgba(35,32,28,0.85)', borderRadius:12, borderWidth:1, borderColor:COLORS.border, padding:8, marginRight:4,
  },
  dateRowCompact: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2, gap:8,
  },
  dateMiniCard: {
    flex:1, alignItems:'center', backgroundColor:'rgba(35,32,28,0.85)', borderRadius:12, borderWidth:1, borderColor:COLORS.gold, paddingVertical:10, marginHorizontal:2, minWidth:80,
  },
  dateMiniLabel: {
    color:COLORS.gold, fontSize:11, fontWeight:'600', marginBottom:2,
  },
  dateMiniValue: {
    color:COLORS.yellow, fontSize:13, fontWeight:'700',
  },
  cardSectionPremium: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionPremium: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  dividerGold: {
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginBottom: 18,
    opacity: 0.18,
  },
  inputWrapView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: 'rgba(35,32,28,0.85)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.border,
  },
  inputIconText: {
    marginLeft: 12,
    marginRight: 6,
  },
  inputPremiumText: {
    flex: 1,
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 8,
    backgroundColor: 'transparent',
    borderRadius: 14,
  },
  labelGold: {
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
    fontSize: 13,
  },
  cardSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  // labelGold sudah didefinisikan sebelumnya, hapus duplikat ini
  container: { padding: 18, backgroundColor: COLORS.dark },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 18, color: COLORS.gold },
  section: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8, color: COLORS.gold },
  subSection: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4, color: COLORS.gold },
  input: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, color: COLORS.gold, padding: 12, borderRadius: 10, marginBottom: 12, fontSize:14 },
  fieldGroup: { marginBottom: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingVertical:6, paddingHorizontal:12, borderRadius:20, borderWidth:1, borderColor:COLORS.gold, marginRight:6, marginBottom:6, backgroundColor:COLORS.card },
  pillActive: { backgroundColor:COLORS.gold, borderColor:COLORS.gold },
  pillText: { color:COLORS.gold },
  pillTextActive: { color:COLORS.dark },
  label: { marginBottom:6, fontWeight:'500', color: COLORS.gold },
  stoneRow: { flexDirection:'row', alignItems:'center', marginBottom:8 },
  stoneInput: { flex:1, marginRight:6, color: COLORS.gold, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1 },
  removeBtn: { backgroundColor:'#d33', padding:8, borderRadius:6 },
  pillSmall: { paddingVertical:4, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:COLORS.gold, marginRight:6, backgroundColor:COLORS.card },
  pillSmallActive: { backgroundColor:COLORS.gold, borderColor:COLORS.gold },
  dateRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  dateBtn: { flex:1, borderWidth:1, borderColor:COLORS.border, backgroundColor:COLORS.card, color:COLORS.gold, padding:10, borderRadius:6, marginRight:8 },
  selectHeader: { flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:COLORS.border, borderRadius:8, paddingHorizontal:12, paddingVertical:10, backgroundColor:COLORS.card },
  selectHeaderLabel: { flex:1, fontWeight:'500', color:COLORS.gold },
  selectHeaderValue: { flex:1, textAlign:'right', color:COLORS.gold, marginRight:8 },
  selectHeaderArrow: { color:COLORS.gold, fontSize:12 },
  stoneRowWrapper: { marginBottom:4 },
  stoneSelect: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:0 },
  stoneSelectText: { color:COLORS.gold },
  stoneDropdown: { marginTop:6, borderWidth:1, borderColor:COLORS.border, borderRadius:10, backgroundColor:COLORS.card, overflow:'hidden' },
  stoneItem: { paddingVertical:10, paddingHorizontal:14, borderBottomWidth:1, borderBottomColor:COLORS.border },
  stoneItemActive: { backgroundColor:COLORS.gold },
  stoneItemText: { fontSize:13, color:COLORS.gold },
  stoneItemTextActive: { color:COLORS.dark, fontWeight:'600' },
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
