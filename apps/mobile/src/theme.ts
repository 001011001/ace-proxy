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
  // Neo-Brutalism Hard Shadows
  brutalist: {
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const BORDERS = {
  brutalist: {
    borderWidth: 4,
    borderColor: '#000000',
  },
};

export const FESTIVALS = {
  DEFAULT: {
    id: 'DEFAULT',
    background: '#F8FAFC',
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#000000',
    bannerText: 'AceProxy Global Sourcing',
    showStockAlert: false,
  },
  // 方案 1: 温馨传统版 (Tradition & Warmth)
  EID_WARMTH: {
    id: 'EID_WARMTH',
    background: '#FFF7ED', // 暖桃色
    primary: '#F97316',
    secondary: '#9A3412',
    accent: '#000000',
    bannerText: 'LEBARAN 2026: CELEBRATE IN STYLE',
    showStockAlert: true,
    shadowOffset: { width: 4, height: 4 },
  },
  // 方案 2: 卓越管家版 (Premium Steward) - RECOMMENDED
  EID_PREMIUM: {
    id: 'EID_PREMIUM',
    background: '#064E3B', // 极深绿色 (Forest Green)
    primary: '#F59E0B', // 金色 (Amber/Gold)
    secondary: '#FFFFFF',
    accent: '#F59E0B',
    bannerText: 'LEBARAN 2026: ELITE STEWARD SELECTION',
    showStockAlert: true,
    shadowOffset: { width: 8, height: 8 },
  },
  // 方案 3: 极简金融版 (Financial Minimalist)
  EID_FINANCIAL: {
    id: 'EID_FINANCIAL',
    background: '#FFFFFF', // 纯白
    primary: '#1E3A8A', // 皇家蓝
    secondary: '#1E293B',
    accent: '#000000',
    bannerText: 'LEBARAN 2026: PRIORITY SOURCING',
    showStockAlert: true,
    shadowOffset: { width: 2, height: 2 },
  },
  CHINESE_NEW_YEAR: {
    id: 'CHINESE_NEW_YEAR',
    background: '#FEF2F2',
    primary: '#DC2626',
    secondary: '#FACC15',
    accent: '#000000',
    bannerText: 'CNY 2026: SPRING FESTIVAL SELECTION',
    showStockAlert: true,
    shadowOffset: { width: 6, height: 6 },
  }
};

export const getActiveFestival = (countryCode: string) => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Mock Logic for Eid 2026 (Approx March-April)
  if (countryCode === 'ID' && month >= 2 && month <= 4) {
    return FESTIVALS.EID_PREMIUM;
  }

  // Mock Logic for CNY (Jan-Feb)
  if (month <= 2) {
    return FESTIVALS.CHINESE_NEW_YEAR;
  }

  return FESTIVALS.DEFAULT;
};
