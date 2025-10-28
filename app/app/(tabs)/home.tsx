

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { api } from '@lib/api/client';

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
  const { user, token } = useAuth();
  const { width, height } = Dimensions.get('window');
  const router = useRouter();
  const [stats, setStats] = useState({
    aktif: { count: 0, change: 0 },
    ditugaskan: { count: 0, change: 0 },
    selesai: { count: 0, change: 0 },
    pending: { count: 0, change: 0 }
  });

  useEffect(() => {
    if (token) {
      api.dashboard.stats(token).then(setStats).catch(console.error);
    }
  }, [token]);

  return (
    <View style={{flex:1}}>
      <LinearGradient
        colors={[COLORS.gold, COLORS.brown, COLORS.black, COLORS.gold]}
        start={{x:0, y:0}}
        end={{x:1, y:1}}
        style={[StyleSheet.absoluteFill, {zIndex:-1}]}
      />
      <ScrollView style={s.container} contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={s.heroSection}>
          <LinearGradient
            colors={[COLORS.gold, COLORS.brown, COLORS.dark]}
            start={{x:0, y:0}}
            end={{x:1, y:1}}
            style={s.heroGradient}
          >
            <View style={s.heroContent}>
              <Text style={s.heroGreeting}>Selamat datang kembali,</Text>
              <Text style={s.heroName}>{user?.fullName || 'User'}</Text>
              <Text style={s.heroSubtitle}>Mari kelola bisnis perhiasan Anda hari ini</Text>
            </View>
            <View style={s.heroDecoration}>
              <MaterialCommunityIcons name="diamond-stone" size={80} color={COLORS.white} style={{opacity: 0.3}} />
            </View>
          </LinearGradient>
        </View>

        {/* Stats Strip */}
        <View style={s.statsStrip}>
          <Text style={s.statsTitle}>Business Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsContainer}>
            <View style={s.statItem}>
              <View style={s.statHeader}>
                <MaterialCommunityIcons name="diamond-stone" size={24} color={COLORS.gold} />
                <Text style={s.statMetric}>Aktif</Text>
              </View>
              <Text style={s.statValue}>{stats.aktif.count}</Text>
              <View style={s.statProgress}>
                <View style={[s.statProgressBar, {width: `${Math.min((stats.aktif.count / 10) * 100, 100)}%`}]} />
              </View>
              <Text style={s.statChange}>{stats.aktif.change > 0 ? '+' : ''}{stats.aktif.change} hari ini</Text>
            </View>
            <View style={s.statItem}>
              <View style={s.statHeader}>
                <MaterialCommunityIcons name="account-tie" size={24} color={COLORS.gold} />
                <Text style={s.statMetric}>Ditugaskan</Text>
              </View>
              <Text style={s.statValue}>{stats.ditugaskan.count}</Text>
              <View style={s.statProgress}>
                <View style={[s.statProgressBar, {width: `${Math.min((stats.ditugaskan.count / 10) * 100, 100)}%`}]} />
              </View>
              <Text style={s.statChange}>{stats.ditugaskan.change > 0 ? '+' : ''}{stats.ditugaskan.change} hari ini</Text>
            </View>
            <View style={s.statItem}>
              <View style={s.statHeader}>
                <MaterialCommunityIcons name="check-circle-outline" size={24} color={COLORS.gold} />
                <Text style={s.statMetric}>Selesai</Text>
              </View>
              <Text style={s.statValue}>{stats.selesai.count}</Text>
              <View style={s.statProgress}>
                <View style={[s.statProgressBar, {width: `${Math.min((stats.selesai.count / 10) * 100, 100)}%`}]} />
              </View>
              <Text style={s.statChange}>{stats.selesai.change > 0 ? '+' : ''}{stats.selesai.change} hari ini</Text>
            </View>
            <View style={s.statItem}>
              <View style={s.statHeader}>
                <Ionicons name="time-outline" size={24} color={COLORS.gold} />
                <Text style={s.statMetric}>Pending</Text>
              </View>
              <Text style={s.statValue}>{stats.pending.count}</Text>
              <View style={s.statProgress}>
                <View style={[s.statProgressBar, {width: `${Math.min((stats.pending.count / 10) * 100, 100)}%`}]} />
              </View>
              <Text style={s.statChange}>{stats.pending.change > 0 ? '+' : ''}{stats.pending.change} hari ini</Text>
            </View>
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={s.actionsSection}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            <TouchableOpacity style={s.actionButton} onPress={() => router.push('/create-order')}>
              <View style={s.actionIconBg}>
                <Ionicons name="add-circle" size={28} color={COLORS.yellow} />
              </View>
              <Text style={s.actionButtonText}>Order Baru</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionButton} onPress={() => router.push('/my-orders')}>
              <View style={s.actionIconBg}>
                <Ionicons name="list" size={28} color={COLORS.yellow} />
              </View>
              <Text style={s.actionButtonText}>Order Saya</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionButton} onPress={() => router.push('/inventory-picker')}>
              <View style={s.actionIconBg}>
                <Ionicons name="archive" size={28} color={COLORS.yellow} />
              </View>
              <Text style={s.actionButtonText}>Inventory</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={s.notificationsSection}>
          <View style={s.sectionHeader}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.gold} />
            <Text style={s.sectionTitle}>Notifikasi Terbaru</Text>
          </View>
          <View style={s.notificationsList}>
            {MOCK_NOTIF.map(n => (
              <View key={n.id} style={s.notificationItem}>
                <View style={s.notificationDot} />
                <Text style={s.notificationText}>{n.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={s.tipsSection}>
          <View style={s.tipsCard}>
            <View style={s.tipsHeader}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={COLORS.gold} />
              <Text style={s.tipsTitle}>Tips & Info</Text>
            </View>
            <Text style={s.tipsText}>Tips: Follow up customer secara rutin untuk meningkatkan kepuasan dan loyalitas!</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heroSection: { marginBottom: 20 },
  heroGradient: { borderRadius: 20, padding: 20, minHeight: 140 },
  heroContent: { flex: 1, justifyContent: 'center' },
  heroGreeting: { color: COLORS.white, fontSize: 16, fontWeight: '500', opacity: 0.9 },
  heroName: { color: COLORS.white, fontSize: 26, fontWeight: '700', marginTop: 4 },
  heroSubtitle: { color: COLORS.white, fontSize: 14, fontWeight: '400', opacity: 0.8, marginTop: 6 },
  heroDecoration: { position: 'absolute', right: 16, top: 16 },
  statsStrip: { marginBottom: 28 },
  statsTitle: { color: COLORS.gold, fontSize: 18, fontWeight: '700', marginBottom: 12, marginLeft: 16 },
  statsContainer: { paddingHorizontal: 16, gap: 12 },
  statItem: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, minWidth: 110, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statMetric: { color: COLORS.yellow, fontSize: 12, fontWeight: '500', marginLeft: 6 },
  statValue: { color: COLORS.gold, fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  statProgress: { width: '100%', height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 6 },
  statProgressBar: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 2 },
  statChange: { color: COLORS.yellow, fontSize: 10, fontWeight: '500' },
  actionsSection: { marginBottom: 28 },
  sectionTitle: { color: COLORS.gold, fontSize: 20, fontWeight: '700', marginBottom: 16, marginLeft: 16 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16 },
  actionButton: { alignItems: 'center', minWidth: 80 },
  actionIconBg: { backgroundColor: COLORS.brown, borderRadius: 16, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  actionButtonText: { color: COLORS.gold, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  notificationsSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 16 },
  notificationsList: { paddingHorizontal: 16 },
  notificationItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  notificationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold, marginRight: 12 },
  notificationText: { color: COLORS.yellow, fontSize: 14, flex: 1 },
  tipsSection: { marginBottom: 20 },
  tipsCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginHorizontal: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tipsTitle: { color: COLORS.gold, fontSize: 18, fontWeight: '700', marginLeft: 8 },
  tipsText: { color: COLORS.gold, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
});
