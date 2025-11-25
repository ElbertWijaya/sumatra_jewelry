import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { api, API_URL } from '@lib/api/client';
import { useAuth } from '@lib/context/AuthContext';
import { OrderActionsModal } from '@features/orders/screens/OrderActionsModal';
import { displayStatus } from '@lib/statusLabels';

type Task = { id: number; stage?: string | null; status: 'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'AWAITING_VALIDATION'|'DONE'|'CANCELLED'; notes?: string | null; createdAt: string; orderId: number; order?: any; assignedTo?: { id: string; fullName: string } | null; };
type OrderCard = { orderId: number; order?: any; status: Task['status']; counts: { open: number; assigned: number; inProgress: number; awaitingValidation: number }; assignees: string[]; };

export const TasksScreen: React.FC = () => {
	const { token, user } = useAuth();
	const [data, setData] = useState<OrderCard[]>([]);
	const [loading, setLoading] = useState(false);
	const [actionsOpen, setActionsOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

	const load = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		try {
			const res: Task[] = await api.tasks.list(token);
			const byOrder = new Map<number, Task[]>();
			res.forEach(t => { const arr = byOrder.get(t.orderId) || []; arr.push(t); byOrder.set(t.orderId, arr); });
			const cards: OrderCard[] = Array.from(byOrder.entries()).map(([orderId, tasks]) => {
				const counts = {
					open: tasks.filter(x => x.status === 'OPEN').length,
					assigned: tasks.filter(x => x.status === 'ASSIGNED').length,
					inProgress: tasks.filter(x => x.status === 'IN_PROGRESS').length,
					awaitingValidation: tasks.filter(x => x.status === 'AWAITING_VALIDATION').length,
				};
				let status: Task['status'] = 'OPEN';
				if (counts.awaitingValidation > 0) status = 'AWAITING_VALIDATION';
				else if (counts.inProgress > 0) status = 'IN_PROGRESS';
				else if (counts.assigned > 0) status = 'ASSIGNED';
				else status = 'OPEN';
				const assignees = Array.from(new Set(tasks.filter(t => !!t.assignedTo?.fullName).map(t => String(t.assignedTo!.fullName))));
				return { orderId, order: tasks[0]?.order, status, counts, assignees };
			});

			setData(cards);
		} catch (e: any) {
			Alert.alert('Gagal memuat tasks', e.message || String(e));
		} finally {
			setLoading(false);
		}
	}, [token]);
	useEffect(() => { load(); }, [load]);

	const statusColor = (s: Task['status']) => { switch (s) { case 'OPEN': return { backgroundColor: '#2b2522', borderColor: '#4e3f2c', color: '#c7b899' } as any; case 'ASSIGNED': return { backgroundColor: '#1e1a2b', borderColor: '#6d55c3', color: '#b7a9ff' } as any; case 'IN_PROGRESS': return { backgroundColor: '#2a2217', borderColor: '#C5A028', color: '#ffcd63' } as any; case 'AWAITING_VALIDATION': return { backgroundColor: '#1a2a25', borderColor: '#3a9f70', color: '#6dd8a8' } as any; case 'DONE': return { backgroundColor: '#172025', borderColor: '#2c3e50', color: '#9fb3c5' } as any; case 'CANCELLED': return { backgroundColor: '#2a1717', borderColor: '#8a3a3a', color: '#e89f9f' } as any; }};

	const formatDate = (iso?: string) => {
		if (!iso) return '-';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '-';
		return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	};
	const toDisplayUrl = (p?: string) => { if (!p) return undefined as any; if (/^https?:\/\//i.test(p)) return p; const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, ''); return p.startsWith('/uploads') ? base + p : p; };

	const renderItem = ({ item }: { item: OrderCard }) => {
		const assignedSummary = !item.assignees?.length
			? 'Belum ditugaskan'
			: item.assignees.length <= 2
			? `Ditugaskan ke ${item.assignees.join(', ')}`
			: `Ditugaskan ke ${item.assignees.slice(0, 2).join(', ')} +${item.assignees.length - 2} lainnya`;
		const thumbSrc = Array.isArray(item.order?.referensiGambarUrls) && item.order.referensiGambarUrls[0]
			? toDisplayUrl(item.order.referensiGambarUrls[0])
			: undefined;
		const canFinish = (() => {
			const os = String(item?.order?.status || '').toUpperCase();
			return os === 'DALAM_PROSES' || os === 'MENUNGGU';
		})();
		const canSeeFinish = (user?.jobRole === 'ADMINISTRATOR' || user?.jobRole === 'SALES') && canFinish;
		const o = item.order || {};
		const customerName = o.customerName ?? o.customer_name;
		const jenisBarang = o.jenisBarang ?? o.jenis ?? o.itemType ?? o.item_type;
		const jenisEmas = o.jenisEmas ?? o.gold_type;
		const warnaEmas = o.warnaEmas ?? o.gold_color;
		const createdAt = o.createdAt ?? o.created_at;
		const promised = o.promisedReadyDate ?? o.promised_ready_date;
		const tanggalSelesai = o.tanggalSelesai ?? o.completed_date;
		const tanggalAmbil = o.tanggalAmbil ?? o.pickup_date;
		return (
			<TouchableOpacity
				activeOpacity={0.88}
				onPress={() => {
					setSelectedOrder(item.order || { id: item.orderId });
					setActionsOpen(true);
				}}
				style={styles.card}
			>
				<View style={{ flexDirection: 'row' }}>
					{thumbSrc ? (
						<Image source={{ uri: thumbSrc }} style={styles.thumb} resizeMode="cover" />
					) : (
						<View
							style={[
								styles.thumb,
								{
									backgroundColor: '#23201c',
									alignItems: 'center',
									justifyContent: 'center',
									borderColor: '#4e3f2c',
									borderWidth: 1,
								},
							]}
						>
							<Text style={{ color: '#bfae6a', fontSize: 11 }}>No Img</Text>
						</View>
					)}
						<View style={{ flex: 1, marginLeft: 12 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
								<Text numberOfLines={1} style={styles.title}>
									{o.code || `Order #${item.orderId}`}
								</Text>
								<Text style={[styles.badge, statusColor(item.status), { marginLeft: 10 }]}>
									{displayStatus(o.status)}
								</Text>
							</View>
							<View style={styles.infoRow}>
								<View style={styles.infoPillPrimary}>
									<Text style={styles.infoLabel}>Customer</Text>
									<Text style={styles.infoValue} numberOfLines={1}>{customerName || '-'}</Text>
								</View>
							</View>
							<View style={styles.infoRow}>
								<View style={[styles.infoPill, { flex: 1.1 }]}>
									<Text style={styles.infoLabel}>Jenis Perhiasan</Text>
									<Text style={styles.infoValue} numberOfLines={1}>{jenisBarang || '-'}</Text>
								</View>
								<View style={[styles.infoPill, { flex: 0.9 }] }>
									<Text style={styles.infoLabel}>Jenis Emas</Text>
									<Text style={styles.infoValue} numberOfLines={1}>{jenisEmas || '-'}</Text>
								</View>
							</View>
							<Text style={styles.metaDates}>
								📅 Dibuat: {formatDate(createdAt)} • Janji: {formatDate(promised)} • Selesai: {formatDate(tanggalSelesai)} • Ambil: {formatDate(tanggalAmbil)}
							</Text>
						{assignedSummary ? <Text style={styles.assignees}>{assignedSummary}</Text> : null}
						{canSeeFinish ? (
							<View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
								<TouchableOpacity
									onPress={async () => {
										if (!token) return;
										Alert.alert('Selesaikan Pesanan', 'Yakin set status pesanan menjadi SIAP?', [
											{ text: 'Batal', style: 'cancel' },
											{
												text: 'Ya',
												style: 'destructive',
												onPress: async () => {
													try {
														await api.orders.updateStatus(token, item.order?.id || item.orderId, 'SIAP');
														await load();
													} catch (e: any) {
														Alert.alert('Gagal', e.message || String(e));
													}
												},
											},
										]);
									}}
									style={styles.finishBtn}
								>
									<Text style={styles.finishBtnText}>Selesaikan</Text>
								</TouchableOpacity>
							</View>
						) : null}
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (<View style={{ flex: 1, backgroundColor: '#181512' }}> <FlatList data={data} keyExtractor={(it) => String(it.orderId)} renderItem={renderItem} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor='#FFD700' />} contentContainerStyle={{ padding: 12 }} ListEmptyComponent={!loading ? <Text style={{ textAlign: 'center', marginTop: 40, color:'#bfae6a' }}>Belum ada tasks aktif</Text> : null} /> <OrderActionsModal visible={actionsOpen} order={selectedOrder} onClose={() => setActionsOpen(false)} onChanged={() => { load(); }} /> </View> );
};

const styles = StyleSheet.create({
	card: { marginBottom: 12, backgroundColor:'#23201c', borderRadius:16, padding:14, borderWidth:1, borderColor:'#4e3f2c' },
	thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor:'#23201c' },
	badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', borderWidth: 1, marginRight: 8, fontSize:11, textTransform:'uppercase', letterSpacing:0.5 },
	title: { flexShrink:1, fontWeight:'700', color:'#FFD700' },
	infoRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
	infoPillPrimary: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.45)', backgroundColor: 'rgba(255,215,0,0.08)' },
	infoPill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#4e3f2c', backgroundColor: '#201c18' },
	infoLabel: { color: '#bfae6a', fontSize: 10, fontWeight:'700', textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 2 },
	infoValue: { color: '#ffe082', fontSize: 13, fontWeight:'800' },
	metaDates: { marginTop: 8, color:'#d7c36a', fontSize:11 },
	assignees: { marginTop: 4, color:'#bfae6a', fontSize:11 },
	finishBtn: { backgroundColor:'#FFD700', paddingHorizontal:14, paddingVertical:8, borderRadius:14 },
	finishBtnText: { color:'#181512', fontWeight:'700', fontSize:12, letterSpacing:0.5 },
});
