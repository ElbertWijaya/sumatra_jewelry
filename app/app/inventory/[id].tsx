import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { InventoryDetailScreen } from '../../src/features/inventory/screens/InventoryDetailScreen';

export default function InventoryDetailRoute() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ title: `Inventory #${String(id||'')}` }} />
      <InventoryDetailScreen />
    </>
  );
}
