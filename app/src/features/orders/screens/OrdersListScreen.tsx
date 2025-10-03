import React from 'react';
import { View, Text, FlatList, RefreshControl, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api/client';
import { CreateOrderScreen } from './CreateOrderScreen';
import { useAuth } from '@lib/context/AuthContext';
import { PremiumButton } from '@ui/atoms/PremiumButton';

export const OrdersListScreen: React.FC = () => {
	const { token } = useAuth();
	const { data, error, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ['orders'],
		queryFn: () => api.orders.list(token || ''),
		enabled: !!token,
	});
	const [open, setOpen] = React.useState(false);
	return (
		<View style={styles.container}>
			<PremiumButton title='ORDER BARU' onPress={() => setOpen(true)} style={{ marginBottom: 16 }} />
			{error && <Text style={styles.error}>{String((error as any).message)}</Text>}
			<FlatList
				data={data || []}
				keyExtractor={(item: any) => String(item.id)}
				refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
				renderItem={({ item }) => (
					<View style={styles.itemRow}>
						<Text style={styles.code}>{item.code || '(pending code)'}</Text>
						<Text style={styles.meta}>{item.customerName} • {item.jenisBarang || item.jenis} • {item.status}</Text>
						{(item.stoneCount != null || item.totalBerat != null) && (
							<Text style={styles.stoneInfo}>Batu: {item.stoneCount ?? 0}{item.totalBerat ? ` • Total ${Number(item.totalBerat)} gr` : ''}</Text>
						)}
					</View>
				)}
			/>
			<Modal visible={open} animationType='slide'>
				<View style={{ flex:1, backgroundColor:'#181512' }}>
					<View style={{ padding:12 }}>
						<TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>Tutup</Text></TouchableOpacity>
					</View>
					<CreateOrderScreen onCreated={() => { setOpen(false); }} />
				</View>
			</Modal>
		</View>
	);
};

const COLORS = { gold:'#FFD700', dark:'#181512', card:'#23201c' };
const styles = StyleSheet.create({
	container: { flex:1, padding:16, backgroundColor: COLORS.dark },
	error: { color:'#c62828', marginBottom:8 },
	itemRow: { padding:14, borderRadius:14, backgroundColor: COLORS.card, marginBottom:12, borderWidth:1, borderColor:'rgba(255,215,0,0.18)' },
	code: { fontWeight:'700', color:COLORS.gold, marginBottom:4 },
	meta: { color:'#ffe082', fontSize:13 },
	stoneInfo: { color:'#bfae6a', fontSize:11, marginTop:2 },
	closeBtn: { alignSelf:'flex-start', backgroundColor:COLORS.card, paddingVertical:8, paddingHorizontal:16, borderRadius:20, borderWidth:1, borderColor:COLORS.gold },
	closeBtnText: { color:COLORS.gold, fontWeight:'700', letterSpacing:0.5 },
});
