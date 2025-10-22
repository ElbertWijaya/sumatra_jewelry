

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const MOCK_NOTIF = [
  { id: 1, text: 'Order #1234 telah disetujui' },
  { id: 2, text: 'Order #1235 menunggu pembayaran' },
];

const COLORS = {
  gold: '#FFD700', // lebih terang
  brown: '#4E342E',
  dark: '#181512',
  yellow: '#ffe082',
  white: '#fff',
  black: '#111',
  card: '#23201c',
  border: '#4e3f2c',
};


export default function HomeScreen() {
        {/* Divider solid gold */}
        <View style={s.statusDividerSolid} />
  const { user } = useAuth();
  const { width, height } = Dimensions.get('window');
  const router = useRouter();
  return (
    <View style={{flex:1}}>
      <LinearGradient
        colors={[COLORS.gold, COLORS.brown, COLORS.black, COLORS.gold]}
        start={{x:0, y:0}}
        end={{x:1, y:1}}
        style={[StyleSheet.absoluteFill, {zIndex:-1}]}
      />
      <ScrollView style={s.container} contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={s.greetingWrap}>
          <Text style={s.greetingText}>Selamat datang,</Text>
          <Text style={s.greetingName}>{user?.fullName || 'User'}</Text>
        </View>

        {/* Indikator status minimalis */}
        <View style={s.indicatorMinimalRow}>
          <View style={s.indicatorMinimalItem}>
            <MaterialCommunityIcons name="diamond-stone" size={22} color={COLORS.gold} />
            <Text style={s.indicatorMinimalNum}>5</Text>
          </View>
          <View style={s.indicatorMinimalItem}>
            <MaterialCommunityIcons name="account-tie" size={22} color={COLORS.gold} />
            <Text style={s.indicatorMinimalNum}>7</Text>
          </View>
          <View style={s.indicatorMinimalItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={COLORS.gold} />
            <Text style={s.indicatorMinimalNum}>12</Text>
          </View>
        </View>
        <View style={s.indicatorMinimalLabelRow}>
          <Text style={s.indicatorMinimalLabel}>Aktif</Text>
          <Text style={s.indicatorMinimalLabel}>Ditugaskan</Text>
          <Text style={s.indicatorMinimalLabel}>Selesai</Text>
        </View>

        {/* Quick Actions besar */}
        <View style={s.quickRowCompact}>
          <TouchableOpacity style={s.quickBtnCompact} onPress={() => router.push('/create-order')}>
            <View style={s.quickIconCircleCompact}><Ionicons name="add-circle" size={22} color={COLORS.yellow} /></View>
            <Text style={s.quickLabelCompact}>Order Baru</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtnCompact} onPress={() => router.push('/my-orders')}>
            <View style={s.quickIconCircleCompact}><Ionicons name="list" size={20} color={COLORS.yellow} /></View>
            <Text style={s.quickLabelCompact}>Order Saya</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtnCompact} onPress={() => router.push('/inventory-picker')}>
            <View style={s.quickIconCircleCompact}><Ionicons name="archive" size={20} color={COLORS.yellow} /></View>
            <Text style={s.quickLabelCompact}>Ambil dari Inventory</Text>
          </TouchableOpacity>
        </View>

        {/* Notifikasi dan tips clean */}
        <View style={s.notifCardModern}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.gold} style={{marginRight:10}} />
          <View style={{flex:1}}>
            {MOCK_NOTIF.map(n => (
              <Text key={n.id} style={s.notifTextModern}>{n.text}</Text>
            ))}
          </View>
        </View>
        <View style={s.tipsCardModern}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={COLORS.gold} style={{marginRight:10}} />
          <Text style={s.tipsTextModern}>Tips: Follow up customer secara rutin!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  greetingWrap: { marginBottom: 18 },
  greetingText: { color: COLORS.gold, fontSize: 16, fontWeight:'500', marginBottom:2 },
  greetingName: { color: COLORS.yellow, fontSize: 22, fontWeight:'700', marginBottom:2 },
  indicatorMinimalRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:2, marginTop:2, paddingHorizontal:2 },
  indicatorMinimalItem: { alignItems:'center', flex:1 },
  indicatorMinimalNum: { fontWeight:'bold', fontSize:22, color:COLORS.gold, marginTop:2 },
  indicatorMinimalLabelRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:18, marginTop:0, paddingHorizontal:2 },
  indicatorMinimalLabel: { color:COLORS.yellow, fontSize:12, fontWeight:'500', textAlign:'center', flex:1 },
  statusDividerSolid: { height: 3, backgroundColor: COLORS.gold, borderRadius: 2, marginVertical: 14, marginHorizontal: 8 },
  quickRowCompact: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 6 },
  quickBtnCompact: { flex:1, backgroundColor: COLORS.brown, borderRadius: 14, alignItems: 'center', paddingVertical: 10, marginHorizontal: 1, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:4, shadowOffset:{width:0,height:1}, minWidth: 60 },
  quickIconCircleCompact: { backgroundColor: COLORS.card, borderRadius: 24, padding: 7, marginBottom: 4, borderWidth:1, borderColor:COLORS.border },
  quickLabelCompact: { color: COLORS.yellow, fontSize: 11, fontWeight:'600', textAlign:'center', marginTop: 1 },
  notifCardModern: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 18, borderWidth:1, borderColor:COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  notifTextModern: { color: COLORS.yellow, fontSize: 14, marginBottom: 2 },
  tipsCardModern: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth:1, borderColor:COLORS.border },
  tipsTextModern: { color: COLORS.gold, fontSize: 14, flex:1, fontStyle:'italic' },
});
