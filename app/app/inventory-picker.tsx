import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions, Modal, Pressable } from 'react-native';
const FILTER_OPTIONS = [
  { key: 'goldType', label: 'Jenis Emas', values: ['Kuning', 'Putih', 'Rose', 'Lainnya'] },
  { key: 'goldColor', label: 'Warna Emas', values: ['Kuning', 'Putih', 'Rose', 'Lainnya'] },
  { key: 'category', label: 'Jenis Barang', values: ['Cincin', 'Gelang', 'Kalung', 'Liontin', 'Anting', 'Lainnya'] },
];
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/api/client';

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


const CARD_SIZE = (Dimensions.get('window').width - 48) / 2;

type InventoryItem = {
  id: number;
  name?: string;
  code?: string;
  goldType?: string;
  goldColor?: string;
  category?: string;
  images?: string[];
  [key: string]: any;
};

type Props = {
  navigation?: any;
};

export default function InventoryPickerScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [filtered, setFiltered] = useState<InventoryItem[]>([]);
  const [filterModal, setFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        // TODO: ganti dengan api.inventory.listAll jika sudah ada endpoint list all
  const res = await api.inventory.listByOrder(token, 0); // fallback, ganti jika perlu
        setData(res || []);
        setFiltered(res || []);
      } catch (e) {
        setData([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    let result = data;
    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.code && item.code.toLowerCase().includes(q)) ||
          (item.goldType && item.goldType.toLowerCase().includes(q)) ||
          (item.goldColor && item.goldColor.toLowerCase().includes(q)) ||
          (item.customerName && item.customerName.toLowerCase().includes(q))
      );
    }
    // Filter by activeFilters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => (item[key] || '').toLowerCase() === value.toLowerCase());
      }
    });
    setFiltered(result);
  }, [search, data, activeFilters]);

  const handleSelect = (item: InventoryItem) => {
    // Navigasi ke CreateOrderScreen, bawa data inventory
    if (navigation && navigation.navigate) {
      navigation.navigate('CreateOrder', { inventory: item });
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity style={s.card} onPress={() => handleSelect(item)}>
      <View style={s.imgWrap}>
        {item.images && item.images[0] ? (
          <Image source={{ uri: item.images[0] }} style={s.img} resizeMode="cover" />
        ) : (
          <Ionicons name="image" size={36} color={COLORS.gold} />
        )}
      </View>
      <Text style={s.name} numberOfLines={1}>{item.name || '-'}</Text>
      <Text style={s.code}>{item.code || '-'}</Text>
      <Text style={s.meta}>{item.goldType || ''} {item.goldColor ? '• ' + item.goldColor : ''}</Text>
      <Text style={s.meta}>{item.category || ''}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.gold} style={{marginLeft: 10, marginRight: 6}} />
        <TextInput
          placeholder="Cari kode/nama/jenis..."
          style={s.searchInput}
          placeholderTextColor={COLORS.gold}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={s.filterBtn} onPress={() => setFilterModal(true)}>
          <Ionicons name="filter" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Modal Filter */}
      <Modal visible={filterModal} animationType="slide" transparent>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Filter Inventory</Text>
            {FILTER_OPTIONS.map(opt => (
              <View key={opt.key} style={{marginBottom:12}}>
                <Text style={s.filterLabel}>{opt.label}</Text>
                <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                  {opt.values.map(val => (
                    <Pressable
                      key={val}
                      style={[s.filterPill, activeFilters[opt.key] === val && s.filterPillActive]}
                      onPress={() => setActiveFilters(f => ({ ...f, [opt.key]: f[opt.key] === val ? '' : val }))}
                    >
                      <Text style={[s.filterPillText, activeFilters[opt.key] === val && s.filterPillTextActive]}>{val}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:10}}>
              <TouchableOpacity onPress={() => setActiveFilters({})}><Text style={{color:COLORS.gold, marginRight:18}}>Reset</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterModal(false)}><Text style={{color:COLORS.gold, fontWeight:'bold'}}>Tutup</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} style={{marginTop: 32}} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{gap:12}}
          contentContainerStyle={{gap:12, paddingBottom:32}}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{color:COLORS.gold, textAlign:'center', marginTop:32}}>Tidak ada data inventory</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 16, height: 40, borderWidth:1, borderColor:COLORS.border },
  modalBg: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' },
  modalCard: { backgroundColor:COLORS.card, borderRadius:18, padding:22, width:'88%', borderWidth:1, borderColor:COLORS.border },
  modalTitle: { color:COLORS.gold, fontWeight:'bold', fontSize:17, marginBottom:12, textAlign:'center' },
  filterLabel: { color:COLORS.gold, fontWeight:'600', marginBottom:4 },
  filterPill: { backgroundColor:'#2d221a', borderRadius:16, paddingHorizontal:14, paddingVertical:6, borderWidth:1, borderColor:COLORS.border },
  filterPillActive: { backgroundColor:COLORS.gold, borderColor:COLORS.gold },
  filterPillText: { color:COLORS.gold, fontWeight:'600' },
  filterPillTextActive: { color:COLORS.dark, fontWeight:'bold' },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.gold, fontWeight:'500', backgroundColor:'transparent', borderWidth:0 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 12, alignItems:'center', flex:1, minWidth: CARD_SIZE, maxWidth: CARD_SIZE, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2}, borderWidth:1, borderColor:COLORS.border },
  filterBtn: { padding: 8, borderRadius: 12 },
  imgWrap: { width: 72, height: 72, borderRadius: 12, backgroundColor: COLORS.brown, alignItems:'center', justifyContent:'center', marginBottom: 8, overflow:'hidden' },
  img: { width: 72, height: 72, borderRadius: 12 },
  name: { color: COLORS.gold, fontWeight:'700', fontSize: 14, marginBottom:2, textAlign:'center' },
  code: { color: COLORS.yellow, fontSize: 12, marginBottom:2, textAlign:'center' },
  meta: { color: COLORS.gold, fontSize: 11, textAlign:'center' },
});
