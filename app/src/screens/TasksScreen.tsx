// Deprecated legacy TasksScreen – fully removed.
// Use feature-based tasks/order workflow screens instead.
import React from 'react';
import { View, Text } from 'react-native';

export default function TasksScreen() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#000'}}>
      <Text style={{color:'#bbb',padding:24,textAlign:'center'}}>
        Legacy TasksScreen removed. Use feature tasks module.
      </Text>
    </View>
  );
}

