// Deprecated legacy MyTasksScreen – fully removed.
// Use feature-based tasks screens instead.
import React from 'react';
import { View, Text } from 'react-native';

export default function MyTasksScreen() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#000'}}>
      <Text style={{color:'#bbb',padding:24,textAlign:'center'}}>
        Legacy MyTasksScreen removed. Use feature tasks implementation.
      </Text>
    </View>
  );
}
