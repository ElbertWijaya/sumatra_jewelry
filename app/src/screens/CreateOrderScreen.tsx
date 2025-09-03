import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const CreateOrderScreen: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [customerName, setCustomerName] = useState('');
  const [jenis, setJenis] = useState('');
  const [ongkos, setOngkos] = useState('');
  const [dp, setDp] = useState('');
  const [catatan, setCatatan] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.orders.create(token || '', {
      customerName,
      jenis,
      ongkos: Number(ongkos || 0),
      dp: dp ? Number(dp) : undefined,
      catatan: catatan || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      onCreated && onCreated();
      Alert.alert('Sukses', 'Order dibuat');
      setCustomerName(''); setJenis(''); setOngkos(''); setDp(''); setCatatan('');
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Gagal membuat order'),
  });

  const disabled = !customerName || !jenis || !ongkos || mutation.isPending;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Baru</Text>
      <TextInput placeholder='Nama Customer' style={styles.input} value={customerName} onChangeText={setCustomerName} />
      <TextInput placeholder='Jenis' style={styles.input} value={jenis} onChangeText={setJenis} />
      <TextInput placeholder='Ongkos (angka)' keyboardType='numeric' style={styles.input} value={ongkos} onChangeText={setOngkos} />
      <TextInput placeholder='DP (opsional)' keyboardType='numeric' style={styles.input} value={dp} onChangeText={setDp} />
      <TextInput placeholder='Catatan (opsional)' style={[styles.input,{height:90}]} value={catatan} onChangeText={setCatatan} multiline />
  <Button title={mutation.isPending ? 'Menyimpan...' : 'Simpan'} disabled={disabled} onPress={() => mutation.mutate()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
});
