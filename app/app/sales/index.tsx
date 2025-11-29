import React from 'react';
import { Stack } from 'expo-router';
import { SalesDashboardScreen } from '../../src/features/sales/screens/SalesDashboardScreen';

export default function SalesDashboardRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard Sales' }} />
      <SalesDashboardScreen />
    </>
  );
}
