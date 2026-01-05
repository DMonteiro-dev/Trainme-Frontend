export const theme = {
  colors: {
    // Shared colors
    primary: '#7A5AF8',
    primaryDark: '#5F3DC4',
    primarySoft: '#E4D9FF',
    secondary: '#F59E0B',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#eab308',

    // Dark mode (default)
    background: '#05060A',
    surface: '#0E1018',
    surfaceAlt: '#131624',
    border: '#1F2335',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
  },
  lightColors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radii: {
    sm: '6px',
    md: '12px',
    pill: '9999px',
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;

export type Theme = typeof theme;
