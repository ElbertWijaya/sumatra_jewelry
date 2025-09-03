import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props { title: string; children: React.ReactNode; style?: ViewStyle }

export const FormSection: React.FC<Props> = ({ title, children, style }) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#222', letterSpacing: 0.5 },
  body: { gap: 12 },
});
