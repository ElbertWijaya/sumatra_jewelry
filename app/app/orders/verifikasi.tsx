import React from 'react';
import { Stack } from 'expo-router';
import { MyOrdersScreen } from '../../src/features/orders/screens/MyOrdersScreen';
export default function OrdersVerifikasi() { return (<><Stack.Screen options={{ title: 'Order Verifikasi' }} /><MyOrdersScreen /></>); }
