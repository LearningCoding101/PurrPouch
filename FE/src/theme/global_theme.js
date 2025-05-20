// Theme options with different font configurations and helpers for easy use

// Base theme structure that both themes will extend
const baseTheme = {
  colors: {
    primary: "#4285f4",
    secondary: "#646cff",
    accent: "#f44336",
    background: "#ffffff",
    text: "#213547",
  },
  spacing: {
    small: "0.5rem",
    base: "1rem",
    large: "1.5rem",
    xlarge: "2rem",
  },
  borderRadius: {
    small: "4px",
    base: "8px",
    large: "12px",
  },
  shadows: {
    small: "0 1px 3px rgba(0,0,0,0.12)",
    base: "0 2px 4px rgba(0,0,0,0.15)",
    large: "0 4px 8px rgba(0,0,0,0.2)",
  },
  fontSize: {
    small: "0.875rem",
    base: "1rem",
    large: "1.25rem",
    xlarge: "1.5rem",
    xxlarge: "2rem",
    display: "3rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
};

// Theme with Luckiest Guy as heading font
const luckyTheme = {
  ...baseTheme,
  id: "lucky",
  typography: {
    fontFamily: {
      heading: "Luckiest Guy",
      body: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    fontSize: baseTheme.fontSize,
    fontWeight: baseTheme.fontWeight,
  },
  fontFace: `
    @font-face {
      font-family: 'Luckiest Guy';
      font-style: normal;
      font-weight: 400;
      src: url('/src/assets/font/LuckiestGuy-Regular.ttf') format('truetype');
      font-display: swap;
    }
  `,
};

// Theme with Spline Sans as the main font
const splineTheme = {
  ...baseTheme,
  id: "spline",
  colors: {
    ...baseTheme.colors,
    primary: "#646cff",
    secondary: "#4285f4",
  },
  typography: {
    fontFamily: {
      heading: '"Spline Sans", sans-serif',
      body: '"Spline Sans", sans-serif',
    },
    fontSize: baseTheme.fontSize,
    fontWeight: baseTheme.fontWeight,
  },
  fontFace: `
    @font-face {
      font-family: 'Spline Sans';
      src: url('/src/assets/font/SplineSans-SemiBold.ttf') format('truetype');
      font-display: swap;
    }
  `,
};

// Default theme (using Luckiest Guy configuration)
const theme = luckyTheme;

// Export everything in one bundle for easy importing
export { luckyTheme, splineTheme };
export default theme;
