import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Button } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

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
	const [assignModal, setAssignModal] = useState<{ id: number; visible: boolean } | null>(null);
	const [assignee, setAssignee] = useState('');
	const [note, setNote] = useState('');

	const canValidate = user?.role === 'admin' || user?.role === 'owner';

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

	const doAssign = async () => {
		if (!assignModal || !token) return;
		if (!assignee.trim()) { Alert.alert('Assign', 'Masukkan User ID'); return; }
		try { await api.tasks.assign(token, assignModal.id, assignee.trim()); setAssignModal(null); setAssignee(''); await load(); } catch (e:any) { Alert.alert('Gagal assign', e.message); }
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
			<View style={styles.card}>
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
					<TouchableOpacity style={styles.btn} onPress={() => setAssignModal({ id: item.id, visible: true })}><Text style={styles.btnText}>Assign</Text></TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => requestDone(item.id)}><Text style={styles.btnText}>Request Selesai</Text></TouchableOpacity>
					{canValidate && <TouchableOpacity style={styles.btnPrimary} onPress={() => validateDone(item.id)}><Text style={styles.btnTextPrimary}>Validasi</Text></TouchableOpacity>}
					<TouchableOpacity style={styles.btnDanger} onPress={() => confirmDelete(item.id)}><Text style={styles.btnTextDanger}>Hapus</Text></TouchableOpacity>
				</View>
			</View>
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

			<Modal visible={!!assignModal} animationType="slide" transparent onRequestClose={() => setAssignModal(null)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalBody}>
						<Text style={styles.modalTitle}>Assign Task</Text>
						<TextInput placeholder="User ID" value={assignee} onChangeText={setAssignee} style={styles.input} autoCapitalize='none' />
						<View style={{ height: 8 }} />
						<View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
							<Button title="Batal" onPress={() => setAssignModal(null)} />
							<Button title="Assign" onPress={doAssign} />
						</View>
					</View>
				</View>
			</Modal>
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
	modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
	modalBody: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
	modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
	input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
});

