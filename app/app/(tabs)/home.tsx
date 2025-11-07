

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@lib/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { api } from '@lib/api/client';
import { WorkerDashboardScreen } from '@features/tasks/screens/WorkerDashboardScreen';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';

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
  // Optional: Realtime status indicator can be used later if needed
  // const realtimeStatus = (useAuth() as any).realtimeStatus as 'connected'|'connecting'|'disconnected'|'error' | undefined;
  const { width, height } = Dimensions.get('window');
  const router = useRouter();
  // Fetch orders for order-level indicators
  const ordersQuery = useQuery<any[]>({
    queryKey: ['orders','inprogress','home'],
    queryFn: () => api.orders.list(token || '') as Promise<any[]>,
    enabled: !!token,
    // Tier1: faster polling for fresher dashboard counts
    refetchInterval: 6000,
    staleTime: 0,
  });
  // Fetch tasks for verification badge (awaiting validation) – may be user-scoped; still useful for Sales context we built
  const tasksQuery = useQuery<any[]>({
    queryKey: ['tasks','home'],
    queryFn: () => api.tasks.list(token || '') as Promise<any[]>,
    enabled: !!token,
    refetchInterval: 6000,
    staleTime: 0,
  });
  useFocusEffect(React.useCallback(() => {
    if (token) { ordersQuery.refetch(); tasksQuery.refetch(); }
  }, [token]));

  const allOrders = Array.isArray(ordersQuery.data) ? ordersQuery.data : [];
  const isActiveStatus = (s?: string|null) => {
    const v = String(s || '').toUpperCase();
    return v === 'DITERIMA' || v === 'DALAM_PROSES';
  };
  const countAktif = allOrders.filter(o => isActiveStatus(o.status)).length;
  const countDitugaskan = allOrders.filter(o => {
    const v = String(o?.status || '').toUpperCase();
    return v === 'ASSIGNED' || v === 'DITERIMA';
  }).length;
  const countSelesai = allOrders.filter(o => {
    const v = String(o?.status || '').toUpperCase();
    return v === 'DONE' || v === 'SELESAI';
  }).length;
  const verifOrderIds = (() => {
    const arr = Array.isArray(tasksQuery.data) ? tasksQuery.data : [];
    const awaiting = arr.filter(t => String(t?.status || '').toUpperCase() === 'AWAITING_VALIDATION');
    return new Set<number>(awaiting.map(t => Number(t.orderId)).filter(Boolean));
  })();
  const countVerifikasi = verifOrderIds.size;

  const stats = {
    aktif: { count: countAktif, change: 0 },
    ditugaskan: { count: countDitugaskan, change: 0 },
    selesai: { count: countSelesai, change: 0 },
    verifikasi: { count: countVerifikasi, change: 0 },
  } as const;

  // Debug removed: indicators now purely computed client-side from orders list.

  const isWorkerRole = React.useMemo(() => {
    const r = String(user?.jobRole || user?.job_role || '').toUpperCase();
    return ['DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY'].includes(r);
  }, [user]);

  if (isWorkerRole) {
    return <WorkerDashboardScreen />;
  }

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

        {/* Stats Grid (Redesigned 2x2 uniform cards) */}
        <View style={s.statsSection}>
          <View style={s.statsHeaderRow}>
              <Text style={s.statsTitle}>Business Overview</Text>
              <TouchableOpacity onPress={() => { ordersQuery.refetch(); tasksQuery.refetch(); }} style={s.refreshBtn} activeOpacity={0.8}>
                <Ionicons name="refresh" size={16} color={COLORS.gold} />
                <Text style={s.refreshTxt}>Refresh</Text>
              </TouchableOpacity>
            </View>
          <View style={s.statGrid}>
            <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/my-orders?filter=aktif')}>
              <View style={s.tileTopRow}>
                <View style={s.iconBadge}><MaterialCommunityIcons name="diamond-stone" size={18} color={COLORS.gold} /></View>
                <Text style={s.tileLabel}>Aktif</Text>
              </View>
              <Text style={s.tileValue}>{stats.aktif.count}</Text>
              <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((stats.aktif.count/10)*100,100)}%` }]} /></View>
              <Text style={s.tileMeta}>{stats.aktif.change > 0 ? '+' : ''}{stats.aktif.change} hari ini</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/my-orders?filter=ditugaskan')}>
              <View style={s.tileTopRow}>
                <View style={s.iconBadge}><MaterialCommunityIcons name="account-tie" size={18} color={COLORS.gold} /></View>
                <Text style={s.tileLabel}>Ditugaskan</Text>
              </View>
              <Text style={s.tileValue}>{stats.ditugaskan.count}</Text>
              <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((stats.ditugaskan.count/10)*100,100)}%` }]} /></View>
              <Text style={s.tileMeta}>{stats.ditugaskan.change > 0 ? '+' : ''}{stats.ditugaskan.change} hari ini</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/my-orders?filter=selesai')}>
              <View style={s.tileTopRow}>
                <View style={s.iconBadge}><MaterialCommunityIcons name="check-circle-outline" size={18} color={COLORS.gold} /></View>
                <Text style={s.tileLabel}>Selesai</Text>
              </View>
              <Text style={s.tileValue}>{stats.selesai.count}</Text>
              <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((stats.selesai.count/10)*100,100)}%` }]} /></View>
              <Text style={s.tileMeta}>{stats.selesai.change > 0 ? '+' : ''}{stats.selesai.change} hari ini</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/my-orders?filter=verifikasi')}>
              <View style={s.tileTopRow}>
                <View style={s.iconBadge}><Ionicons name="checkmark-done-circle" size={18} color={COLORS.gold} /></View>
                <Text style={s.tileLabel}>Verifikasi</Text>
              </View>
              <Text style={s.tileValue}>{stats.verifikasi.count}</Text>
              <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((stats.verifikasi.count/10)*100,100)}%` }]} /></View>
              <Text style={s.tileMeta}>{stats.verifikasi.change > 0 ? '+' : ''}{stats.verifikasi.change} hari ini</Text>
            </TouchableOpacity>
          </View>
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
  // Redesigned stats grid styles
  statsSection: { marginBottom: 28 },
  statsHeaderRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 12, paddingHorizontal:16 },
  refreshBtn: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(255,215,0,0.08)', paddingHorizontal:10, paddingVertical:6, borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  refreshTxt: { color: COLORS.gold, fontSize:11, fontWeight:'700' },
  statsTitle: { color: COLORS.gold, fontSize: 18, fontWeight: '700' },
  statGrid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', paddingHorizontal:16 },
  statTile: { width: '48%', backgroundColor: COLORS.card, borderRadius: 18, padding: 14, marginBottom: 14, borderWidth:1, borderColor: COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  tileTopRow: { flexDirection:'row', alignItems:'center', marginBottom: 8, gap:8 },
  iconBadge: { backgroundColor: '#2b2522', padding:8, borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  tileLabel: { color: COLORS.yellow, fontSize: 12, fontWeight:'700', letterSpacing:0.3 },
  tileValue: { color: COLORS.gold, fontSize: 28, fontWeight:'800', marginBottom: 6 },
  tileBar: { height: 5, backgroundColor:'rgba(255,215,0,0.18)', borderRadius: 999, overflow:'hidden', marginBottom:6 },
  tileBarFill: { height:'100%', backgroundColor: COLORS.gold },
  tileMeta: { color: '#bfae6a', fontSize: 11, fontWeight:'600' },
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
  // debugText removed
});
