import React from 'react';
import { Stack } from 'expo-router';
import { MyOrdersScreen } from '../../src/features/orders/screens/MyOrdersScreen';
export default function OrdersDitugaskan() { return (<><Stack.Screen options={{ title: 'Order Ditugaskan' }} /><MyOrdersScreen /></>); }
