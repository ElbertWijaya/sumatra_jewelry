// Deprecated legacy OrdersListScreen. Replaced by feature-based orders module screens.
import React from 'react';
import { View, Text } from 'react-native';

export const OrdersListScreen: React.FC = () => {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#111' }}>
      <Text style={{ color:'#bbb' }}>Legacy OrdersListScreen removed. Use feature/orders screens.</Text>
    </View>
  );
};
