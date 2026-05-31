export const COLORS = {
  user: {
    primary: '#F97316', // Vibrant Orange
    secondary: '#FB923C',
    background: '#FFF7ED',
  },
  partner: {
    primary: '#1E3A8A', // Deep Navy
    secondary: '#3B82F6',
    background: '#EFF6FF',
  },
  rider: {
    primary: '#10B981', // Emerald Green
    secondary: '#34D399',
    background: '#ECFDF5',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#10B981',
};

export type RoleTheme = typeof COLORS.user;
export const theme = {
  USER: COLORS.user,
  PARTNER: COLORS.partner,
  RIDER: COLORS.rider,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
};
