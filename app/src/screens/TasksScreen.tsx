import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { api, API_URL } from '../api/client';
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
		return (
			<TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { setSelectedOrder(item.order || { id: item.orderId }); setActionsOpen(true); }}>
				<View style={{ flexDirection: 'row' }}>
					{thumbSrc ? (
						<Image source={{ uri: thumbSrc }} style={styles.thumb} resizeMode="cover" />
					) : (
						<View style={[styles.thumb, { backgroundColor:'#eef1f4', alignItems:'center', justifyContent:'center' }]}>
							<Text style={{ color:'#99a' }}>No Img</Text>
						</View>
					)}
					<View style={{ flex:1, marginLeft: 12 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={styles.title}>Order #{item.orderId}</Text>
							<Text style={[styles.badge, statusColor(item.status)]}>{item.status}</Text>
						</View>
						{item.order && (
							<Text style={styles.subtle}>{item.order.customerName} • {item.order.jenisBarang} • {item.order.jenisEmas}</Text>
						)}
						{assignedSummary ? <Text style={styles.subtle}>{assignedSummary}</Text> : null}
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				data={data}
				keyExtractor={(it) => String(it.orderId)}
				renderItem={renderItem}
				refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
				contentContainerStyle={{ padding: 12 }}
				ListEmptyComponent={!loading ? <Text style={{ textAlign: 'center', marginTop: 40 }}>Belum ada tasks aktif</Text> : null}
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
		case 'OPEN': return { backgroundColor: '#e9f5ff', borderColor: '#90caf9', color: '#1976d2' } as any;
		case 'ASSIGNED': return { backgroundColor: '#f3e5f5', borderColor: '#ce93d8', color: '#6a1b9a' } as any;
		case 'IN_PROGRESS': return { backgroundColor: '#fff8e1', borderColor: '#ffe082', color: '#ff8f00' } as any;
		case 'AWAITING_VALIDATION': return { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7', color: '#2e7d32' } as any;
		case 'DONE': return { backgroundColor: '#eceff1', borderColor: '#b0bec5', color: '#37474f' } as any;
		case 'CANCELLED': return { backgroundColor: '#ffebee', borderColor: '#ffCDD2', color: '#c62828' } as any;
	}
}

const styles = StyleSheet.create({
	card: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 12, borderColor: '#eee', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
	thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' },
	title: { fontSize: 16, fontWeight: '600' },
	badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
	subtle: { color: '#666', marginTop: 4 },
});

