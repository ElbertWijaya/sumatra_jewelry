// Deprecated legacy FormSection – replaced by new form layout components.
import React from 'react';
import { View, Text } from 'react-native';

export const FormSection: React.FC<any> = ({ title }) => (
  <View style={{marginVertical:8,padding:12,borderWidth:1,borderColor:'#444'}}>
    <Text style={{color:'#777',fontWeight:'600'}}>{title || 'Legacy FormSection removed'}</Text>
  </View>
);

export default FormSection;
