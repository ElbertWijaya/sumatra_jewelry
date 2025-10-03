// Deprecated legacy Field component – replaced by new UI atoms.
import React from 'react';
import { View, Text } from 'react-native';

export const Field: React.FC<any> = () => (
  <View style={{padding:12,borderWidth:1,borderColor:'#333'}}>
    <Text style={{color:'#888'}}>Legacy Field component removed.</Text>
  </View>
);

export default Field;
