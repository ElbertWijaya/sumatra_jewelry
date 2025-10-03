// Deprecated legacy InlineSelect – replaced by new select component.
import React from 'react';
import { View, Text } from 'react-native';

export const InlineSelect: React.FC<any> = ({ label }) => (
  <View style={{padding:8,borderWidth:1,borderColor:'#555',borderRadius:6,marginVertical:4}}>
    <Text style={{color:'#777'}}>{label || 'Legacy InlineSelect removed'}</Text>
  </View>
);

export default InlineSelect;
