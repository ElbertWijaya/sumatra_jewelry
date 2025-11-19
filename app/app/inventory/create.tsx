import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { InventoryCreateScreen } from '../../src/features/inventory/screens/InventoryCreateScreen';

export default function InventoryCreateRoute() {
  const { orderId } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ title: 'Masukkan ke Inventory' }} />
      <InventoryCreateScreen />
    </>
  );
}
