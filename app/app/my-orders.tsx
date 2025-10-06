import React from 'react';
import { Stack } from 'expo-router';
import { MyOrdersScreen } from '../src/features/orders/screens/MyOrdersScreen';

export default function MyOrdersRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Order Saya' }} />
      <MyOrdersScreen />
    </>
  );
}
