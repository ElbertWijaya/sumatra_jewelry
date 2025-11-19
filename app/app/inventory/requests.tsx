import React from 'react';
import { Stack } from 'expo-router';
import { InventoryRequestsScreen } from '../../src/features/inventory/screens/InventoryRequestsScreen';

export default function InventoryRequestsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Request Inventory' }} />
      <InventoryRequestsScreen />
    </>
  );
}
