// Deprecated legacy CreateOrderScreen file – fully truncated.
// Use features/orders/screens/CreateOrderScreen instead.
import React from 'react';
import { View, Text } from 'react-native';

export const CreateOrderScreen: React.FC<{ onCreated?: () => void }> = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
    <Text style={{ color: '#bbb', padding: 24, textAlign: 'center' }}>
      Legacy CreateOrderScreen removed. Use feature/orders/screens/CreateOrderScreen.
    </Text>
  </View>
);

export default CreateOrderScreen;
