import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconLeft?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconLeft,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[styles.touch, style, disabled && { opacity: 0.6 }]}
    >
      <LinearGradient
        colors={disabled ? ['#bfae6a', '#bfae6a'] : ['#FFD700', '#FFEA70']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#181512" style={{ marginRight: 8 }} />
        ) : iconLeft ? (
          <View style={{ marginRight: 8 }}>{iconLeft}</View>
        ) : null}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    borderRadius: 8, // Sudut tajam, bukan bulat penuh
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#fffbe6', // efek bevel tipis
  },
  text: {
    color: '#181512',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.7,
    textAlign: 'center',
  },
});
