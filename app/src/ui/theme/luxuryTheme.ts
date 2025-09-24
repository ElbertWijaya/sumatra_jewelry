export const luxuryTheme = {
  colors: {
    background: "#f7f3ef",
    surface: "#fff8f1",
    primary: "#a9824e",        // Gold/Bronze
    primaryDark: "#6e4c1b",    // Dark brown
    accent: "#ffe066",         // Yellow accent
    border: "#dbc3a2",
    text: "#4e3b23",
    textSecondary: "#a9824e",
    error: "#d7263d",
    white: "#ffffff",
    disabled: "#d3c3b6",
  },
  font: {
    family: "Poppins, Inter, System",
    weightBold: "700",
    weightMedium: "500",
    weightRegular: "400",
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  spacing: (multiplier = 1) => 8 * multiplier,
  shadow: {
    card: {
      shadowColor: "#a9824e",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.11,
      shadowRadius: 6,
      elevation: 2,
    },
  },
};