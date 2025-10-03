
// Legacy LoginScreen (deprecated). Intentionally stubbed to prevent usage.
// The actual login UI now lives in feature-based auth screens.
import React from 'react';
import { View, Text } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#000' }}>
      <Text style={{ color:'#ccc', fontSize:16 }}>Deprecated legacy LoginScreen. Use feature auth screens.</Text>
    </View>
  );
}