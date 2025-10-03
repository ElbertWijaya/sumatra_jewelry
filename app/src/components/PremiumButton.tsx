// Deprecated legacy PremiumButton – replaced by new button components.
import React from 'react';
import { View, Text } from 'react-native';

export const PremiumButton: React.FC<any> = ({ title }) => (
  <View style={{paddingVertical:10,paddingHorizontal:16,backgroundColor:'#222',borderRadius:12,borderWidth:1,borderColor:'#555'}}>
    <Text style={{color:'#bbb',fontWeight:'600'}}>{title || 'Legacy PremiumButton'}</Text>
  </View>
);

export default PremiumButton;
