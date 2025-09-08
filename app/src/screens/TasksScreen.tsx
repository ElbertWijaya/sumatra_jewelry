import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../api/client';
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

export default function TasksScreen() {
	const { token, user } = useAuth();
	const [data, setData] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);
	const [note, setNote] = useState('');
	const [actionsOpen, setActionsOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

		const canValidate = user?.jobRole === 'ADMINISTRATOR';

	const load = useCallback(async () => {
		if (!token) return; setLoading(true);
		try {
			const res = await api.tasks.list(token);
			setData(res);
		} catch (e: any) { Alert.alert('Gagal memuat tasks', e.message || String(e)); }
		finally { setLoading(false); }
	}, [token]);

	useEffect(() => { load(); }, [load]);

	const confirmDelete = (id: number) => {
		Alert.alert('Hapus Task', 'Yakin hapus task ini?', [
			{ text: 'Batal', style: 'cancel' },
			{ text: 'Hapus', style: 'destructive', onPress: async () => { try { if (!token) return; await api.tasks.remove(token, id); await load(); } catch (e:any) { Alert.alert('Gagal hapus', e.message); } } }
		]);
	};

	const requestDone = async (id: number) => {
		if (!token) return;
		try { await api.tasks.requestDone(token, id, note.trim() || undefined); setNote(''); await load(); } catch (e:any) { Alert.alert('Gagal request selesai', e.message); }
	};

	const validateDone = async (id: number) => {
		if (!token) return;
		try { await api.tasks.validate(token, id, note.trim() || undefined); setNote(''); await load(); } catch (e:any) { Alert.alert('Gagal validasi', e.message); }
	};

	const renderItem = ({ item }: { item: Task }) => {
		return (
			<TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { setSelectedOrder(item.order || { id: item.orderId }); setActionsOpen(true); }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={styles.title}>Order #{item.orderId} • {item.stage || 'Tanpa Stage'}</Text>
					<Text style={[styles.badge, statusColor(item.status)]}>{item.status}</Text>
				</View>
				{item.order && (
					<Text style={styles.subtle}>{item.order.customerName} • {item.order.jenisBarang} • {item.order.jenisEmas}</Text>
				)}
				{item.notes ? <Text style={styles.notes}>Catatan: {item.notes}</Text> : null}
				<View style={styles.row}>
					{item.assignedTo ? <Text style={styles.subtle}>Ditugaskan: {item.assignedTo.fullName}</Text> : <Text style={styles.subtle}>Belum ditugaskan</Text>}
				</View>
				<View style={styles.actions}>
					<TouchableOpacity style={styles.btn} onPress={() => requestDone(item.id)}><Text style={styles.btnText}>Request Selesai</Text></TouchableOpacity>
					{canValidate && <TouchableOpacity style={styles.btnPrimary} onPress={() => validateDone(item.id)}><Text style={styles.btnTextPrimary}>Validasi</Text></TouchableOpacity>}
					<TouchableOpacity style={styles.btnDanger} onPress={() => confirmDelete(item.id)}><Text style={styles.btnTextDanger}>Hapus</Text></TouchableOpacity>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				data={data}
				keyExtractor={(it) => String(it.id)}
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
	title: { fontSize: 16, fontWeight: '600' },
	badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
	subtle: { color: '#666', marginTop: 4 },
	notes: { color: '#333', marginTop: 4 },
	row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
	actions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
	btn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 6 },
	btnText: { color: '#0f172a' },
	btnPrimary: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#1976d2', borderRadius: 6 },
	btnTextPrimary: { color: 'white' },
	btnDanger: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#ef4444', borderRadius: 6 },
	btnTextDanger: { color: 'white' },
	input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
});

