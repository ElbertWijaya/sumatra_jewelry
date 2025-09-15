import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/api/client';

export default function InventoryFormScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = Number(params.orderId || '0');
  const { token } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [karat, setKarat] = useState('');
  const [goldType, setGoldType] = useState('');
  const [goldColor, setGoldColor] = useState('');
  const [weightGross, setWeightGross] = useState('');
  const [weightNet, setWeightNet] = useState('');
  const [stoneCount, setStoneCount] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [size, setSize] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!token) return;
    if (!orderId) { Alert.alert('Form', 'OrderId tidak valid'); return; }
    setBusy(true);
    try {
      await api.inventory.create(token, {
        orderId,
        name: name || undefined,
        category: category || undefined,
        material: material || undefined,
        karat: karat || undefined,
        goldType: goldType || undefined,
        goldColor: goldColor || undefined,
        weightGross: weightGross ? Number(weightGross) : undefined,
        weightNet: weightNet ? Number(weightNet) : undefined,
        stoneCount: stoneCount ? Number(stoneCount) : undefined,
        stoneWeight: stoneWeight ? Number(stoneWeight) : undefined,
        size: size || undefined,
        dimensions: dimensions || undefined,
        barcode: barcode || undefined,
        sku: sku || undefined,
        location: location || undefined,
        cost: cost ? Number(cost) : undefined,
        price: price ? Number(price) : undefined,
        notes: notes || undefined,
      });
      Alert.alert('Inventory', 'Data inventory tersimpan');
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || String(e));
    } finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>Masukkan Ke Dalam Inventory</Text>
      <Text style={s.hint}>Order ID: {orderId}</Text>
      <View style={{ height: 6 }} />
      {[
        ['Nama', name, setName],
        ['Kategori', category, setCategory],
        ['Material', material, setMaterial],
        ['Karat', karat, setKarat],
        ['Jenis Emas', goldType, setGoldType],
        ['Warna Emas', goldColor, setGoldColor],
        ['Berat Kotor (gr)', weightGross, setWeightGross],
        ['Berat Bersih (gr)', weightNet, setWeightNet],
        ['Jumlah Batu', stoneCount, setStoneCount],
        ['Berat Batu (gr)', stoneWeight, setStoneWeight],
        ['Ukuran', size, setSize],
        ['Dimensi', dimensions, setDimensions],
        ['Barcode', barcode, setBarcode],
        ['SKU', sku, setSku],
        ['Lokasi', location, setLocation],
        ['Harga Pokok', cost, setCost],
        ['Harga Jual', price, setPrice],
      ].map(([label, val, setter], idx) => (
        <View key={String(label)+idx} style={s.row}>
          <Text style={s.label}>{label as string}</Text>
          <TextInput style={s.input} value={val as string} onChangeText={setter as any} />
        </View>
      ))}
      <View style={s.row}>
        <Text style={s.label}>Catatan</Text>
        <TextInput style={[s.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline />
      </View>
      <TouchableOpacity disabled={busy} onPress={submit} style={[s.primary, busy && { opacity: 0.6 }]}>
        <Text style={s.primaryText}>{busy ? 'Menyimpan...' : 'Simpan'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color:'#111' },
  hint: { color:'#666', marginTop: 4 },
  row: { marginBottom: 10 },
  label: { color:'#666', marginBottom: 4 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:10, paddingVertical:8 },
  primary: { marginTop: 12, backgroundColor:'#1976d2', paddingVertical: 12, borderRadius: 8, alignItems:'center' },
  primaryText: { color:'#fff', fontWeight:'700' },
});
