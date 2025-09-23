import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { api, API_URL } from '../api/client';
import { Card } from '../ui/components/Card';
import { Title, Body, Small } from '../ui/components/Text';
import { Button } from '../ui/components/Button';
import { luxuryTheme as t } from '../ui/theme/luxuryTheme';
import { useAuth } from '../context/AuthContext';
import { OrderActionsModal } from './OrderActionsModal';

type Task = {
	id: number;
	stage?: string | null;
	status: 'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'AWAITING_VALIDATION'|'DONE'|'CANCELLED';
	notes?: string | null;
	createdAt: string;
	orderId: number;
	order?: any;
	assignedTo?: { id: string; fullName: string } | null;
};

type OrderCard = {
	orderId: number;
	order?: any;
	status: Task['status'];
	counts: { open: number; assigned: number; inProgress: number; awaitingValidation: number };
	assignees: string[]; // unique assignee names
};

export default function TasksScreen() {
	const { token, user } = useAuth();
	const [data, setData] = useState<OrderCard[]>([]);
	const [loading, setLoading] = useState(false);
	const [note, setNote] = useState('');
	const [actionsOpen, setActionsOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

		const canValidate = user?.jobRole === 'ADMINISTRATOR';

	const load = useCallback(async () => {
		if (!token) return; setLoading(true);
		try {
			const res: Task[] = await api.tasks.list(token);
			// Group by orderId into a single card per order
			const byOrder = new Map<number, Task[]>();
			res.forEach(t => {
				const arr = byOrder.get(t.orderId) || [];
				arr.push(t);
				byOrder.set(t.orderId, arr);
			});
			const cards: OrderCard[] = Array.from(byOrder.entries()).map(([orderId, tasks]) => {
				const counts = {
					open: tasks.filter(x=>x.status==='OPEN').length,
					assigned: tasks.filter(x=>x.status==='ASSIGNED').length,
					inProgress: tasks.filter(x=>x.status==='IN_PROGRESS').length,
					awaitingValidation: tasks.filter(x=>x.status==='AWAITING_VALIDATION').length,
				};
				// derive aggregated status: show highest priority
				let status: Task['status'] = 'OPEN';
				if (counts.awaitingValidation > 0) status = 'AWAITING_VALIDATION';
				else if (counts.inProgress > 0) status = 'IN_PROGRESS';
				else if (counts.assigned > 0) status = 'ASSIGNED';
				else status = 'OPEN';
				const assignees = Array.from(new Set(
					tasks
						.filter(t => !!t.assignedTo?.fullName)
						.map(t => String(t.assignedTo!.fullName))
				));
				return { orderId, order: tasks[0]?.order, status, counts, assignees };
			});
			setData(cards);
		} catch (e: any) { Alert.alert('Gagal memuat tasks', e.message || String(e)); }
		finally { setLoading(false); }
	}, [token]);

	useEffect(() => { load(); }, [load]);

	// Per-order view: actions dilakukan dari modal, jadi hapus aksi langsung di kartu

	const renderItem = ({ item }: { item: OrderCard }) => {
		let assignedSummary: string | undefined;
		if (!item.assignees || item.assignees.length === 0) assignedSummary = 'Belum ditugaskan';
		else if (item.assignees.length <= 2) assignedSummary = `Ditugaskan ke ${item.assignees.join(', ')}`;
		else assignedSummary = `Ditugaskan ke ${item.assignees.slice(0,2).join(', ')} +${item.assignees.length-2} lainnya`;

		const toDisplayUrl = (p?: string) => {
			if (!p) return undefined as any;
			if (/^https?:\/\//i.test(p)) return p;
			const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
			return p.startsWith('/uploads') ? base + p : p;
		};
		const thumbSrc = Array.isArray(item.order?.referensiGambarUrls) && item.order.referensiGambarUrls[0] ? toDisplayUrl(item.order.referensiGambarUrls[0]) : undefined;
		const canFinish = (() => {
			const os = String(item?.order?.status || '').toUpperCase();
			return os === 'DALAM_PROSES' || os === 'DITERIMA';
		})();
		const canSeeFinish = (user?.jobRole === 'ADMINISTRATOR' || user?.jobRole === 'SALES') && canFinish;
		return (
			<TouchableOpacity activeOpacity={0.88} onPress={() => { setSelectedOrder(item.order || { id: item.orderId }); setActionsOpen(true); }}>
				<Card style={styles.card}>
					<View style={{ flexDirection: 'row' }}>
						{thumbSrc ? (
							<Image source={{ uri: thumbSrc }} style={styles.thumb} resizeMode="cover" />
						) : (
							<View style={[styles.thumb, { backgroundColor: t.colors.surfaceElevated, alignItems:'center', justifyContent:'center', borderColor: t.colors.border, borderWidth: 1 }]}>
								<Small>No Img</Small>
							</View>
						)}
						<View style={{ flex:1, marginLeft: 12 }}>
							{/* Header row: title + status badge, text truncates to avoid overflow */}
							<View style={{ flexDirection: 'row', alignItems:'center', minWidth: 0 }}>
								<Title numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1 }}>Order #{item.order?.code || item.orderId}</Title>
								<Text style={[styles.badge, statusColor(item.status), { marginLeft: 10 }]}>{item.status}</Text>
							</View>

							{item.order && (
								<Small style={{ marginTop: 6 }}>{item.order.customerName} • {item.order.jenisBarang} • {item.order.jenisEmas}</Small>
							)}
							{assignedSummary ? <Small style={{ marginTop: 4 }}>{assignedSummary}</Small> : null}

							{/* Actions row: placed on its own line to prevent overflow */}
							{canSeeFinish ? (
								<View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
									<Button
										compact
										title="Selesaikan"
										onPress={async () => {
											if (!token) return;
											Alert.alert('Selesaikan Pesanan', 'Yakin set status pesanan menjadi SIAP?', [
												{ text:'Batal', style:'cancel' },
												{ text:'Ya', style:'destructive', onPress: async () => {
													try { await api.orders.updateStatus(token, item.order?.id || item.orderId, 'SIAP'); await load(); } catch(e:any){ Alert.alert('Gagal', e.message || String(e)); }
												} }
											]);
										}}
									/>
								</View>
							) : null}
						</View>
					</View>
				</Card>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: t.colors.background }}>
			<FlatList
				data={data}
				keyExtractor={(it) => String(it.orderId)}
				renderItem={renderItem}
				refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={t.colors.primary} />}
				contentContainerStyle={{ padding: 12 }}
				ListEmptyComponent={!loading ? <Small style={{ textAlign: 'center', marginTop: 40 }}>Belum ada tasks aktif</Small> : null}
			/>

			<OrderActionsModal
				visible={actionsOpen}
				order={selectedOrder}
				onClose={() => setActionsOpen(false)}
				onChanged={() => { load(); }}
			/>
		</View>
	);
}

function statusColor(s: Task['status']) {
	switch (s) {
		case 'OPEN': return { backgroundColor: t.colors.badgeBg, borderColor: t.colors.border, color: t.colors.textMuted } as any;
		case 'ASSIGNED': return { backgroundColor: '#1e1a2b', borderColor: '#6d55c3', color: '#b7a9ff' } as any;
		case 'IN_PROGRESS': return { backgroundColor: '#2a2217', borderColor: '#C5A028', color: '#ffcd63' } as any;
		case 'AWAITING_VALIDATION': return { backgroundColor: '#1a2a25', borderColor: '#3a9f70', color: t.colors.success } as any;
		case 'DONE': return { backgroundColor: '#172025', borderColor: t.colors.border, color: t.colors.textMuted } as any;
		case 'CANCELLED': return { backgroundColor: '#2a1717', borderColor: '#8a3a3a', color: t.colors.danger } as any;
	}
}

const styles = StyleSheet.create({
	card: { marginBottom: 12 },
	thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: t.colors.surfaceElevated },
	badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', borderWidth: 1, marginRight: 8 },
});

