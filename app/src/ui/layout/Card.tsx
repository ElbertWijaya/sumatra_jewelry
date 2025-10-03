import React from 'react';
import { View, ViewProps } from 'react-native';
import { luxuryTheme as t } from '../theme/luxuryTheme';

export function Card({ style, children, ...rest }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.lg,
          borderColor: t.colors.border,
          borderWidth: 1,
          padding: t.spacing(1.5),
          ...t.shadow.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
