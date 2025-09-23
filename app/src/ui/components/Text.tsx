import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { luxuryTheme as t } from '../theme/luxuryTheme';

export function Title(props: TextProps) {
  return <RNText {...props} style={[{ color: t.colors.text }, t.typography.title, props.style as TextStyle]} />
}
export function Subtitle(props: TextProps) {
  return <RNText {...props} style={[{ color: t.colors.textMuted }, t.typography.subtitle, props.style as TextStyle]} />
}
export function Body(props: TextProps) {
  return <RNText {...props} style={[{ color: t.colors.text }, t.typography.body, props.style as TextStyle]} />
}
export function Small(props: TextProps) {
  return <RNText {...props} style={[{ color: t.colors.textMuted }, t.typography.small, props.style as TextStyle]} />
}
