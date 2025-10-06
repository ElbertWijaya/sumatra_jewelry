import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api, API_URL } from '@lib/api/client';
import ImagePreviewModal from '@ui/molecules/ImagePreviewModal';
import { useAuth } from '@lib/context/AuthContext';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c' };

export const OrderDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const orderId = Number(id);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
    refetchInterval: 12000,
  });

  const det: any = data || {};
  const stones: any[] = Array.isArray(det.stones) ? det.stones : [];
  const totalJumlahBatu = stones.reduce((acc, s) => acc + (Number(s?.jumlah) || 0), 0);
  const totalBeratBatu = stones.reduce((acc, s) => acc + (Number(s?.berat) || 0), 0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const formatDateStr = (s?: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s).slice(0, 10);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatIDR = (n?: number | null) => {
    if (n == null) return '-';
    try {
      return 'Rp ' + Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } catch {
      return 'Rp ' + String(n);
    }
  };

  const toDisplayUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };

  return (
    <>
      <Stack.Screen options={{ title: det?.code ? `Order ${det.code}` : `Order #${orderId}` }} />
      <ScrollView style={{ flex:1, backgroundColor: COLORS.dark }} contentContainerStyle={{ padding: 16 }}>
        {error ? <Text style={{ color:'#c62828', marginBottom: 8 }}>{String((error as any).message)}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.title}>Informasi Customer</Text>
          <View style={styles.divider} />
          <Text style={styles.row}><Text style={styles.key}>Nama:</Text> <Text style={styles.val}>{det.customerName || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Telp:</Text> <Text style={styles.val}>{det.customerPhone || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Alamat:</Text> <Text style={styles.val}>{det.customerAddress || '-'}</Text></Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Informasi Order</Text>
          <View style={styles.divider} />
          <Text style={styles.row}><Text style={styles.key}>Jenis:</Text> <Text style={styles.val}>{det.jenisBarang || det.jenis || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Jenis Emas:</Text> <Text style={styles.val}>{det.jenisEmas || '-'}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Warna:</Text> <Text style={styles.val}>{det.warnaEmas || '-'}</Text></Text>
          {det.ringSize ? <Text style={styles.row}><Text style={styles.key}>Ukuran Cincin:</Text> <Text style={styles.val}>{det.ringSize}</Text></Text> : null}
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Tanggal</Text>
          <View style={styles.divider} />
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.row}><Text style={styles.key}>Perkiraan Siap:</Text> <Text style={styles.val}>{det.promisedReadyDate ? formatDateStr(det.promisedReadyDate) : '-'}</Text></Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-clear" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.row}><Text style={styles.key}>Selesai:</Text> <Text style={styles.val}>{det.tanggalSelesai ? formatDateStr(det.tanggalSelesai) : '-'}</Text></Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-number" size={14} color={COLORS.gold} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.row}><Text style={styles.key}>Ambil:</Text> <Text style={styles.val}>{det.tanggalAmbil ? formatDateStr(det.tanggalAmbil) : '-'}</Text></Text>
          </View>
        </View>
        {stones.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.title}>Ringkasan Batu</Text>
            <View style={styles.divider} />
            <Text style={styles.row}><Text style={styles.key}>Jumlah Batu:</Text> <Text style={styles.val}>{totalJumlahBatu}</Text></Text>
            <Text style={styles.row}><Text style={styles.key}>Total Berat:</Text> <Text style={styles.val}>{totalBeratBatu > 0 ? `${totalBeratBatu} gr` : '-'}</Text></Text>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.title}>Ringkasan Pembayaran</Text>
          <View style={styles.divider} />
          <Text style={styles.row}><Text style={styles.key}>Harga Emas/gram:</Text> <Text style={styles.val}>{formatIDR(det.hargaEmasPerGram)}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Harga Perkiraan:</Text> <Text style={styles.val}>{formatIDR(det.hargaPerkiraan)}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>DP:</Text> <Text style={styles.val}>{formatIDR(det.dp)}</Text></Text>
          <Text style={styles.row}><Text style={styles.key}>Harga Akhir:</Text> <Text style={styles.val}>{formatIDR(det.hargaAkhir)}</Text></Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Catatan</Text>
          <View style={styles.divider} />
          <Text style={[styles.row, !det.catatan && styles.rowMuted]}>
            {det.catatan ? String(det.catatan) : 'Tidak ada catatan'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Referensi Gambar</Text>
          <View style={styles.divider} />
          {Array.isArray(det.referensiGambarUrls) && det.referensiGambarUrls.length > 0 ? (
            <View style={styles.imageGridWrap}>
              {det.referensiGambarUrls.slice(0,6).map((url: string, i: number) => {
                const display = toDisplayUrl(url);
                return (
                  <View key={url + i} style={styles.imageThumbWrap}>
                    <Image source={{ uri: display }} style={styles.imageThumb} />
                    <View style={styles.imageOverlay}>
                      <Text onPress={() => setPreviewUrl(display)} style={styles.viewText}>Lihat</Text>
                    </View>
                  </View>
                );
              })}
              {det.referensiGambarUrls.length > 6 && (
                <View style={[styles.imageThumbWrap, {justifyContent:'center',alignItems:'center'}]}>
                  <Text style={{color:COLORS.gold, fontWeight:'700'}}>+{det.referensiGambarUrls.length-6}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.row, styles.rowMuted]}>Tidak ada referensi gambar</Text>
          )}
        </View>
      </ScrollView>
      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, backgroundColor: COLORS.card, borderWidth:1, borderColor: COLORS.border, marginBottom: 12 },
  title: { color: COLORS.gold, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  divider: { height:1, backgroundColor: COLORS.border, opacity: 0.8, marginBottom: 8 },
  row: { color: COLORS.yellow, marginBottom: 4 },
  rowMuted: { color: '#9f8f5a' },
  key: { color: COLORS.gold, fontWeight:'700' },
  val: { color: COLORS.yellow, fontWeight:'600' },
  valMuted: { color: '#9f8f5a', fontWeight:'600' },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  imageGridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumbWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', marginRight: 8, marginBottom: 8, backgroundColor: '#222', borderWidth: 1, borderColor: COLORS.border },
  imageThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  imageOverlay: { position:'absolute', left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.35)', paddingVertical:2, alignItems:'center' },
  viewText: { color:'#fff', fontSize:11, fontWeight:'700' },
});
