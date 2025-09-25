
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_NOTIF = [
  { id: 1, text: 'Order #1234 telah disetujui' },
  { id: 2, text: 'Order #1235 menunggu pembayaran' },
];

const COLORS = {
  gold: '#bfa76a',
  dark: '#181512',
  brown: '#3e2723',
  yellow: '#ffe082',
  white: '#fff',
  black: '#111',
  card: '#23201c',
  border: '#4e3f2c',
};


export default function HomeScreen() {
  const { user } = useAuth();
  const { width, height } = Dimensions.get('window');
  return (
    <View style={{flex:1}}>
      <LinearGradient
        colors={[COLORS.brown, COLORS.gold, COLORS.black]}
        start={{x:0.1, y:0}}
        end={{x:1, y:1}}
        style={[StyleSheet.absoluteFill, {zIndex:-1}]}
      />
      <ScrollView style={s.container} contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false}>
        {/* Search Bar gentle dark */}
        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.gold} style={{marginLeft: 10, marginRight: 6}} />
          <TextInput placeholder="Cari order..." style={s.searchInput} placeholderTextColor={COLORS.gold} />
          <TouchableOpacity style={s.filterBtn}>
            <Ionicons name="filter" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Ringkasan Order dengan card gelap dan accent gold */}
        <View style={s.summaryRow}>
          <View style={s.darkCard}>
            <MaterialCommunityIcons name="diamond-stone" size={22} color={COLORS.gold} style={{marginBottom:2}} />
            <Text style={s.summaryNum}>5</Text>
            <Text style={s.summaryLabel}>Aktif</Text>
          </View>
          <View style={s.darkCard}>
            <MaterialCommunityIcons name="account-tie" size={22} color={COLORS.gold} style={{marginBottom:2}} />
            <Text style={s.summaryNum}>7</Text>
            <Text style={s.summaryLabel}>Ditugaskan</Text>
          </View>
          <View style={s.darkCard}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={COLORS.gold} style={{marginBottom:2}} />
            <Text style={s.summaryNum}>12</Text>
            <Text style={s.summaryLabel}>Selesai</Text>
          </View>
        </View>

        {/* Quick Actions icon only, card coklat gelap */}
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickBtn}>
            <Ionicons name="add-circle" size={36} color={COLORS.yellow} />
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn}>
            <Ionicons name="list" size={32} color={COLORS.yellow} />
          </TouchableOpacity>
        </View>

        {/* Notifikasi gentle dark */}
        <View style={s.notifCard}>
          <Ionicons name="notifications-outline" size={18} color={COLORS.gold} style={{marginRight:6}} />
          <View style={{flex:1}}>
            {MOCK_NOTIF.map(n => (
              <Text key={n.id} style={s.notifText}>{n.text}</Text>
            ))}
          </View>
        </View>

        {/* Tips/Promo exotic dark */}
        <View style={s.tipsCard}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={COLORS.gold} style={{marginRight:6}} />
          <Text style={s.tipsText}>Tips: Follow up customer secara rutin!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181512', padding: 18 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#23201c', borderRadius: 18, marginBottom: 22, height: 44, shadowColor:'#000', shadowOpacity:0.10, shadowRadius:8, shadowOffset:{width:0,height:2}, borderWidth:1, borderColor:'#4e3f2c' },
  searchInput: { flex: 1, fontSize: 16, color: '#ffe082', fontWeight:'500', backgroundColor:'transparent', borderWidth:0 },
  filterBtn: { padding: 8, borderRadius: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  darkCard: { flex:1, alignItems:'center', marginHorizontal: 6, paddingVertical: 18, borderRadius: 18, backgroundColor: '#23201c', borderWidth:1, borderColor:'#4e3f2c', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0,height:4} },
  summaryNum: { fontWeight: '700', fontSize: 22, color:'#ffe082', marginBottom:2 },
  summaryLabel: { color:'#bfa76a', fontSize: 13, fontWeight:'500' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickBtn: { flex:1, backgroundColor: '#3e2723', borderRadius: 16, alignItems: 'center', paddingVertical: 18, marginHorizontal: 8, shadowColor:'#000', shadowOpacity:0.10, shadowRadius:8, shadowOffset:{width:0,height:2} },
  notifCard: { flexDirection:'row', alignItems:'flex-start', backgroundColor: '#23201c', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth:1, borderColor:'#4e3f2c', shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  notifText: { color: '#ffe082', fontSize: 13, marginBottom: 2 },
  tipsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#23201c', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth:1, borderColor:'#4e3f2c' },
  tipsText: { color: '#bfa76a', fontSize: 13, flex:1, fontStyle:'italic' },
});
