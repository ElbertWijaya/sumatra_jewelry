import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface Props extends TextInputProps { label: string; required?: boolean; }

export const Field: React.FC<Props> = ({ label, required, style, ...rest }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}{required && <Text style={{color:'#d33'}}> *</Text>}</Text>
      <TextInput placeholder={label} style={[styles.input, style]} placeholderTextColor={'#999'} {...rest} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4, color:'#444', textTransform:'uppercase' },
  input: { borderWidth:1, borderColor:'#ddd', backgroundColor:'#fff', paddingHorizontal:14, paddingVertical:11, borderRadius:10, fontSize:14 },
});
