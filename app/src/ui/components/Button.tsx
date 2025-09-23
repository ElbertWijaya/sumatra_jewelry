import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, GestureResponderEvent } from 'react-native';
import { luxuryTheme as t } from '../theme/luxuryTheme';

type Props = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  variant?: 'gold' | 'outline' | 'subtle';
  compact?: boolean;
  style?: any;
};

export function Button({ title, onPress, loading, variant='gold', compact, style }: Props) {
  const base = {
    paddingVertical: compact ? 8 : 12,
    paddingHorizontal: compact ? 12 : 16,
    borderRadius: t.radius.md,
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
  };
  const variants: any = {
    gold: { backgroundColor: t.colors.primary, borderColor: t.colors.primaryAlt },
    outline: { backgroundColor: 'transparent', borderColor: t.colors.border },
    subtle: { backgroundColor: t.colors.badgeBg, borderColor: t.colors.border },
  };
  return (
    <TouchableOpacity disabled={loading} onPress={onPress} style={[base, variants[variant], style]}>
      {loading ? <ActivityIndicator color="#111" /> : null}
      <Text style={{ color: variant==='gold' ? '#111' : t.colors.text, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}
