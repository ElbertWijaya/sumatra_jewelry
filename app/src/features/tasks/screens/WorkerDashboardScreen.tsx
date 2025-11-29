import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_URL } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c', danger:'#c62828', success:'#2e7d32', brown:'#4E342E', white:'#ffffff' };

// Types inferred from backend include usage
export type Task = {
  id: number;
  orderId: number;
  stage?: string | null;
  notes?: string | null;
  jobRole?: string | null;
  status?: 'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'AWAITING_VALIDATION'|'DONE'|'CANCELLED'|string;
  isChecked?: boolean;
  assignedToId?: string | null;
  order?: { id: number; code?: string | null; status?: string | null; promisedReadyDate?: string | null } | null;
};

function isWorker(role?: string | null) {
  const r = String(role || '').toUpperCase();
  return ['DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY'].includes(r);
}

function prettyStatus(s?: string | null) {
  return String(s || '-').replace(/_/g,' ');
}

function formatDate(s?: string | null) {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s).slice(0,10);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const WorkerDashboardScreen: React.FC = () => {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id || user?.userId || null;
  const router = useRouter();
  const [filterMode, setFilterMode] = React.useState<'ALL'|'NEED_ACCEPT'|'IN_PROGRESS'|'READY_SUBMIT'|'AWAITING_VALIDATION'>('ALL');

  const { data, error, isLoading, isRefetching, refetch } = useQuery<Task[]>({
    queryKey: ['tasks','active'],
    queryFn: () => api.tasks.list(token || '') as Promise<Task[]>,
    enabled: !!token,
    refetchInterval: 6000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  const isInventoryRole = String(user?.jobRole || user?.job_role || '').toUpperCase() === 'INVENTORY';
  const { data: invReqData } = useQuery<any[]>({
    queryKey: ['inventory','requests','count'],
    queryFn: () => api.inventory.requests(token || ''),
    enabled: !!token && isInventoryRole,
    refetchInterval: isInventoryRole ? 6000 : false,
  });
  const invRequestCount = Array.isArray(invReqData) ? invReqData.length : 0;

  // Ensure numbers refresh as soon as user returns to this screen
  useFocusEffect(React.useCallback(() => {
    if (token) refetch();
  }, [token, refetch]));

  const tasks = Array.isArray(data) ? data : [];
  const mine = tasks.filter(t => String(t.assignedToId || '') === String(userId || ''));

  // Group by orderId
  const groups = Object.values(mine.reduce((acc: Record<string, { orderId: number; orderCode: string; orderStatus: string; tasks: Task[] }>, t) => {
    const key = String(t.orderId);
    const code = t.order?.code || `(Order #${t.orderId})`;
    const os = String(t.order?.status || '-');
    if (!acc[key]) acc[key] = { orderId: t.orderId, orderCode: code, orderStatus: os, tasks: [] };
    acc[key].tasks.push(t);
    return acc;
  }, {} as any));

  // Mutations
  const mAcceptMine = useMutation({
    mutationFn: async (orderId: number) => api.tasks.acceptMine(token || '', orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
  });
  const mStart = useMutation({
    mutationFn: async (taskId: number) => api.tasks.start(token || '', taskId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
  });
  const mCheck = useMutation({
    mutationFn: async (p: { id: number; value: boolean }) => p.value ? api.tasks.check(token || '', p.id) : api.tasks.uncheck(token || '', p.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
  });
  const mRequestDoneMine = useMutation({
    mutationFn: async (orderId: number) => api.tasks.requestDoneMine(token || '', orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
  });

  // Metrics (order-level counts) — compute from per-order groups to match lists (for non-inventory roles)
  const countAssigned = groups.filter(g => g.tasks.some(t => t.status === 'ASSIGNED')).length;
  const countInProgress = groups.filter(g => g.tasks.some(t => t.status === 'IN_PROGRESS')).length;
  const countAwaiting = groups.filter(g => g.tasks.some(t => t.status === 'AWAITING_VALIDATION')).length;

  const canRequestDone = (group: { tasks: Task[] }) => {
    const hasAssigned = group.tasks.some(t => t.status === 'ASSIGNED');
    if (hasAssigned) return false;
    const inprog = group.tasks.filter(t => t.status === 'IN_PROGRESS');
    if (inprog.length === 0) return false;
    return inprog.every(t => !!t.isChecked);
  };
  const countReadySubmit = (() => {
    const orderMap = new Map<number, { tasks: Task[] }>();
    mine.forEach(t => {
      if (!orderMap.has(t.orderId)) orderMap.set(t.orderId, { tasks: [] });
      orderMap.get(t.orderId)!.tasks.push(t);
    });
    let c = 0;
    for (const [_, v] of orderMap) {
      const fakeGroup: any = { tasks: v.tasks };
      if (canRequestDone(fakeGroup)) c++;
    }
    return c;
  })();

  

  // Recent activities (simple heuristic: last 5 of my tasks by id desc)
  const recent = mine.slice().sort((a,b) => b.id - a.id).slice(0,5);

  // derive displayed groups per filter mode
  const displayedGroups = groups.filter(g => {
    if (filterMode === 'ALL') return true;
    if (filterMode === 'NEED_ACCEPT') return g.tasks.some(t => t.status === 'ASSIGNED');
    if (filterMode === 'IN_PROGRESS') return g.tasks.some(t => t.status === 'IN_PROGRESS');
    if (filterMode === 'READY_SUBMIT') return canRequestDone(g);
    if (filterMode === 'AWAITING_VALIDATION') return g.tasks.some(t => t.status === 'AWAITING_VALIDATION');
    return true;
  });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[COLORS.gold, COLORS.brown, COLORS.dark, COLORS.gold] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        data={isInventoryRole ? [] : displayedGroups.sort((a,b) => (b.orderId - a.orderId))}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={(
          <View>
            {/* Hero */}
            <View style={s.heroSection}>
              <LinearGradient colors={[COLORS.gold, COLORS.brown, COLORS.dark] as any} start={{x:0,y:0}} end={{x:1,y:1}} style={s.heroGradient}>
                <View style={s.heroContent}>
                  <Text style={s.heroGreeting}>Halo,</Text>
                  <Text style={s.heroName}>{user?.fullName || 'Pekerja'}</Text>
                  <View style={s.rolePill}><Ionicons name="shield-checkmark" size={12} color={COLORS.dark} /><Text style={s.rolePillText}>{String(user?.jobRole || user?.job_role || 'WORKER').toString().toUpperCase()}</Text></View>
                  <Text style={s.heroSubtitle}>Fokus hari ini: selesaikan tugas Anda dengan rapi</Text>
                </View>
                <View style={s.heroDecoration}>
                  <MaterialCommunityIcons name="diamond-stone" size={80} color={COLORS.white} style={{ opacity: 0.25 }} />
                </View>
              </LinearGradient>
            </View>

            {/* Metrics grid (uniform like Sales) */}
            <View style={s.statsSection}>
              <View style={s.statGrid}>
                {/* Inventory-specific shortcuts */}
                {isInventoryRole ? (
                  <>
                    <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/inventory/requests')}>
                      <View style={s.tileTopRow}>
                        <View style={s.iconBadge}><Ionicons name="download" size={18} color={COLORS.gold} /></View>
                        <Text style={s.tileLabel}>Request Inventory</Text>
                      </View>
                      <Text style={s.tileValue}>{invRequestCount}</Text>
                      <View style={s.tileBar}><View style={[s.tileBarFill, { width: `100%` }]} /></View>
                      <Text style={s.tileMeta}>Tap untuk proses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/inventory')}>
                      <View style={s.tileTopRow}>
                        <View style={s.iconBadge}><Ionicons name="cube-outline" size={18} color={COLORS.gold} /></View>
                        <Text style={s.tileLabel}>Stok Inventory</Text>
                      </View>
                      <Text style={s.tileValue}>•</Text>
                      <View style={s.tileBar}><View style={[s.tileBarFill, { width: `100%` }]} /></View>
                      <Text style={s.tileMeta}>Cari & filter</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/worker/assigned')}>
                      <View style={s.tileTopRow}>
                        <View style={s.iconBadge}><MaterialCommunityIcons name="account-tie" size={18} color={COLORS.gold} /></View>
                        <Text style={s.tileLabel}>Ditugaskan</Text>
                      </View>
                      <Text style={s.tileValue}>{countAssigned}</Text>
                      <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((countAssigned/10)*100,100)}%` }]} /></View>
                      <Text style={s.tileMeta}>Tap untuk lihat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/worker/in-progress')}>
                      <View style={s.tileTopRow}>
                        <View style={s.iconBadge}><Ionicons name="construct-outline" size={18} color={COLORS.gold} /></View>
                        <Text style={s.tileLabel}>Dalam Proses</Text>
                      </View>
                      <Text style={s.tileValue}>{countInProgress}</Text>
                      <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((countInProgress/10)*100,100)}%` }]} /></View>
                      <Text style={s.tileMeta}>Tap untuk lihat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.statTile} activeOpacity={0.85} onPress={() => router.push('/worker/awaiting-validation')}>
                      <View style={s.tileTopRow}>
                        <View style={s.iconBadge}><Ionicons name="checkmark-done-outline" size={18} color={COLORS.gold} /></View>
                        <Text style={s.tileLabel}>Verifikasi</Text>
                      </View>
                      <Text style={s.tileValue}>{countAwaiting}</Text>
                      <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((countAwaiting/10)*100,100)}%` }]} /></View>
                      <Text style={s.tileMeta}>Tap untuk lihat</Text>
                    </TouchableOpacity>
                    <View style={[s.statTile, { opacity: 0.9 }]}>
                      <View style={s.tileTopRow}>
                        <View style={s.iconBadge}><Ionicons name="checkmark-done-circle" size={18} color={COLORS.gold} /></View>
                        <Text style={s.tileLabel}>Siap Ajukan</Text>
                      </View>
                      <Text style={s.tileValue}>{countReadySubmit}</Text>
                      <View style={s.tileBar}><View style={[s.tileBarFill, { width: `${Math.min((countReadySubmit/10)*100,100)}%` }]} /></View>
                      <Text style={s.tileMeta}>Semua subtask tercentang</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Quick Actions (worker-focused) */}
            <View style={s.actionsSection}>
              <Text style={s.sectionTitle}>Aksi Cepat</Text>
              <View style={s.actionsGridTiles}>
                {isInventoryRole && (
                  <>
                    <TouchableOpacity style={s.actionTile} onPress={() => router.push('/inventory/requests')}>
                      <View style={s.actionIconBg}><Ionicons name="download" size={22} color={COLORS.yellow} /></View>
                      <Text style={s.actionTileText}>Proses Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionTile} onPress={() => router.push('/inventory')}>
                      <View style={s.actionIconBg}><Ionicons name="cube-outline" size={22} color={COLORS.yellow} /></View>
                      <Text style={s.actionTileText}>Lihat Stok</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  style={[s.actionTile, (countAssigned===0) && s.disabledTile]}
                  disabled={countAssigned===0 || mAcceptMine.isPending}
                  onPress={() => {
                    // Accept All for first order that has ASSIGNED
                    const target = groups.find(g => g.tasks.some(t => t.status==='ASSIGNED'));
                    if (!target) { Alert.alert('Tidak ada','Tidak ada tugas yang perlu diterima.'); return; }
                    mAcceptMine.mutate(target.orderId);
                  }}
                >
                  <View style={s.actionIconBg}><Ionicons name="play" size={22} color={COLORS.yellow} /></View>
                  <Text style={s.actionTileText}>Terima Semua</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.actionTile, (countAssigned===0) && s.disabledTile]}
                  disabled={countAssigned===0 || mStart.isPending}
                  onPress={() => {
                    // Start Next: pick first ASSIGNED task id asc
                    const next = mine.filter(t => t.status==='ASSIGNED').sort((a,b)=>a.id-b.id)[0];
                    if (!next) { Alert.alert('Tidak ada','Tidak ada tugas ASSIGNED untuk dimulai.'); return; }
                    mStart.mutate(next.id);
                  }}
                >
                  <View style={s.actionIconBg}><Ionicons name="flash" size={22} color={COLORS.yellow} /></View>
                  <Text style={s.actionTileText}>Mulai Berikutnya</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.actionTile, (countReadySubmit===0) && s.disabledTile]}
                  disabled={countReadySubmit===0 || mRequestDoneMine.isPending}
                  onPress={() => {
                    // Request Done for first ready order
                    const ready = groups.find(g => canRequestDone(g));
                    if (!ready) { Alert.alert('Belum siap','Belum ada order yang siap diajukan.'); return; }
                    mRequestDoneMine.mutate(ready.orderId);
                  }}
                >
                  <View style={s.actionIconBg}><Ionicons name="checkmark-done-circle" size={22} color={COLORS.yellow} /></View>
                  <Text style={s.actionTileText}>Ajukan Selesai</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.actionTile}
                  onPress={() => router.push('/my-orders')}
                >
                  <View style={s.actionIconBg}><Ionicons name="qr-code" size={22} color={COLORS.yellow} /></View>
                  <Text style={s.actionTileText}>Scan Order</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent - hidden for inventory role to keep focus on inventory */}
            {!isInventoryRole && (
              <View style={{ marginBottom: 16 }}>
                <View style={s.sectionHeader}><Ionicons name="flash" size={20} color={COLORS.gold} /><Text style={s.sectionTitle}>Aktivitas Terbaru</Text></View>
                {recent.length === 0 ? (
                  <Text style={s.empty}>Belum ada aktivitas.</Text>
                ) : (
                  <View style={{ paddingHorizontal: 4 }}>
                    {recent.map((t, idx) => (
                      <View key={`${t.id}-${idx}`} style={s.activityItem}>
                        <View style={s.activityDot} />
                        <View style={{ flex:1 }}>
                          <Text style={s.activityText} numberOfLines={1}>{t.stage || 'Sub-tugas'}  b7 {t.order?.code || `#${t.orderId}`}</Text>
                          <Text style={s.activityMeta}>{prettyStatus(t.status)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {error ? <Text style={s.errorText}>{String((error as any).message)}</Text> : null}
          </View>
        )}
        ListEmptyComponent={!isLoading && !isInventoryRole ? <Text style={s.empty}>Tidak ada tugas untuk Anda.</Text> : null}
        renderItem={({ item: g }) => {
          const disabledAccept = mAcceptMine.isPending;
          const disabledReqDone = !canRequestDone(g) || mRequestDoneMine.isPending;
          const inprog = g.tasks.filter(t => t.status === 'IN_PROGRESS');
          const checked = inprog.filter(t => !!t.isChecked).length;
          const total = inprog.length;
          const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
          const anyAssigned = g.tasks.some(t => t.status === 'ASSIGNED');
          const promised = g.tasks.find(t => t.order?.promisedReadyDate)?.order?.promisedReadyDate || null;
          const refImgs = ((g.tasks.find(t => Array.isArray((t as any)?.order?.referensiGambarUrls)) as any)?.order?.referensiGambarUrls) as string[] | undefined;
          const toDisplayUrl = (p?: string) => { if (!p) return undefined as any; if (/^https?:\/\//i.test(p)) return p; const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, ''); return p.startsWith('/uploads') ? base + p : p; };
          const thumbSrc = Array.isArray(refImgs) && refImgs.length ? toDisplayUrl(refImgs[refImgs.length - 1] || refImgs[0]) : undefined;
          // For non-inventory workers we still show order checklist & Ajukan flow
          return (
            <View style={s.orderCard}>
              {/* Order header */}
              <View style={[s.orderHeader, { alignItems: 'center' }]}>
                {thumbSrc ? (
                  <View style={{ flexDirection:'row', alignItems:'center', flexShrink:0 }}>
                    <View style={s.thumbWrap}>
                      <View style={s.thumbBorder} />
                      <View style={s.thumbBg} />
                      <View style={s.thumbImgBox}>
                        <TouchableOpacity activeOpacity={0.85}>
                          <Image source={{ uri: thumbSrc }} style={s.thumbImg} resizeMode="cover" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : null}
                <View style={{ flex:1, minWidth:0, marginLeft: thumbSrc ? 10 : 0 }}>
                  <Text style={s.orderCode} numberOfLines={1}>{g.orderCode}</Text>
                  <View style={[s.badge, { alignSelf:'flex-start', marginTop: 4 }]}><Text style={s.badgeText}>{prettyStatus(g.orderStatus)}</Text></View>
                </View>
              </View>
              {/* Inline thumb when available */}
              {null}
              {/* Order meta */}
              <View style={s.orderMetaRow}>
                <View style={s.metaBox}>
                  <Ionicons name='calendar' size={12} color={COLORS.gold} style={{ marginRight: 6 }} />
                  <Text style={s.metaLabel}>Batas Selesai</Text>
                  <Text style={s.metaValue}>{formatDate(promised)}</Text>
                </View>
                <View style={s.vLine} />
                <View style={s.metaBox}>
                  <Ionicons name='construct-outline' size={12} color={COLORS.gold} style={{ marginRight: 6 }} />
                  <Text style={s.metaLabel}>Progress</Text>
                  <Text style={s.metaValue}>{pct}%</Text>
                </View>
              </View>
              <View style={s.progressBar}><View style={[s.progressFill, { width: `${pct}%` }]} /></View>

              {/* Tasks list */}
              {g.tasks.sort((a,b) => (a.id - b.id)).map(t => (
                <View key={t.id} style={s.taskRow}>
                  <View style={{ flex:1 }}>
                    <Text style={s.taskStage} numberOfLines={1}>{t.stage || 'Sub-tugas'}</Text>
                    <Text style={s.taskMeta} numberOfLines={1}>{prettyStatus(t.status)}</Text>
                  </View>
                  {/* Actions per task */}
                  {t.status === 'ASSIGNED' ? (
                    <TouchableOpacity
                      style={[s.btn, s.btnGhost, { marginLeft: 8 }]}
                      disabled={mStart.isPending}
                      onPress={() => mStart.mutate(t.id)}
                    >
                      {mStart.isPending ? <ActivityIndicator color={COLORS.gold} size="small" /> : <Text style={s.btnText}>Mulai</Text>}
                    </TouchableOpacity>
                  ) : t.status === 'IN_PROGRESS' ? (
                    <TouchableOpacity
                      style={[s.checkBadge, t.isChecked ? s.checked : undefined]}
                      disabled={mCheck.isPending}
                      onPress={() => mCheck.mutate({ id: t.id, value: !t.isChecked })}
                    >
                      <Ionicons name={t.isChecked ? 'checkbox' : 'square-outline'} size={18} color={t.isChecked ? COLORS.success : COLORS.gold} />
                      <Text style={[s.checkText, { color: t.isChecked ? COLORS.success : COLORS.yellow }]}>{t.isChecked ? 'Checked' : 'Checklist'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 10 }} />
                  )}
                </View>
              ))}
              {/* Footer actions per order */}
              <View style={s.cardFooter}>
                {anyAssigned && (
                  <TouchableOpacity
                    style={[s.btn, s.btnPrimary]}
                    disabled={disabledAccept}
                    onPress={() => mAcceptMine.mutate(g.orderId)}
                  >
                    {mAcceptMine.isPending ? <ActivityIndicator color="#1b1b1b" size="small" /> : <Text style={s.btnTextDark}>Terima</Text>}
                  </TouchableOpacity>
                )}
                <View style={{ flex:1 }} />
                <TouchableOpacity
                  style={[s.btn, disabledReqDone ? s.btnDisabled : s.btnSuccess]}
                  disabled={disabledReqDone}
                  onPress={() => mRequestDoneMine.mutate(g.orderId)}
                >
                  {mRequestDoneMine.isPending ? <ActivityIndicator color="#1b1b1b" size="small" /> : <Text style={s.btnTextDark}>Ajukan Selesai</Text>}
                </TouchableOpacity>
              </View>
              {!canRequestDone(g) && (
                <Text style={s.hint}>Syarat: tidak ada task ASSIGNED, semua task IN_PROGRESS sudah dichecklist.</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor: COLORS.dark },
  heroSection: { marginBottom: 16 },
  heroGradient: { borderRadius: 20, padding: 20, minHeight: 120 },
  heroContent: { flex: 1, justifyContent: 'center' },
  heroGreeting: { color: '#fff', fontSize: 14, fontWeight: '600', opacity: 0.9 },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { color: '#fff', fontSize: 13, opacity: 0.8, marginTop: 6 },
  heroDecoration: { position: 'absolute', right: 16, top: 8 },
  rolePill: { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', backgroundColor: COLORS.yellow, paddingHorizontal:10, paddingVertical:4, borderRadius: 999, marginTop: 8 },
  rolePillText: { color: COLORS.dark, fontWeight:'900', fontSize: 10, letterSpacing: 1 },
  metricsRow: { flexDirection:'row', gap: 10, marginBottom: 16 },
  metricCard: { flex:1, backgroundColor: COLORS.card, borderRadius: 12, padding: 12, borderWidth:1, borderColor: COLORS.border },
  metricActive: { borderColor: COLORS.gold, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  metricHeader: { flexDirection:'row', alignItems:'center', gap: 6, marginBottom: 8 },
  metricLabel: { color: COLORS.yellow, fontWeight:'700', fontSize: 12 },
  metricValue: { color: COLORS.gold, fontSize: 24, fontWeight:'800' },
  // New stats grid (align with Sales tiles)
  statsSection: { marginBottom: 16 },
  statGrid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', paddingHorizontal: 4 },
  statTile: { width: '48%', backgroundColor: COLORS.card, borderRadius: 18, padding: 14, marginBottom: 12, borderWidth:1, borderColor: COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  tileTopRow: { flexDirection:'row', alignItems:'center', marginBottom: 8, gap:8 },
  iconBadge: { backgroundColor: '#2b2522', padding:8, borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
  tileLabel: { color: COLORS.yellow, fontSize: 12, fontWeight:'700', letterSpacing:0.3 },
  tileValue: { color: COLORS.gold, fontSize: 28, fontWeight:'800', marginBottom: 6 },
  tileBar: { height: 5, backgroundColor:'rgba(255,215,0,0.18)', borderRadius: 999, overflow:'hidden', marginBottom:6 },
  tileBarFill: { height:'100%', backgroundColor: COLORS.gold },
  tileMeta: { color: '#bfae6a', fontSize: 11, fontWeight:'600' },
  errorText: { color: COLORS.danger, marginBottom: 8 },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  actionsSection: { marginBottom: 16 },
  actionsGridTiles: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', paddingHorizontal: 4 },
  actionTile: { width: '48%', alignItems:'center', marginBottom: 12 },
  actionIconBg: { backgroundColor: COLORS.brown, borderRadius: 16, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  actionTileText: { color: COLORS.gold, fontSize: 12, fontWeight:'700', textAlign:'center' },
  disabledTile: { opacity: 0.5 },
  sectionHeader: { flexDirection:'row', alignItems:'center', gap: 8, marginBottom: 8 },
  sectionTitle: { color: COLORS.gold, fontSize: 18, fontWeight:'800' },
  activityItem: { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 12, borderWidth:1, borderColor: COLORS.border, marginBottom: 8 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold, marginRight: 10 },
  activityText: { color: COLORS.yellow, fontWeight:'700' },
  activityMeta: { color: '#bfae6a', fontSize: 12, marginTop: 2 },
  orderCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  orderHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 8 },
  thumbWrap: { width: 64, height: 64, position:'relative' },
  thumbBorder: { ...StyleSheet.absoluteFillObject as any, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  thumbBg: { ...StyleSheet.absoluteFillObject as any, borderRadius: 12, backgroundColor:'#23201c' },
  thumbImgBox: { overflow: 'hidden', borderRadius: 12 },
  thumbImg: { width: 64, height: 64, backgroundColor:'#23201c' },
  orderCode: { color: COLORS.gold, fontSize: 14, fontWeight:'800', flex: 1, marginRight: 8 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, borderWidth:1, borderColor: COLORS.border, backgroundColor:'#2b2522' },
  badgeText: { color: COLORS.yellow, fontWeight:'700', fontSize: 11 },
  orderMetaRow: { flexDirection:'row', alignItems:'stretch', gap: 10, marginTop: 4, marginBottom: 6 },
  metaBox: { flex:1, minWidth: 0, backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, paddingVertical:6, paddingHorizontal:8, flexDirection:'row', alignItems:'center', gap:6 },
  metaLabel: { color: COLORS.gold, fontSize: 11, fontWeight:'700' },
  metaValue: { color: COLORS.yellow, fontSize: 12, fontWeight:'700', marginLeft: 'auto' },
  vLine: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,215,0,0.16)' },
  progressBar: { height: 4, backgroundColor: 'rgba(255,215,0,0.16)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: COLORS.gold },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700' },
  taskMeta: { color: '#bfae6a', fontSize: 12, marginTop: 2 },
  checkBadge: { flexDirection:'row', alignItems:'center', gap: 6, paddingVertical:6, paddingHorizontal:10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(43,37,34,0.9)' },
  checked: { borderColor: COLORS.success, backgroundColor: 'rgba(46,125,50,0.12)' },
  checkText: { fontWeight:'800' },
  cardFooter: { flexDirection:'row', alignItems:'center', justifyContent:'flex-end', gap: 8, marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnGhost: { borderWidth:1, borderColor: COLORS.border },
  btnPrimary: { backgroundColor: COLORS.gold },
  btnSuccess: { backgroundColor: '#9ccc65' },
  btnDisabled: { backgroundColor: '#6b6b6b' },
  btnText: { color: COLORS.yellow, fontWeight:'800' },
  btnTextDark: { color: '#1b1b1b', fontWeight:'800' },
  hint: { color: '#bfae6a', fontSize: 11, marginTop: 4 },
});
