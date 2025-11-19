import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { InventoryListScreen } from '../../src/features/inventory/screens/InventoryListScreen';

export default function InventoryIndexRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Stok Inventory' }} />
      <InventoryListScreen />
    </>
  );
}
