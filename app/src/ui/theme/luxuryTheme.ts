export const luxuryTheme = {
  colors: {
    background: '#0d0f12',
    surface: '#141821',
    surfaceElevated: '#1b2130',
    primary: '#D4AF37', // gold
    primaryAlt: '#C5A028',
    text: '#EAEFF4',
    textMuted: '#AEB7C2',
    border: '#273142',
    success: '#59d185',
    warning: '#ffcd63',
    danger: '#ff6b6b',
    badgeBg: '#1f2633',
  },
  spacing: (n: number) => n * 8,
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  typography: {
    title: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.2 },
    subtitle: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 0.2 },
    body: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.3 },
  }
};

export type LuxuryTheme = typeof luxuryTheme;
