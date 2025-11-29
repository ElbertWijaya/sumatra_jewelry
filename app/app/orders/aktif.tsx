import React from 'react';
import { Stack } from 'expo-router';
import { MyOrdersScreen } from '../../src/features/orders/screens/MyOrdersScreen';
export default function OrdersAktif() {
	return (
		<>
			<Stack.Screen options={{ title: 'Order Aktif' }} initialParams={{ filter: 'aktif' }} />
			<MyOrdersScreen />
		</>
	);
}
