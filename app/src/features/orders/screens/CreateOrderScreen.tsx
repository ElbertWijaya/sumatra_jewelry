import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { api, API_URL } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, BENTUK_BATU_OPTIONS, emptyStone, StoneFormItem } from '@constants/orderOptions';
import { InlineSelect } from '@ui/atoms/InlineSelect';
import { PremiumButton } from '@ui/atoms/PremiumButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import ImagePreviewModal from '@ui/molecules/ImagePreviewModal';

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
  const [dp, setDp] = useState('');
  const [hargaEmasPerGram, setHargaEmasPerGram] = useState('');
  const [hargaPerkiraan, setHargaPerkiraan] = useState('');
  const [hargaAkhir, setHargaAkhir] = useState('');
  const [promisedReadyDate, setPromisedReadyDate] = useState<string>('');
  const [tanggalSelesai, setTanggalSelesai] = useState<string>('');
  const [tanggalAmbil, setTanggalAmbil] = useState<string>('');
  const [showPicker, setShowPicker] = useState<null | { field: 'ready' | 'selesai' | 'ambil'; date: Date }>(null);
  const [referensiGambarUrls, setReferensiGambarUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [localImageName, setLocalImageName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Removed react-native-vision-camera to support Expo Go. We use Expo ImagePicker for camera capture instead.
  const [catatan, setCatatan] = useState('');
  const [stones, setStones] = useState<StoneFormItem[]>([]);
  const [ringSize, setRingSize] = useState('');
  const ringSizeInputRef = useRef<TextInput | null>(null);

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
  const makeCurrencyHandler = (setter: (v: string)=>void) => (text: string) => setter(formatIDR(text));

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
        ringSize: (jenisBarang === 'Women Ring' || jenisBarang === 'Men Ring') && ringSize ? ringSize : undefined,
      };
      const payload: any = {};
      Object.entries(payloadRaw).forEach(([k,v])=>{ if (v !== undefined) payload[k] = v; });
      return api.orders.create(token || '', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      onCreated && onCreated();
      Alert.alert('Sukses', 'Order dibuat');
      setCustomerName(''); setCustomerAddress(''); setCustomerPhone(''); setJenisBarang(''); setJenisEmas(''); setWarnaEmas(''); setDp(''); setHargaEmasPerGram(''); setHargaPerkiraan(''); setHargaAkhir(''); setPromisedReadyDate(''); setTanggalSelesai(''); setTanggalAmbil(''); setReferensiGambarUrls([]); setCatatan(''); setStones([]); setRingSize(''); setLocalImageName(null);
      setTimeout(() => { router.replace('/home'); }, 500);
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Gagal membuat order'),
  });

  const canCreate = user?.jobRole === 'ADMINISTRATOR' || user?.jobRole === 'SALES';
  const disabled = !customerName || !jenisBarang || !jenisEmas || !warnaEmas || mutation.isPending || uploading || !canCreate;

  const normalizeOrientation = async (asset: { uri: string; width?: number; height?: number; exif?: any; fileName?: string | null; mimeType?: string | null }) => {
    const exif = asset?.exif || {};
    const orientation: number | undefined = exif.Orientation || exif.orientation;
    const ops: any[] = [];
    const w = asset.width || 0;
    const h = asset.height || 0;
    const pixelsPortrait = h > w && w > 0 && h > 0;
    if (orientation) {
      switch (orientation) {
        case 3: ops.push({ rotate: 180 }); break;
        case 6: if (!pixelsPortrait) ops.push({ rotate: 90 }); break;
        case 8: if (!pixelsPortrait) ops.push({ rotate: 270 }); break;
        case 2: ops.push({ flip: ImageManipulator.FlipType.Horizontal }); break;
        case 4: ops.push({ flip: ImageManipulator.FlipType.Vertical }); break;
        case 5: ops.push({ rotate: 90 }); ops.push({ flip: ImageManipulator.FlipType.Horizontal }); break;
        case 7: ops.push({ rotate: 270 }); ops.push({ flip: ImageManipulator.FlipType.Horizontal }); break;
      }
    }
    try {
      const result = await ImageManipulator.manipulateAsync(asset.uri, ops, { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
      return { ...asset, uri: result.uri, width: result.width || w || 1, height: result.height || h || 1 };
    } catch {
      try {
        const noop = await ImageManipulator.manipulateAsync(asset.uri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
        return { ...asset, uri: noop.uri, width: noop.width || w || 1, height: noop.height || h || 1 };
      } catch { return { ...asset, width: w || 1, height: h || 1 }; }
    }
  };

  const toDisplayUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };

  const updateStone = (idx: number, patch: Partial<StoneFormItem>) => setStones(prev => prev.map((s,i)=> i===idx ? { ...s, ...patch } : s));
  const removeStone = (idx: number) => setStones(prev => prev.filter((_,i)=>i!==idx));
  const addStone = () => setStones(prev => [...prev, emptyStone()]);

  const [openDropdown, setOpenDropdown] = useState<string|null>(null);
  const [dropdownRowMargins, setDropdownRowMargins] = useState<{ [key: string]: number }>({});
  const renderSelectRow = (
    fieldKey: 'jenisBarang' | 'jenisEmas' | 'warnaEmas',
    label: string,
    value: string,
    options: string[],
    onChange: (v:string)=>void,
    styleHeader?: any
  ) => (
    <View style={{ marginBottom: dropdownRowMargins[fieldKey] || 0 }}>
      <InlineSelect
        label={label}
        value={value}
        options={options}
        onChange={(v) => { onChange(v); setOpenDropdown(null); }}
        styleHeader={styleHeader}
        onDropdownNeedsSpace={(space, direction) => {
          setDropdownRowMargins(prev => {
            if (space > 0 && openDropdown === fieldKey) return { ...prev, [fieldKey]: space }; else return { ...prev, [fieldKey]: 0 };
          });
        }}
      />
    </View>
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
      <ScrollView style={{ overflow: 'visible' }} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Order Baru</Text>
        {/* INFORMASI CUSTOMER */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-circle" size={22} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>INFORMASI CUSTOMER</Text>
          </View>
          <View style={styles.dividerGold} />
          <Text style={styles.labelGold}>Nama Customer</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="person" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput style={styles.inputPremiumText} placeholder="Nama Customer..." placeholderTextColor="#ffe082" value={customerName} onChangeText={setCustomerName} autoCapitalize="words" />
          </View>
          <Text style={styles.labelGold}>Alamat Customer</Text>
            <View style={styles.inputWrapView}>
              <Ionicons name="location" size={18} color={COLORS.gold} style={styles.inputIconText} />
              <TextInput style={styles.inputPremiumText} placeholder="Alamat Customer..." placeholderTextColor="#ffe082" value={customerAddress} onChangeText={setCustomerAddress} autoCapitalize="words" />
            </View>
          <Text style={styles.labelGold}>No Telepon Customer</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="call" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput style={styles.inputPremiumText} placeholder="No Telepon..." placeholderTextColor="#ffe082" value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" />
          </View>
        </View>
        {/* INFORMASI ORDER */}
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
              <View style={{width:'100%', maxWidth:320, alignSelf:'center', flexDirection:'row', alignItems:'center'}}>
                <View style={{flexShrink:1, minWidth:0}} />
                <View style={{width:150}}>
                  {renderSelectRow('jenisBarang', '', jenisBarang, JENIS_BARANG_OPTIONS, setJenisBarang, styles.selectPremium)}
                </View>
              </View>
            </View>
            <View style={styles.infoOrderRowHorizontal}>
              <View style={styles.infoOrderLabelWrap}>
                <Ionicons name="color-palette" size={16} color={COLORS.gold} style={{marginRight:6}} />
                <Text style={styles.infoOrderMiniLabel}>Jenis Emas</Text>
              </View>
              <View style={{width:'100%', maxWidth:320, alignSelf:'center', flexDirection:'row', alignItems:'center'}}>
                <View style={{flexShrink:1, minWidth:0}} />
                <View style={{width:150}}>
                  {renderSelectRow('jenisEmas', '', jenisEmas, JENIS_EMAS_OPTIONS, setJenisEmas, styles.selectPremium)}
                </View>
              </View>
            </View>
            <View style={styles.infoOrderRowHorizontal}>
              <View style={styles.infoOrderLabelWrap}>
                <Ionicons name="color-fill" size={16} color={COLORS.gold} style={{marginRight:6}} />
                <Text style={styles.infoOrderMiniLabel}>Warna Emas</Text>
              </View>
              <View style={{width:'100%', maxWidth:320, alignSelf:'center', flexDirection:'row', alignItems:'center'}}>
                <View style={{flexShrink:1, minWidth:0}} />
                <View style={{width:150}}>
                  {renderSelectRow('warnaEmas', '', warnaEmas, WARNA_EMAS_OPTIONS, setWarnaEmas, styles.selectPremium)}
                </View>
              </View>
            </View>
            {(jenisBarang === 'Women Ring' || jenisBarang === 'Men Ring') && (
              <View style={styles.infoOrderRowHorizontal}>
                <View style={styles.infoOrderLabelWrap}>
                  <Ionicons name="resize" size={16} color={COLORS.gold} style={{marginRight:6}} />
                  <Text style={styles.infoOrderMiniLabel}>Ukuran Cincin</Text>
                </View>
                <View style={{width:'100%', maxWidth:320, flexDirection:'row', alignItems:'center'}}>
                  <View style={{flexShrink:1, minWidth:0}} />
                  <View style={{width:110}}>
                    <View style={styles.ringSizeInputBox}>
                      <TextInput
                        ref={ringSizeInputRef}
                        style={styles.ringSizeNumericInput}
                        placeholder="--"
                        placeholderTextColor="#bfae6a"
                        value={ringSize}
                        onChangeText={(txt)=> setRingSize(txt.replace(/[^0-9]/g,''))}
                        keyboardType="numeric"
                        maxLength={3}
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
        {/* REFERENSI GAMBAR */}
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
                  <TouchableOpacity onPress={()=>{ setReferensiGambarUrls(prev=> prev.filter(u=>u!==url)); }} style={styles.imageRemoveBtn}>
                    <Ionicons name="close-circle" size={18} color="#b22" />
                  </TouchableOpacity>
                </View>
              );
            })}
            {referensiGambarUrls.length > 4 && (
              <View style={[styles.imageThumbWrap, {justifyContent:'center',alignItems:'center'}]}>
                <Text style={{color:COLORS.gold, fontWeight:'700'}}>+{referensiGambarUrls.length-4}</Text>
              </View>
            )}
          </View>
          <View style={styles.imageBtnRow}>
            <View style={{alignItems:'center', marginRight:8}}>
              <TouchableOpacity style={styles.imageIconBtn} onPress={async ()=>{
                if(uploading) return; if(!token){ Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
                try { setUploading(true); const perm = await ImagePicker.requestMediaLibraryPermissionsAsync(); if(!perm.granted){ Alert.alert('Izin ditolak'); return; } const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, exif: true, allowsEditing: false }); if(result.canceled) return; let asset = await normalizeOrientation(result.assets[0]); const uploaded = await handleUploadAsset(token || '', asset.uri, asset.fileName, asset.mimeType); setReferensiGambarUrls(prev => [...prev, uploaded.url]); setLocalImageName(asset.fileName || 'design.jpg'); } catch(e:any){ Alert.alert('Upload gagal', e.message || 'Error'); } finally { setUploading(false); } }}>
                <Ionicons name="image" size={22} color={COLORS.gold} />
              </TouchableOpacity>
              <Text style={styles.imageIconLabel}>Ambil dari Galeri</Text>
            </View>
            <View style={{alignItems:'center', marginRight:8}}>
              <TouchableOpacity style={styles.imageIconBtn} onPress={async ()=>{
                if(uploading) return; if(!token){ Alert.alert('Tidak ada token','Silakan login ulang.'); return; }
                try {
                  setUploading(true);
                  const perm = await ImagePicker.requestCameraPermissionsAsync();
                  if(!perm.granted){ Alert.alert('Izin kamera ditolak'); return; }
                  const result = await ImagePicker.launchCameraAsync({ quality: 0.85, exif: true, allowsEditing: false });
                  if(result.canceled) return;
                  let asset = await normalizeOrientation(result.assets[0]);
                  const uploaded = await handleUploadAsset(token || '', asset.uri, asset.fileName || 'camera.jpg', asset.mimeType || 'image/jpeg');
                  setReferensiGambarUrls(prev => [...prev, uploaded.url]);
                  setLocalImageName(asset.fileName || 'camera.jpg');
                } catch(e:any){
                  Alert.alert('Gagal ambil foto', e.message || 'Error');
                } finally {
                  setUploading(false);
                }
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
        {/* BATU / STONE */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="diamond" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>BATU / STONE</Text>
          </View>
          <View style={styles.dividerGold} />
          <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#2a2320', borderRadius:8, paddingVertical:6, marginBottom:4}}>
            <Text style={{flex:2, color:COLORS.gold, fontWeight:'bold', textAlign:'left', paddingLeft:8}}>Bentuk</Text>
            <Text style={{flex:1, color:COLORS.gold, fontWeight:'bold', textAlign:'left', paddingLeft:8}}>Jumlah</Text>
            <Text style={{flex:1, color:COLORS.gold, fontWeight:'bold', textAlign:'left', paddingLeft:8}}>Berat</Text>
            <Text style={{width:32}}></Text>
          </View>
          {stones.map((s,idx)=>(
            <React.Fragment key={idx}>
              <View style={{flexDirection:'row', alignItems:'center', marginBottom:4, borderRadius:8, paddingVertical:4}}>
                <TouchableOpacity style={{flex:2, marginHorizontal:4, paddingVertical:6, borderRadius:6, borderWidth:1, borderColor:'#FFD700', backgroundColor:'#23201c', flexDirection:'row', alignItems:'center', justifyContent:'flex-start', paddingLeft:8}} onPress={()=> setExpandedStoneIndex(expandedStoneIndex === idx ? null : idx)}>
                  <Text style={{color:'#ffe082', fontWeight:'600', textAlign:'left'}}>{s.bentuk || 'Bentuk Batu'}</Text>
                  <Text style={{marginLeft:6, color:'#ffe082'}}>{expandedStoneIndex === idx ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                <TextInput placeholder='Jumlah' style={{flex:1, marginHorizontal:4, color:'#ffe082', backgroundColor:'#23201c', borderRadius:6, borderWidth:1, borderColor:'#FFD700', textAlign:'left', fontWeight:'600', height:36, paddingLeft:8}} placeholderTextColor="#ffe082" value={s.jumlah} onChangeText={v=>updateStone(idx,{jumlah:v})} keyboardType='numeric' />
                <View style={{flex:1, marginHorizontal:4, flexDirection:'row', alignItems:'center', backgroundColor:'#23201c', borderRadius:6, borderWidth:1, borderColor:'#FFD700', height:36, paddingLeft:8}}>
                  <TextInput placeholder='Berat' style={{flex:1, color:'#ffe082', fontWeight:'600', padding:0}} placeholderTextColor="#ffe082" value={s.berat} onChangeText={v=>updateStone(idx,{berat:v})} keyboardType='numeric' />
                  <Text style={{ color:'#ffe082', fontWeight:'800', paddingHorizontal:8 }}>Gr</Text>
                </View>
                <TouchableOpacity onPress={()=>removeStone(idx)} style={{width:32, alignItems:'center', justifyContent:'center'}}>
                  <Ionicons name="close-circle" size={22} color="#b22" />
                </TouchableOpacity>
              </View>
              {expandedStoneIndex === idx && (
                <View style={{marginBottom:8, marginLeft:4, marginRight:4, backgroundColor:'#23201c', borderRadius:8, borderWidth:1, borderColor:'#FFD700', padding:6}}>
                  <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                    {BENTUK_BATU_OPTIONS.map(opt => {
                      const active = s.bentuk === opt;
                      return (
                        <TouchableOpacity key={opt} onPress={()=>{ updateStone(idx,{bentuk:opt}); setExpandedStoneIndex(null); }} style={{paddingVertical:6, paddingHorizontal:12, borderRadius:6, margin:4, backgroundColor:active ? COLORS.gold : '#181512'}}>
                          <Text style={{color:active ? '#181512' : '#ffe082', fontWeight:'600'}}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </React.Fragment>
          ))}
          <PremiumButton title="TAMBAH BATU" onPress={addStone} style={{ alignSelf:'flex-end', marginTop:8, minWidth:160 }} textStyle={{ fontSize:16 }} />
        </View>
        {/* PEMBAYARAN */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="cash" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>PEMBAYARAN</Text>
          </View>
          <View style={styles.dividerGold} />
          <Text style={styles.labelGold}>Harga Emas per Gram</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="pricetag" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput style={styles.inputPremiumText} placeholder="Harga Emas per Gram" placeholderTextColor="#ffe082" value={hargaEmasPerGram} onChangeText={makeCurrencyHandler(setHargaEmasPerGram)} keyboardType="numeric" />
          </View>
          <Text style={styles.labelGold}>Harga Perkiraan</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="calculator" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput style={styles.inputPremiumText} placeholder="Harga Perkiraan" placeholderTextColor="#ffe082" value={hargaPerkiraan} onChangeText={makeCurrencyHandler(setHargaPerkiraan)} keyboardType="numeric" />
          </View>
          <Text style={styles.labelGold}>DP</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="wallet" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput style={styles.inputPremiumText} placeholder="DP" placeholderTextColor="#ffe082" value={dp} onChangeText={makeCurrencyHandler(setDp)} keyboardType="numeric" />
          </View>
          <Text style={styles.labelGold}>Harga Akhir</Text>
          <View style={styles.inputWrapView}>
            <Ionicons name="cash-outline" size={18} color={COLORS.gold} style={styles.inputIconText} />
            <TextInput style={styles.inputPremiumText} placeholder="Harga Akhir" placeholderTextColor="#ffe082" value={hargaAkhir} onChangeText={makeCurrencyHandler(setHargaAkhir)} keyboardType="numeric" />
          </View>
        </View>
        {/* TANGGAL */}
        <View style={[styles.cardSectionPremium, {paddingVertical:14}]}> 
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>TANGGAL</Text>
          </View>
          <View style={styles.dividerGold} />
          <View style={styles.dateRowCompact}>
            <View style={{ flex:1, position:'relative' }}>
              <TouchableOpacity style={styles.dateMiniCard} onPress={()=>pickDate('ready')}>
              <Ionicons name="alarm" size={16} color={COLORS.gold} style={{marginBottom:2}} />
              <Text style={styles.dateMiniLabel}>Perkiraan Siap</Text>
              <Text style={styles.dateMiniValue}>{promisedReadyDate || '-'}</Text>
              </TouchableOpacity>
              {!!promisedReadyDate && (
                <TouchableOpacity onPress={()=>setPromisedReadyDate('')} style={{ position:'absolute', right: 6, top: 6 }}>
                  <Ionicons name="close-circle" size={16} color="#b22" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flex:1, position:'relative' }}>
              <TouchableOpacity style={styles.dateMiniCard} onPress={()=>pickDate('selesai')}>
              <Ionicons name="checkmark-done" size={16} color={COLORS.gold} style={{marginBottom:2}} />
              <Text style={styles.dateMiniLabel}>Selesai</Text>
              <Text style={styles.dateMiniValue}>{tanggalSelesai || '-'}</Text>
              </TouchableOpacity>
              {!!tanggalSelesai && (
                <TouchableOpacity onPress={()=>setTanggalSelesai('')} style={{ position:'absolute', right: 6, top: 6 }}>
                  <Ionicons name="close-circle" size={16} color="#b22" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flex:1, position:'relative' }}>
              <TouchableOpacity style={styles.dateMiniCard} onPress={()=>pickDate('ambil')}>
              <Ionicons name="archive" size={16} color={COLORS.gold} style={{marginBottom:2}} />
              <Text style={styles.dateMiniLabel}>Ambil</Text>
              <Text style={styles.dateMiniValue}>{tanggalAmbil || '-'}</Text>
              </TouchableOpacity>
              {!!tanggalAmbil && (
                <TouchableOpacity onPress={()=>setTanggalAmbil('')} style={{ position:'absolute', right: 6, top: 6 }}>
                  <Ionicons name="close-circle" size={16} color="#b22" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {showPicker && (
            <DateTimePicker
              value={showPicker.date}
              mode='date'
              display='default'
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </View>
        {/* CATATAN */}
        <View style={styles.cardSectionPremium}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="document-text" size={20} color={COLORS.gold} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionPremium}>CATATAN</Text>
          </View>
          <View style={styles.dividerGold} />
          <View style={{
            borderWidth:2, borderColor:COLORS.gold, borderRadius:16, backgroundColor:'#fff', padding:14, marginTop:8, marginBottom:8,
            shadowColor:'#FFD700', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2,
          }}>
            <TextInput placeholder='Tulis catatan di sini...' style={{minHeight:64, color:'#181512', fontSize:16, fontWeight:'500', textAlignVertical:'top', backgroundColor:'transparent', padding:0}} placeholderTextColor="#bfae6a" value={catatan} onChangeText={setCatatan} multiline underlineColorAndroid="transparent" />
          </View>
        </View>
        {!canCreate && (<Text style={{ color:'#c62828', marginBottom:8 }}>Akun Anda tidak memiliki izin untuk membuat order. Silakan login sebagai Sales atau Admin.</Text>)}
        <PremiumButton title={mutation.isPending ? 'MENYIMPAN...' : 'SIMPAN'} onPress={() => mutation.mutate()} disabled={disabled} loading={mutation.isPending} style={{ marginTop:18, marginHorizontal:8 }} textStyle={{ fontSize:18 }} />
        <View style={{ height: Platform.OS==='web' ? 40 : 120 }} />
      </ScrollView>
      {/* Removed Vision Camera modal to support Expo Go */}
      {previewUrl && <ImagePreviewModal url={previewUrl} onClose={()=> setPreviewUrl(null)} />}
    </>
  );
};

const COLORS = { gold: '#FFD700', brown: '#4E342E', dark: '#181512', yellow: '#ffe082', white: '#fff', black: '#111', card: '#23201c', border: '#4e3f2c' };
const FIELD_RADIUS = 8; // unified corner radius for inputs & selects
const FIELD_BORDER_WIDTH = 1.2; // unified stroke thickness for standard fields
const styles = StyleSheet.create({
  infoOrderRowVertical: { flexDirection: 'column', gap: 14, marginBottom: 2, marginTop: 2, paddingHorizontal: 2 },
  infoOrderRowHorizontal: { flexDirection: 'row', alignItems: 'flex-start', gap: 0, marginBottom: 0, minHeight: 48, paddingVertical: 2 },
  infoOrderLabelWrap: { flexDirection: 'row', alignItems: 'center', minWidth: 128, maxWidth: 150, marginRight: 18, paddingTop: 6 },
  selectPremium: { backgroundColor: COLORS.card, borderWidth: FIELD_BORDER_WIDTH, borderColor: COLORS.gold, borderRadius: FIELD_RADIUS, color: COLORS.gold, fontWeight: '600', fontSize: 15, paddingVertical: 8, paddingHorizontal: 10, marginTop: 2, marginBottom: 2, textAlign: 'center' },
  infoOrderMiniLabel: { color: COLORS.gold, fontSize: 12, fontWeight: '500', marginBottom: 0, textAlign: 'left', flexWrap: 'wrap', marginLeft: 6, letterSpacing: 0.2, textTransform: 'capitalize' },
  imageIconLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center', letterSpacing: 0.1 },
  imageGridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  imageThumbWrap: { width: 64, height: 64, borderRadius: 10, overflow: 'hidden', marginRight: 8, marginBottom: 8, backgroundColor: '#222', borderWidth: 1, borderColor: COLORS.border, position:'relative' },
  imageThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#eee' },
  imageRemoveBtn: { position:'absolute', top:2, right:2, backgroundColor:'rgba(0,0,0,0.15)', borderRadius:10, padding:0 },
  imageBtnRow: { flexDirection:'row', alignItems:'center', gap:12, marginTop:2, marginBottom:2 },
  imageIconBtn: { backgroundColor:'rgba(35,32,28,0.85)', borderRadius:12, borderWidth:1, borderColor:COLORS.border, padding:8, marginRight:4 },
  dateRowCompact: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2, gap:8 },
  dateMiniCard: { flex:1, alignItems:'center', backgroundColor:'rgba(35,32,28,0.85)', borderRadius:12, borderWidth:1, borderColor:COLORS.gold, paddingVertical:10, marginHorizontal:2, minWidth:80 },
  dateMiniLabel: { color:COLORS.gold, fontSize:11, fontWeight:'600', marginBottom:2 },
  dateMiniValue: { color:COLORS.yellow, fontSize:13, fontWeight:'700' },
  cardSectionPremium: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gold, padding: 22, marginBottom: 22, shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4, overflow: 'visible' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionHeaderIcon: { marginRight: 8 },
  sectionPremium: { color: COLORS.gold, fontWeight: '700', fontSize: 16, letterSpacing: 1.2, textTransform: 'uppercase' },
  dividerGold: { height: 2, backgroundColor: COLORS.gold, borderRadius: 2, marginBottom: 18, opacity: 0.18 },
  inputWrapView: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, backgroundColor: 'rgba(35,32,28,0.85)', borderRadius: 14, borderWidth: 1.2, borderColor: COLORS.border },
  inputIconText: { marginLeft: 12, marginRight: 6 },
  inputPremiumText: { flex: 1, color: COLORS.gold, fontSize: 15, fontWeight: '500', paddingVertical: 12, paddingRight: 12, paddingLeft: 8, backgroundColor: 'transparent', borderRadius: 14 },
  labelGold: { color: COLORS.gold, fontWeight: '600', marginBottom: 4, marginLeft: 2, fontSize: 13 },
  container: { padding: 18, backgroundColor: COLORS.dark },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 18, color: COLORS.gold },
  ringSizeBlock: { backgroundColor:'rgba(35,32,28,0.85)', borderWidth:1.4, borderColor:COLORS.gold, borderRadius:16, padding:14, marginTop:4 },
  ringSizeLabel: { color: COLORS.gold, fontSize:14, fontWeight:'600', letterSpacing:0.5 },
  ringSizeBox: { alignSelf:'flex-start', minWidth:110, borderWidth:2, borderStyle:'dashed', borderColor:COLORS.gold, backgroundColor:'#181512', borderRadius:14, paddingVertical:10, paddingHorizontal:14, marginBottom:6, shadowColor:'#000', shadowOpacity:0.25, shadowOffset:{width:0,height:2}, shadowRadius:4, elevation:3 },
  ringSizeInput: { color: COLORS.yellow, fontSize:28, fontWeight:'700', textAlign:'center', letterSpacing:1, padding:0, margin:0 },
  ringSizeHint: { color:'#bfae6a', fontSize:11, fontStyle:'italic' },
  ringSizeSelectBox: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1.2, borderColor:COLORS.gold, borderRadius:10, paddingHorizontal:14, paddingVertical:10, backgroundColor:'rgba(35,32,28,0.85)' }, // (legacy - not used now)
  ringSizeSelectInput: { flex:1, color:COLORS.gold, fontSize:15, fontWeight:'600', padding:0, margin:0 }, // (legacy)
  ringSizeInputBox: { borderWidth:FIELD_BORDER_WIDTH, borderColor:COLORS.gold, borderRadius:FIELD_RADIUS, backgroundColor:'rgba(24,21,18,0.9)', paddingVertical:4, paddingHorizontal:8, alignItems:'center', justifyContent:'center' },
  ringSizeNumericInput: { width:'100%', textAlign:'center', fontSize:22, fontWeight:'700', color:COLORS.yellow, padding:0, margin:0, letterSpacing:0.5 },
});

async function compressImage(uri: string) {
  try { const info: any = await FileSystem.getInfoAsync(uri); const large = info && info.size && info.size > 4.8 * 1024 * 1024; const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1600 } }], { compress: large ? 0.55 : 0.7, format: ImageManipulator.SaveFormat.JPEG }); return result.uri; } catch { return uri; }
}
async function uploadAsset(token: string, asset: { uri: string; fileName?: string | null; mimeType?: string | null }) {
  if(!token) throw new Error('Token hilang'); if(!asset?.uri) throw new Error('URI kosong'); const safeMime = asset.mimeType && asset.mimeType.includes('/') ? asset.mimeType : 'image/jpeg'; const finalUri = await compressImage(asset.uri); const form = new FormData(); const ensuredName = asset.fileName && /\./.test(asset.fileName) ? asset.fileName : `design_${Date.now()}.jpg`; form.append('file', { uri: finalUri, name: ensuredName, type: safeMime } as any); const endpoint = `${API_URL.replace(/\/$/, '')}/files/upload`; const uploadRes = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form as any }); if(!uploadRes.ok){ const t = await uploadRes.text(); throw new Error(t); } return uploadRes.json(); }
async function handleUploadAsset(token: string, uri: string, fileName?: string | null, mimeType?: string | null) { return uploadAsset(token, { uri, fileName, mimeType }); }
