import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@lib/context/AuthContext';
import { api, API_URL } from '@lib/api/client';

const COLORS = { gold:'#FFD700', yellow:'#ffe082', dark:'#181512', card:'#23201c', border:'#4e3f2c', success:'#2e7d32' };

type Task = {
  id: number;
  orderId: number;
  stage?: string | null;
  status?: string | null;
  isChecked?: boolean;
  assignedToId?: string | null;
  order?: { id: number; code?: string | null; promisedReadyDate?: string | null } | null;
};

function formatDate(s?: string | null) {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s).slice(0,10);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function dday(promised?: string | null) {
  if (!promised) return '';
  const p = new Date(promised);
  if (isNaN(p.getTime())) return '';
  const today = new Date();
  const dayMs = 24*60*60*1000;
  const diff = Math.floor((p.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / dayMs);
  if (diff === 0) return 'D-day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function InProgressScreen() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id || user?.userId || null;
  const router = useRouter();

  const { data, isLoading, isRefetching, refetch } = useQuery<Task[]>({
    queryKey: ['tasks','active'],
    queryFn: () => api.tasks.list(token || '') as Promise<Task[]>,
    enabled: !!token,
    refetchInterval: 6000,
    refetchOnWindowFocus: true,
  });

  const tasks = Array.isArray(data) ? data : [];
  const mine = tasks.filter(t => String(t.assignedToId || '') === String(userId || ''));
  const groupsRaw = Object.values(mine.reduce((acc: Record<string, { orderId: number; code: string; promised?: string | null; tasks: Task[] }>, t) => {
    if (t.status !== 'IN_PROGRESS') return acc;
    const key = String(t.orderId);
    const code = t.order?.code || `(Order #${t.orderId})`;
    const promised = t.order?.promisedReadyDate || null;
    if (!acc[key]) acc[key] = { orderId: t.orderId, code, promised, tasks: [] };
    acc[key].tasks.push(t);
    return acc;
  }, {} as any));

  // Filters & sorting for better scan-ability when many orders
  type Filter = 'ALL' | 'READY' | 'NEEDS';
  const [filter, setFilter] = React.useState<Filter>('ALL');
  const [sortAsc, setSortAsc] = React.useState(true);
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const toggle = (orderId: number) => setExpanded(p => ({ ...p, [orderId]: !p[orderId] }));

  const canRequestDone = (g: { tasks: Task[] }) => {
    const inprog = g.tasks.filter(t => t.status === 'IN_PROGRESS');
    if (inprog.length === 0) return false;
    return inprog.every(t => !!t.isChecked);
  };

  const mCheck = useMutation({
    mutationFn: (p: { id: number; value: boolean }) => p.value ? api.tasks.check(token || '', p.id) : api.tasks.uncheck(token || '', p.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
    onError: (e: any) => Alert.alert('Gagal', String(e?.message || 'Gagal update checklist')),
  });
  const mRequestDone = useMutation({
    mutationFn: (orderId: number) => api.tasks.requestDoneMine(token || '', orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks','active'] }); },
    onError: (e: any) => Alert.alert('Gagal', String(e?.message || 'Gagal mengajukan verifikasi')),
  });

  const groups = React.useMemo(() => {
    const base = [...groupsRaw];
    const filtered = base.filter(g => {
      const ready = canRequestDone(g as any);
      if (filter === 'READY') return ready;
      if (filter === 'NEEDS') return !ready;
      return true;
    });
    filtered.sort((a,b) => {
      const pa = a.promised ? new Date(a.promised).getTime() : 0;
      const pb = b.promised ? new Date(b.promised).getTime() : 0;
      return sortAsc ? pa - pb : pb - pa;
    });
    return filtered;
  }, [groupsRaw, filter, sortAsc]);

  return (
    <View style={s.container}>
      <FlatList
        data={groups}
        keyExtractor={g => String(g.orderId)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={s.headerWrap}>
            <Text style={s.title}>Sedang Dikerjakan</Text>
            <View style={s.controlRow}>
              <View style={s.segment}>
                <TouchableOpacity style={[s.segBtn, filter==='ALL' && s.segBtnActive]} onPress={()=>setFilter('ALL')}>
                  <Text style={[s.segTxt, filter==='ALL' && s.segTxtActive]}>Semua</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.segBtn, filter==='READY' && s.segBtnActive]} onPress={()=>setFilter('READY')}>
                  <Text style={[s.segTxt, filter==='READY' && s.segTxtActive]}>Siap Ajukan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.segBtn, filter==='NEEDS' && s.segBtnActive]} onPress={()=>setFilter('NEEDS')}>
                  <Text style={[s.segTxt, filter==='NEEDS' && s.segTxtActive]}>Butuh Checklist</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <TouchableOpacity onPress={()=>setSortAsc(v=>!v)} style={s.sortBtn}>
                  <Ionicons name={sortAsc ? 'swap-vertical-outline' : 'swap-vertical'} size={16} color={COLORS.gold} />
                  <Text style={s.sortTxt}>{sortAsc ? 'Terdekat' : 'Terjauh'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => refetch()} style={s.refreshBtn}>
                  <Ionicons name="refresh" size={14} color={COLORS.gold} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={!isLoading ? <Text style={s.empty}>Tidak ada order dalam proses.</Text> : null}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        initialNumToRender={10}
        windowSize={8}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        renderItem={({ item: g }) => {
          const inprog = g.tasks.filter(t => t.status==='IN_PROGRESS');
          const checked = inprog.filter(t => !!t.isChecked).length;
          const total = inprog.length;
          const pct = total > 0 ? Math.round((checked/total) * 100) : 0;
          const ready = canRequestDone(g);
          const isOpen = !!expanded[g.orderId];
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(g.orderId), src:'worker', fromWorker:'1' } })}
              onLongPress={() => toggle(g.orderId)}
              style={s.card}
            >
              <View style={s.cardHeader}>
                <View style={{ flex:1 }}>
                  <View style={s.headerLeft}>
                    <OrderThumb orderId={g.orderId} />
                    <Text style={s.code} numberOfLines={1}>{g.code}</Text>
                  </View>
                  <View style={s.metaRow}>
                    <View style={s.pillDate}>
                      <Ionicons name='calendar' size={12} color={COLORS.gold} />
                      <Text style={s.metaText}>{formatDate(g.promised)}</Text>
                    </View>
                    {!!g.promised && <Text style={s.dday}>{dday(g.promised)}</Text>}
                  </View>
                </View>
                <View style={s.rightCol}>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.gold} style={{ marginBottom:6, opacity:0.9 }} />
                  <View style={s.pctPill}><Text style={s.pctText}>{pct}%</Text></View>
                  {ready && (
                    <TouchableOpacity style={s.smallPrimary} onPress={() => mRequestDone.mutate(g.orderId)} disabled={mRequestDone.isPending}>
                      {mRequestDone.isPending ? <ActivityIndicator color="#1b1b1b" size="small" /> : <Text style={s.smallPrimaryText}>Ajukan</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={s.progressBar}><View style={[s.progressFill,{ width: `${pct}%` }]} /></View>
              {g.tasks.sort((a,b)=>a.id-b.id).map(t => (
                <View key={t.id} style={s.taskRow}>
                  <Text style={s.taskStage} numberOfLines={1}>{t.stage || 'Sub-tugas'}</Text>
                  <TouchableOpacity style={[s.checkBtn, t.isChecked && s.checked]} disabled={mCheck.isPending}
                    onPress={() => mCheck.mutate({ id: t.id, value: !t.isChecked })}
                  >
                    <Ionicons name={t.isChecked ? 'checkbox' : 'square-outline'} size={16} color={t.isChecked ? COLORS.success : COLORS.gold} />
                  </TouchableOpacity>
                </View>
              ))}
              {!ready && (
                <View style={s.hintRow}><Text style={s.hint}>Checklist {checked}/{total}</Text></View>
              )}
              {isOpen && <OrderDetailInline orderId={g.orderId} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const OrderDetailInline: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { token } = useAuth();
  const { data, isLoading } = useQuery<any>({
    queryKey: ['order', orderId],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
    staleTime: 0,
  });
  const det: any = data || {};
  if (isLoading) return <View style={s.detailBox}><ActivityIndicator color={COLORS.gold} /></View>;
  return (
    <View style={s.detailBox}>
      <View style={s.detailRow}><Text style={s.detailKey}>Customer</Text><Text style={s.detailVal} numberOfLines={1}>{det.customerName || '-'}</Text></View>
      <View style={s.detailRow}><Text style={s.detailKey}>Jenis</Text><Text style={s.detailVal} numberOfLines={1}>{det.jenisBarang || det.jenis || '-'}</Text></View>
      {det.ringSize ? <View style={s.detailRow}><Text style={s.detailKey}>Ukuran Cincin</Text><Text style={s.detailVal}>{det.ringSize}</Text></View> : null}
      <View style={s.detailRow}><Text style={s.detailKey}>Perkiraan Siap</Text><Text style={s.detailVal}>{det.promisedReadyDate ? det.promisedReadyDate.slice(0,10) : '-'}</Text></View>
      {det.catatan ? <View style={[s.detailRow,{alignItems:'flex-start'}]}><Text style={s.detailKey}>Catatan</Text><Text style={[s.detailVal,{flex:1}]} numberOfLines={3}>{det.catatan}</Text></View> : null}
    </View>
  );
};

// Thumbnail for order card; fetches order to get first reference image
const OrderThumb: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { token } = useAuth();
  const { data } = useQuery<any>({
    queryKey: ['order', orderId, 'thumb'],
    queryFn: () => api.orders.get(token || '', orderId),
    enabled: !!token && !!orderId,
    staleTime: 60_000,
  });
  const src = Array.isArray(data?.referensiGambarUrls) && data.referensiGambarUrls[0] ? data.referensiGambarUrls[0] : null;
  const toDisplayUrl = (p?: string) => {
    if (!p) return undefined;
    if (/^https?:\/\//i.test(p)) return p;
    const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return p.startsWith('/uploads') ? base + p : p;
  };
  const uri = toDisplayUrl(src);
  return (
    <View style={s.thumbWrap}>
      {uri ? (
        <Image source={{ uri }} style={s.thumbImg} />
      ) : (
        <View style={s.thumbPlaceholder}>
          <Ionicons name="image-outline" size={18} color={COLORS.gold} />
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.dark, padding: 16 },
  headerWrap: { marginBottom: 8 },
  title: { color: COLORS.gold, fontWeight:'800', fontSize: 18, marginBottom: 8 },
  controlRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  segment: { flexDirection:'row', backgroundColor:'#1d1a16', borderRadius:10, borderWidth:1, borderColor:COLORS.border, overflow:'hidden' },
  segBtn: { paddingHorizontal:10, paddingVertical:6 },
  segBtnActive: { backgroundColor:'#2b2522' },
  segTxt: { color:'#bfae6a', fontWeight:'700', fontSize:12 },
  segTxtActive: { color:COLORS.gold },
  sortBtn: { flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:COLORS.border, paddingHorizontal:8, paddingVertical:6, borderRadius:8, marginRight:8, backgroundColor:'#201c18' },
  sortTxt: { color:COLORS.gold, fontWeight:'700', marginLeft:6, fontSize:12 },
  refreshBtn: { borderWidth:1, borderColor:COLORS.border, paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:'#201c18' },
  empty: { color: COLORS.yellow, textAlign:'center', marginTop: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 10, borderWidth:1, borderColor: COLORS.border },
  cardHeader: { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 6 },
  code: { color: COLORS.gold, fontWeight:'800', fontSize: 14, marginBottom: 2 },
  metaRow: { flexDirection:'row', alignItems:'center', gap: 8 },
  headerLeft: { flexDirection:'row', alignItems:'center', gap:8 },
  thumbWrap: { width: 40, height: 40, borderRadius: 8, overflow: 'hidden', borderWidth:1, borderColor:COLORS.border, backgroundColor:'#201c18' },
  thumbImg: { width: 40, height: 40, resizeMode:'cover' },
  thumbPlaceholder: { flex:1, justifyContent:'center', alignItems:'center' },
  pillDate: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor:COLORS.border, paddingHorizontal:8, paddingVertical:2, borderRadius:8, backgroundColor:'#201c18' },
  metaText: { color: COLORS.yellow, fontWeight:'700', fontSize:12 },
  dday: { color:'#bfae6a', fontWeight:'800', fontSize:12 },
  rightCol: { alignItems:'flex-end' },
  pctPill: { paddingHorizontal:8, paddingVertical:2, borderRadius:8, backgroundColor:'rgba(255,215,0,0.12)', borderWidth:1, borderColor:'rgba(255,215,0,0.28)', marginBottom:6 },
  pctText: { color:COLORS.gold, fontWeight:'800', fontSize:12 },
  smallPrimary: { backgroundColor: COLORS.gold, paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  smallPrimaryText: { color:'#1b1b1b', fontWeight:'800', fontSize:12 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,215,0,0.16)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: COLORS.gold },
  detailBox: { backgroundColor:'rgba(35,32,28,0.85)', borderRadius:10, borderWidth:0.8, borderColor:COLORS.border, padding:8, marginTop:6 },
  detailRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  detailKey: { color: COLORS.gold, fontSize: 11, fontWeight:'700' },
  detailVal: { color: COLORS.yellow, fontSize: 12, fontWeight:'700', marginLeft: 8, flexShrink: 1 },
  taskRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,215,0,0.12)' },
  taskStage: { color: COLORS.yellow, fontWeight:'700', flex:1, marginRight:8, fontSize:12 },
  checkBtn: { flexDirection:'row', alignItems:'center', gap: 6, paddingVertical:4, paddingHorizontal:8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(43,37,34,0.9)' },
  checked: { borderColor: COLORS.success, backgroundColor: 'rgba(46,125,50,0.12)' },
  checkTxt: { fontWeight:'800' },
  hintRow: { marginTop: 4, alignItems:'flex-end' },
  hint: { color: '#bfae6a', fontSize: 11 },
});
