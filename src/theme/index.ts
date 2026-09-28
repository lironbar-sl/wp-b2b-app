export const colors = {
  // Brand
  primary: '#0F172A',       // Slate 900 — primary text, headers, CTA bg
  primaryLight: '#1E293B',  // Slate 800
  accent: '#3B82F6',        // Blue 500 — interactive, focus, links
  accentLight: '#EFF6FF',   // Blue 50 — accent background tint
  accentDark: '#1D4ED8',    // Blue 700 — pressed state

  // Semantic
  success: '#10B981',       // Emerald 500
  successLight: '#ECFDF5',
  warning: '#F59E0B',       // Amber 500
  warningLight: '#FFFBEB',
  error: '#EF4444',         // Red 500
  errorLight: '#FEF2F2',
  info: '#6366F1',          // Indigo 500
  infoLight: '#EEF2FF',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAFC',    // Slate 50
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9', // Slate 100
  border: '#E2E8F0',        // Slate 200
  borderStrong: '#CBD5E1',  // Slate 300

  // Text
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textTertiary: '#94A3B8',  // Slate 400
  textInverse: '#FFFFFF',
  textDisabled: '#CBD5E1',

  // Inventory status
  statusInStock: '#10B981',
  statusLowStock: '#F59E0B',
  statusOutOfStock: '#EF4444',
  statusBackordered: '#6366F1',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  page: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  // Display
  display: {
    fontSize: 30,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  // UI
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.textTertiary,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 0.8,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
  },
  // Numeric — tabular for prices
  price: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
  priceLarge: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Hit slop for accessible tap targets (min 44pt)
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

const theme = { colors, spacing, radius, typography, shadows, animation, hitSlop };
export type Theme = typeof theme;
export default theme;
