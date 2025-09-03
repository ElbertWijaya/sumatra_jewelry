import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, emptyStone, StoneFormItem } from '../constants/orderOptions';
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
  const [kadar, setKadar] = useState('');
  const [beratTarget, setBeratTarget] = useState('');
  const [ongkos, setOngkos] = useState('');
  const [dp, setDp] = useState('');
  const [hargaEmasPerGram, setHargaEmasPerGram] = useState('');
  const [hargaPerkiraan, setHargaPerkiraan] = useState('');
  const [hargaAkhir, setHargaAkhir] = useState('');
  const [tanggalJanjiJadi, setTanggalJanjiJadi] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [tanggalAmbil, setTanggalAmbil] = useState('');
  const [referensiGambarUrl, setReferensiGambarUrl] = useState('');
  const [catatan, setCatatan] = useState('');
  const [stones, setStones] = useState<StoneFormItem[]>([]);

  const mutation = useMutation({
    mutationFn: () => api.orders.create(token || '', {
      customerName,
      customerAddress: customerAddress || undefined,
      customerPhone: customerPhone || undefined,
      jenisBarang,
      jenisEmas,
      warnaEmas,
      kadar: kadar ? Number(kadar) : undefined,
      beratTarget: beratTarget ? Number(beratTarget) : undefined,
      ongkos: Number(ongkos || 0),
      dp: dp ? Number(dp) : undefined,
      hargaEmasPerGram: hargaEmasPerGram ? Number(hargaEmasPerGram) : undefined,
      hargaPerkiraan: hargaPerkiraan ? Number(hargaPerkiraan) : undefined,
      hargaAkhir: hargaAkhir ? Number(hargaAkhir) : undefined,
      tanggalJanjiJadi: tanggalJanjiJadi || undefined,
      tanggalSelesai: tanggalSelesai || undefined,
      tanggalAmbil: tanggalAmbil || undefined,
      referensiGambarUrl: referensiGambarUrl || undefined,
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
  setCustomerName(''); setCustomerAddress(''); setCustomerPhone(''); setJenisBarang(''); setJenisEmas(''); setWarnaEmas(''); setKadar(''); setBeratTarget(''); setOngkos(''); setDp(''); setHargaEmasPerGram(''); setHargaPerkiraan(''); setHargaAkhir(''); setTanggalJanjiJadi(''); setTanggalSelesai(''); setTanggalAmbil(''); setReferensiGambarUrl(''); setCatatan(''); setStones([]);
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Gagal membuat order'),
  });

  const disabled = !customerName || !jenisBarang || !jenisEmas || !warnaEmas || !ongkos || mutation.isPending;

  const updateStone = (idx: number, patch: Partial<StoneFormItem>) => {
    setStones(prev => prev.map((s,i)=> i===idx ? { ...s, ...patch } : s));
  };
  const removeStone = (idx: number) => setStones(prev => prev.filter((_,i)=>i!==idx));
  const addStone = () => setStones(prev => [...prev, emptyStone()]);

  const renderSelectRow = (label: string, value: string, options: string[], onChange: (v:string)=>void) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map(opt => (
          <TouchableOpacity key={opt} onPress={()=>onChange(opt)} style={[styles.pill, value===opt && styles.pillActive]}>
            <Text style={value===opt? styles.pillTextActive: styles.pillText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Baru</Text>
      <Text style={styles.section}>Informasi Customer</Text>
      <TextInput placeholder='Nama Customer *' style={styles.input} value={customerName} onChangeText={setCustomerName} />
      <TextInput placeholder='Alamat Customer' style={styles.input} value={customerAddress} onChangeText={setCustomerAddress} />
      <TextInput placeholder='No Telepon Customer' style={styles.input} value={customerPhone} onChangeText={setCustomerPhone} keyboardType='phone-pad' />

      <Text style={styles.section}>Informasi Order</Text>
      {renderSelectRow('Jenis Barang *', jenisBarang, JENIS_BARANG_OPTIONS, setJenisBarang)}
      {renderSelectRow('Jenis Emas *', jenisEmas, JENIS_EMAS_OPTIONS, setJenisEmas)}
      {renderSelectRow('Warna Emas *', warnaEmas, WARNA_EMAS_OPTIONS, setWarnaEmas)}
      <TextInput placeholder='Kadar (%)' style={styles.input} value={kadar} onChangeText={setKadar} keyboardType='numeric' />
      <TextInput placeholder='Berat Target (gr)' style={styles.input} value={beratTarget} onChangeText={setBeratTarget} keyboardType='numeric' />
      <TextInput placeholder='Referensi Gambar URL' style={styles.input} value={referensiGambarUrl} onChangeText={setReferensiGambarUrl} />

      <Text style={styles.subSection}>Batu / Stone</Text>
      {stones.map((s,idx)=>(
        <View key={idx} style={styles.stoneRow}>
          <TextInput placeholder='Bentuk' style={[styles.input,styles.stoneInput]} value={s.bentuk} onChangeText={v=>updateStone(idx,{bentuk:v})} />
          <TextInput placeholder='Jumlah' style={[styles.input,styles.stoneInput]} value={s.jumlah} onChangeText={v=>updateStone(idx,{jumlah:v})} keyboardType='numeric' />
          <TextInput placeholder='Berat' style={[styles.input,styles.stoneInput]} value={s.berat} onChangeText={v=>updateStone(idx,{berat:v})} keyboardType='numeric' />
          <TouchableOpacity onPress={()=>removeStone(idx)} style={styles.removeBtn}><Text style={{color:'#fff'}}>X</Text></TouchableOpacity>
        </View>
      ))}
      <Button title='Tambah Batu' onPress={addStone} />

      <Text style={styles.section}>Pembayaran</Text>
      <TextInput placeholder='Harga Emas per Gram' style={styles.input} value={hargaEmasPerGram} onChangeText={setHargaEmasPerGram} keyboardType='numeric' />
      <TextInput placeholder='Harga Perkiraan' style={styles.input} value={hargaPerkiraan} onChangeText={setHargaPerkiraan} keyboardType='numeric' />
      <TextInput placeholder='DP' style={styles.input} value={dp} onChangeText={setDp} keyboardType='numeric' />
      <TextInput placeholder='Harga Akhir' style={styles.input} value={hargaAkhir} onChangeText={setHargaAkhir} keyboardType='numeric' />
      <TextInput placeholder='Ongkos *' style={styles.input} value={ongkos} onChangeText={setOngkos} keyboardType='numeric' />

      <Text style={styles.section}>Tanggal</Text>
      <TextInput placeholder='Tanggal Janji Jadi (YYYY-MM-DD)' style={styles.input} value={tanggalJanjiJadi} onChangeText={setTanggalJanjiJadi} />
      <TextInput placeholder='Tanggal Selesai (YYYY-MM-DD)' style={styles.input} value={tanggalSelesai} onChangeText={setTanggalSelesai} />
      <TextInput placeholder='Tanggal Ambil (YYYY-MM-DD)' style={styles.input} value={tanggalAmbil} onChangeText={setTanggalAmbil} />

      <TextInput placeholder='Catatan' style={[styles.input,{height:90}]} value={catatan} onChangeText={setCatatan} multiline />
      <Button title={mutation.isPending ? 'Menyimpan...' : 'Simpan'} disabled={disabled} onPress={() => mutation.mutate()} />
      <View style={{ height: Platform.OS==='web' ? 40 : 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 18 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  subSection: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
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
});
