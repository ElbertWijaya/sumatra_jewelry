import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert, Animated, Easing, Image } from 'react-native';
import { API_URL } from '@lib/api/client';
import { useRouter } from 'expo-router';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { OrderActionsModal } from '@features/orders/screens/OrderActionsModal';

type Task = { id: number; stage?: string | null; status: 'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'AWAITING_VALIDATION'|'DONE'|'CANCELLED'; notes?: string | null; createdAt: string; orderId: number; order?: any; assignedTo?: { id: string; fullName: string } | null; };
type Group = { orderId: number; order?: any; tasks: Task[] };

const progressFor = (g: Group) => { const rel = g.tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'); const total = rel.length; const checked = rel.filter(t => (t as any).isChecked).length; return { checked, total }; };

const SquareActionButton = ({ title, disabled, muted, onPress }: { title: string; disabled?: boolean; muted?: boolean; onPress: () => void; }) => { const radius = useRef(new Animated.Value(8)).current; const scale = useRef(new Animated.Value(1)).current; useEffect(() => { if (disabled || muted) return; const loop = Animated.loop(Animated.sequence([Animated.timing(radius, { toValue: 10, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: false }), Animated.timing(radius, { toValue: 8, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: false }),])); loop.start(); return () => { loop.stop(); radius.stopAnimation(); }; }, [disabled, muted, radius]); const onPressIn = () => { Animated.spring(scale, { toValue: 0.98, useNativeDriver: false, speed: 20, bounciness: 3 }).start(); }; const onPressOut = () => { Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 20, bounciness: 3 }).start(); if (!disabled) onPress(); }; const bg = disabled ? '#e0e0e0' : muted ? '#e0e0e0' : '#1976d2'; const fg = disabled ? '#888' : muted ? '#666' : '#fff'; return (<Animated.View style={{ transform: [{ scale }], borderRadius: radius, backgroundColor: bg, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}><TouchableOpacity activeOpacity={0.85} onPressIn={onPressIn} onPressOut={onPressOut} disabled={disabled}><Text style={{ color: fg, fontWeight: '700' }}>{title}</Text></TouchableOpacity></Animated.View> ); };

export const MyTasksScreen: React.FC = () => {
	const { token, user } = useAuth();
	const router = useRouter();
	const [all, setAll] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState<'inbox'|'working'>('inbox');
	const [processing, setProcessing] = useState<Record<number, boolean>>({});
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});

	const load = useCallback(async () => { if (!token) return; setLoading(true); try { const res: Task[] = await api.tasks.list(token); const mine = Array.isArray(res) ? res.filter(t => t.assignedTo?.id === user?.id) : []; setAll(mine); } catch (e:any) { Alert.alert('Gagal memuat', e.message || String(e)); } finally { setLoading(false); } }, [token, user?.id]);
	useEffect(() => { load(); }, [load]);
	useEffect(() => { const t = setInterval(() => { load(); }, 15000); return () => clearInterval(t); }, [load]);

		const toggleCheck = async (t: Task, value: boolean) => { if (!token) return; try { if (value) await api.tasks.check(token, t.id); /* else fallback not implemented */ await load(); } catch (e:any) { Alert.alert('Gagal update checklist', e.message || String(e)); } };
		const acceptOrder = async (g: Group) => { if (!token) return; setProcessing(p => ({ ...p, [g.orderId]: true })); try { // Fallback: marking tasks as in progress not supported via dedicated endpoint; rely on checklist usage
				Alert.alert('Info', 'Endpoint acceptMine belum tersedia.');
			} catch (e: any) { Alert.alert('Gagal menerima pesanan', e.message || String(e)); } finally { setProcessing(p => ({ ...p, [g.orderId]: false })); } };
	const groups: Group[] = useMemo(() => { const byOrder = new Map<number, Group>(); for (const t of all) { const g = byOrder.get(t.orderId) || { orderId: t.orderId, order: t.order, tasks: [] }; g.tasks.push(t); byOrder.set(t.orderId, g); } return Array.from(byOrder.values()); }, [all]);
	const filteredGroups = useMemo(() => { if (tab === 'inbox') return groups.filter(g => g.tasks.some(t => t.status === 'ASSIGNED')); return groups.filter(g => g.tasks.some(t => t.status === 'IN_PROGRESS' || t.status === 'AWAITING_VALIDATION')); }, [groups, tab]);
	const canRequestDone = (g: Group) => { const relevant = g.tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'); if (relevant.length === 0) return false; if (relevant.some(t => t.status === 'ASSIGNED')) return false; return relevant.every(t => (t as any).isChecked); };
	const disabledReason = (g: Group) => { const relevant = g.tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'); if (relevant.some(t => t.status === 'ASSIGNED')) return 'Mulai & checklist semua sub-tugas'; if (!relevant.every(t => (t as any).isChecked)) return 'Checklist semua sub-tugas'; if (relevant.length === 0) return 'Tidak ada sub-tugas aktif'; return ''; };
		const requestDoneOrder = async (g: Group) => { if (!token) return; setProcessing(p => ({ ...p, [g.orderId]: true })); try { Alert.alert('Info', 'Endpoint requestDoneMine belum tersedia.'); } catch (e:any) { Alert.alert('Gagal request selesai', e.message || String(e)); } finally { setProcessing(p => ({ ...p, [g.orderId]: false })); } };

	const renderGroup = ({ item }: { item: Group }) => {
		const toDisplayUrl = (p?: string) => { if (!p) return undefined as any; if (/^https?:\/\//i.test(p)) return p; const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, ''); return p.startsWith('/uploads') ? base + p : p; };
		const thumbSrc = Array.isArray(item.order?.referensiGambarUrls) && (item.order.referensiGambarUrls[item.order.referensiGambarUrls.length-1] || item.order.referensiGambarUrls[0])
			? toDisplayUrl(item.order.referensiGambarUrls[item.order.referensiGambarUrls.length-1] || item.order.referensiGambarUrls[0])
			: undefined;
		const busy = !!processing[item.orderId];
		const { checked, total } = progressFor(item);
		const readyToRequest = canRequestDone(item);
		const reason = disabledReason(item);
		const isExpanded = expanded[item.orderId] ?? (tab === 'working');
		const hasAssigned = item.tasks.some(t => t.status === 'ASSIGNED');
		const showAcceptHint = tab === 'inbox' && hasAssigned;
		return (
			<View style={[styles.card, isExpanded && styles.cardExpanded]}>
				<View style={{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between' }}>
					<View style={{ flexDirection:'row', alignItems:'center', flex:1, minWidth:0 }}>
						{thumbSrc ? (
							<Image source={{ uri: thumbSrc }} style={styles.thumb} resizeMode="cover" />
						) : (
							<View style={[styles.thumb, { backgroundColor:'#23201c', alignItems:'center', justifyContent:'center', borderColor:'#4e3f2c', borderWidth:1 }]}>
								<Text style={{ color:'#bfae6a', fontSize:11 }}>No Img</Text>
							</View>
						)}
						<View style={{ marginLeft: 10, flex:1, minWidth:0 }}>
							<TouchableOpacity activeOpacity={0.85} onPress={() => setExpanded(prev => ({ ...prev, [item.orderId]: !isExpanded }))} onLongPress={() => { setSelectedOrder(item.order || { id: item.orderId }); setDetailOpen(true); }}>
								<Text style={styles.title}>Order #{item.order?.code || item.orderId}</Text>
								{item.order?.customerName ? <Text style={styles.subtle}>{item.order.customerName} • {item.order?.jenisBarang} • {item.order?.jenisEmas}</Text> : null}
								<Text style={styles.expandHint}>{isExpanded ? 'Sembunyikan' : 'Tampilkan'} detail</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{ alignItems:'flex-end' }}>
						<Text style={styles.countPill}>{checked}/{total} checklist</Text>
						<View style={styles.progressBar}><View style={[styles.progressFill, { width: `${total>0 ? (checked/total)*100 : 0}%` }]} /></View>
						{showAcceptHint ? (<Text style={styles.hintCaption}>Harus terima pesanan dahulu</Text>) : null}
					</View>
				</View>
				{isExpanded && <>
					<View style={styles.divider} />
					{item.tasks.sort((a,b)=> String(a.stage||'').localeCompare(String(b.stage||''))).map(t => {
						const showCheckbox = (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');
						const dotStyle = t.status === 'IN_PROGRESS' ? styles.dotProgress : t.status === 'ASSIGNED' ? styles.dotAssigned : styles.dotOther;
						return (
							<View key={t.id} style={styles.row}>
								<View style={{ flexDirection:'row', alignItems:'center', flex:1 }}>
									<View style={[styles.statusDot, dotStyle]} />
									<Text style={styles.stage}>{t.stage || 'Tanpa Stage'}</Text>
								</View>
								{showCheckbox ? (
									t.status === 'ASSIGNED' ? (
										<View style={[styles.checkbox, styles.masterCheckboxDisabled]}><View style={styles.checkboxInner} /></View>
									) : (
										<TouchableOpacity onPress={() => toggleCheck(t, !(t as any).isChecked)} style={[styles.checkbox, (t as any).isChecked && styles.checkboxChecked]}>
											<View style={[styles.checkboxInner, (t as any).isChecked && styles.checkboxInnerChecked]} />
										</TouchableOpacity>
									)
								) : t.status === 'AWAITING_VALIDATION' ? (
									<Text style={styles.badge}>Menunggu Validasi</Text>
								) : null}
							</View>
						);
					})}
					<View style={{ height: 40 }} />
					<View pointerEvents={busy ? 'none' : 'auto'} style={styles.fabContainer}>
						{tab === 'inbox' && item.tasks.some(t => t.status === 'ASSIGNED') ? (
							user?.jobRole === 'INVENTORY' ? (
								<SquareActionButton
									title="Masukkan Ke Dalam Inventory"
									onPress={async () => {
										try {
											// Previously attempted to call api.tasks.acceptMine which does not exist.
											// Keeping navigation behavior only.
										} catch (e: any) {}
										router.push({ pathname: '/inventory-form', params: { orderId: String(item.orderId) } });
									}}
								/>
							) : (
								<SquareActionButton title="Terima Pesanan" onPress={() => acceptOrder(item)} />
							)
						) : readyToRequest ? (
							<SquareActionButton title="Ajukan verifikasi" onPress={() => requestDoneOrder(item)} />
						) : (
							<SquareActionButton title="Ajukan verifikasi" muted onPress={() => Alert.alert('Belum bisa', reason || 'Checklist semua sub-tugas')} />
						)}
					</View>
				</>}
			</View>
		);
	};

	return (
		<View style={{ flex:1, backgroundColor:'#181512' }}>
			<View style={styles.tabs}>
				<TouchableOpacity onPress={()=> setTab('inbox')} style={[styles.tab, tab==='inbox' && styles.tabActive]}><Text style={tab==='inbox'?styles.tabActiveText:styles.tabText}>Inbox</Text></TouchableOpacity>
				<TouchableOpacity onPress={()=> setTab('working')} style={[styles.tab, tab==='working' && styles.tabActive]}><Text style={tab==='working'?styles.tabActiveText:styles.tabText}>Sedang Dikerjakan</Text></TouchableOpacity>
			</View>
			<FlatList data={filteredGroups} keyExtractor={(it)=> String(it.orderId)} renderItem={renderGroup} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={{ padding: 12 }} ListEmptyComponent={!loading ? <Text style={{ textAlign:'center', marginTop: 40, color:'#bfae6a' }}>Tidak ada item</Text> : null} />
			<OrderActionsModal visible={detailOpen} order={selectedOrder} onClose={()=> setDetailOpen(false)} onChanged={()=> load()} />
		</View>
	);
};

const styles = StyleSheet.create({ tabs: { flexDirection:'row', borderBottomWidth:1, borderBottomColor:'#333' }, tab: { flex:1, paddingVertical: 12, alignItems:'center', borderBottomWidth:2, borderBottomColor:'transparent' }, tabActive: { borderBottomColor:'#FFD700' }, tabText: { color:'#8a8a8a' }, tabActiveText: { color:'#FFD700', fontWeight:'700' }, card: { backgroundColor:'#23201c', borderWidth:1, borderColor:'#4e3f2c', borderRadius:12, padding:14, marginBottom:12, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8, elevation:2 }, cardExpanded: { position:'relative' }, title: { fontSize:16, fontWeight:'700', color:'#FFD700' }, subtle: { color:'#ffe082', marginTop:4 }, subtleSmall: { color:'#777', fontSize:12 }, divider: { height:1, backgroundColor:'#3a302a', marginVertical:8 }, row: { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:6 }, stage: { color:'#ffe082' }, statusDot: { width:8, height:8, borderRadius:4, marginRight:8, backgroundColor:'#c7c7c7' }, dotAssigned: { backgroundColor:'#c7c7c7' }, dotProgress: { backgroundColor:'#2e7d32' }, dotOther: { backgroundColor:'#bdbdbd' }, countPill: { backgroundColor:'#2b2522', color:'#FFD700', paddingHorizontal:8, paddingVertical:4, borderRadius:6, overflow:'hidden', fontWeight:'700' }, checkbox: { width:24, height:24, borderRadius:6, borderWidth:2, borderColor:'#c5c5c5', alignItems:'center', justifyContent:'center' }, checkboxChecked: { borderColor:'#2e7d32', backgroundColor:'#e8f5e9' }, checkboxInner: { width:12, height:12, borderRadius:3, backgroundColor:'transparent' }, checkboxInnerChecked: { backgroundColor:'#2e7d32' }, masterCheckboxDisabled: { opacity:0.5 }, badge: { backgroundColor:'#fff8e1', color:'#ff8f00', paddingHorizontal:8, paddingVertical:4, borderRadius:6, overflow:'hidden' }, hintCaption: { marginTop:4, color:'#999', fontSize:12 }, progressBar: { width: 120, height: 6, backgroundColor:'#2b2522', borderRadius:4, overflow:'hidden', marginTop:4 }, progressFill: { height: '100%', backgroundColor:'#FFD700' }, expandHint: { color:'#8a8a8a', fontSize:12, marginTop:4 }, fabContainer: { position:'absolute', right:12, bottom:12 }, });
