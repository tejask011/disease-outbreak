// ─── Design System ───────────────────────────────────────────────
// Premium health-tech color palette, typography, and spacing tokens.

export const COLORS = {
  // Backgrounds
  bgDark: '#0B1120',
  bgMedium: '#121A2F',
  bgCard: 'rgba(255,255,255,0.06)',
  bgCardHover: 'rgba(255,255,255,0.10)',
  bgGlass: 'rgba(18, 26, 47, 0.65)',

  // Risk Levels
  high: '#FF4D4D',
  highGlow: 'rgba(255, 77, 77, 0.55)',
  highSoft: 'rgba(255, 77, 77, 0.15)',
  medium: '#FFA500',
  mediumGlow: 'rgba(255, 165, 0, 0.40)',
  mediumSoft: 'rgba(255, 165, 0, 0.15)',
  low: '#00C853',
  lowGlow: 'rgba(0, 200, 83, 0.35)',
  lowSoft: 'rgba(0, 200, 83, 0.15)',

  // Primary / Accent
  primary: '#00D4FF',
  primaryDark: '#0099CC',
  primaryGlow: 'rgba(0, 212, 255, 0.25)',
  primarySoft: 'rgba(0, 212, 255, 0.10)',

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: 'rgba(255,255,255,0.78)',
  textMuted: 'rgba(255,255,255,0.48)',
  textDark: '#0B1120',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.5)',
};

export const GRADIENTS = {
  background: ['#0B1120', '#121A2F', '#0B1120'],
  primaryCard: ['rgba(0,212,255,0.08)', 'rgba(0,212,255,0.02)'],
  highCard: ['rgba(255,77,77,0.12)', 'rgba(255,77,77,0.04)'],
  mediumCard: ['rgba(255,165,0,0.10)', 'rgba(255,165,0,0.03)'],
  lowCard: ['rgba(0,200,83,0.08)', 'rgba(0,200,83,0.02)'],
  header: ['rgba(0,212,255,0.15)', 'rgba(0,212,255,0.0)'],
  alertCard: ['rgba(255,77,77,0.15)', 'rgba(255,40,40,0.06)'],
};

export const FONTS = {
  bold: { fontWeight: '800' },
  semiBold: { fontWeight: '600' },
  medium: { fontWeight: '500' },
  regular: { fontWeight: '400' },
  light: { fontWeight: '300' },
};

export const SIZES = {
  // Font sizes — bumped for stronger hierarchy
  xxxl: 36,
  xxl: 28,
  xl: 23,
  lg: 19,
  md: 15.5,
  sm: 13.5,
  xs: 11.5,
  xxs: 9.5,

  // Spacing — wider for breathing room
  padding: 24,
  paddingSm: 14,
  paddingXs: 10,
  margin: 24,
  marginSm: 14,

  // Border radius
  radiusXl: 26,
  radiusLg: 22,
  radius: 18,
  radiusSm: 14,
  radiusXs: 10,
  radiusFull: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 14,
  }),
  glowSm: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  }),
};

export const getRiskColor = (level) => {
  switch (level?.toUpperCase()) {
    case 'HIGH':
      return COLORS.high;
    case 'MEDIUM':
      return COLORS.medium;
    case 'LOW':
      return COLORS.low;
    default:
      return COLORS.textMuted;
  }
};

export const getRiskGlow = (level) => {
  switch (level?.toUpperCase()) {
    case 'HIGH':
      return COLORS.highGlow;
    case 'MEDIUM':
      return COLORS.mediumGlow;
    case 'LOW':
      return COLORS.lowGlow;
    default:
      return COLORS.transparent;
  }
};

export const getRiskSoft = (level) => {
  switch (level?.toUpperCase()) {
    case 'HIGH':
      return COLORS.highSoft;
    case 'MEDIUM':
      return COLORS.mediumSoft;
    case 'LOW':
      return COLORS.lowSoft;
    default:
      return COLORS.bgCard;
  }
};

export const getRiskGradient = (level) => {
  switch (level?.toUpperCase()) {
    case 'HIGH':
      return GRADIENTS.highCard;
    case 'MEDIUM':
      return GRADIENTS.mediumCard;
    case 'LOW':
      return GRADIENTS.lowCard;
    default:
      return GRADIENTS.primaryCard;
  }
};
