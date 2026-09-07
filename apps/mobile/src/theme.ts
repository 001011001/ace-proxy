/**
 * AceProxy Design Tokens — Mobile (Expo/React Native)
 *
 * 完全对齐 DESIGN.md v1.0
 * Track 1: Consumer Marketplace (mobile-first, warm terracotta on warm-white canvas)
 * Track 2: Admin Console (desktop, dark-nav + data-dense white)
 *
 * Pill mandate: 所有可点击元素使用 rounded.pill (9999px)
 * Typographic split: Plus Jakarta Sans (display/heading) → system font; Inter (body) → system font
 */

// ─── Brand & Accent (DESIGN.md §Colors) ──────────────────────────────
export const BRAND = {
  terracotta: '#d45d3a' as const,        // primary CTA
  terracottaPress: '#b8492a' as const,   // pressed/hover state
  terracottaSoft: '#fce8e2' as const,    // card hover borders, KPI highlight
  ocean: '#0f7b8c' as const,            // trust/shipping/logistics accent
  oceanSoft: '#e0f4f7' as const,         // trust-signal card fills
};

// ─── Semantic Colors ──────────────────────────────────────────────────
export const SEMANTIC = {
  success: '#1ea366' as const,
  successSoft: '#e6f7ee' as const,
  warning: '#e8a020' as const,
  warningSoft: '#fef7e6' as const,
  error: '#d14343' as const,
  errorSoft: '#fde8e8' as const,
  priceRed: '#e53935' as const,         // final/discounted prices ONLY
  badgeYellow: '#f5a623' as const,       // "New", "Hot", "Best Deal"
};

// ─── Surface ──────────────────────────────────────────────────────────
export const SURFACE = {
  canvas: '#ffffff' as const,           // admin console default
  canvasWarm: '#fefaf7' as const,        // consumer marketplace default
  canvasGray: '#f5f5f8' as const,        // section backgrounds, search bars
  hairline: '#e8e8ef' as const,          // card borders, table dividers
  hairlineInput: '#c4c4d0' as const,     // form input borders
};

// ─── Text ─────────────────────────────────────────────────────────────
export const TEXT = {
  ink: '#1a1a2e' as const,               // default body text
  inkSecondary: '#3d3d5c' as const,      // secondary body, descriptions
  inkMute: '#6b6b80' as const,           // helper text, placeholders
  onPrimary: '#ffffff' as const,          // text on terracotta/ocean bg
};

// ─── Country Accent ───────────────────────────────────────────────────
export const COUNTRY = {
  id: '#ce1126' as const,                // 🇮🇩 Indonesia
  th: '#2d2a4a' as const,               // 🇹🇭 Thailand
  ph: '#0038a8' as const,               // 🇵🇭 Philippines
  br: '#009b3a' as const,               // 🇧🇷 Brazil
};

// ─── Consumer Theme (DESIGN.md Track 1) ──────────────────────────────
export const COLORS = {
  consumer: {
    primary: BRAND.terracotta,
    primaryPress: BRAND.terracottaPress,
    primarySoft: BRAND.terracottaSoft,
    secondary: BRAND.ocean,
    secondarySoft: BRAND.oceanSoft,
    background: SURFACE.canvasWarm,
    surface: SURFACE.canvas,
    text: TEXT.ink,
    textSecondary: TEXT.inkSecondary,
    textMute: TEXT.inkMute,
    textOnPrimary: TEXT.onPrimary,
  },
  // Legacy backward compatibility
  user: {
    primary: BRAND.terracotta,
    primaryPress: BRAND.terracottaPress,
    primarySoft: BRAND.terracottaSoft,
    secondary: BRAND.ocean,
    secondarySoft: BRAND.oceanSoft,
    background: SURFACE.canvasWarm,
    surface: SURFACE.canvas,
    text: TEXT.ink,
    textSecondary: TEXT.inkSecondary,
    textMute: TEXT.inkMute,
    textOnPrimary: TEXT.onPrimary,
  },
  white: SURFACE.canvas,
  black: '#000000',
  error: SEMANTIC.error,
  success: SEMANTIC.success,
  gray: {
    50: SURFACE.canvasGray,
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
};

export type RoleTheme = typeof COLORS.consumer;

export const theme = {
  CONSUMER: COLORS.consumer,
} as const;

// ─── Spacing (8px base, DESIGN.md §Spacing) ───────────────────────────
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
  massive: 64,
};

// ─── Typography (DESIGN.md §Typography) ────────────────────────────────
// RN 不支持 web fonts，使用系统字体映射：
//   Plus Jakarta Sans → system sans-serif (heading weight)
//   Inter → system sans-serif (body weight)
//   tnum (tabular figures) → fontVariant: ['tabular-nums'] on iOS
export const TYPOGRAPHY = {
  // Display (Plus Jakarta Sans → system, 700 weight)
  displayXl: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 52,
    letterSpacing: -0.96,
  },
  displayLg: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 42,
    letterSpacing: -0.72,
  },
  displayMd: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.56,
  },
  // Headings (600 weight)
  headingXl: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.24,
  },
  headingLg: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  headingMd: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  headingSm: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  // Body (Inter → system, 400 weight)
  bodyLg: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  bodyMd: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySm: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 19,
    letterSpacing: 0,
  },
  bodyTabular: {
    fontSize: 15,
    fontWeight: '450' as const,
    lineHeight: 22,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'] as const,
  },
  // Button
  buttonLg: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  buttonMd: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
  buttonSm: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 12,
    letterSpacing: 0.24,
  },
  // Price (tabular figures)
  priceXxl: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.56,
    fontVariant: ['tabular-nums'] as const,
  },
  priceLg: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.22,
    fontVariant: ['tabular-nums'] as const,
  },
  priceMd: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'] as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '450' as const,
    lineHeight: 17,
    letterSpacing: 0.12,
  },
  micro: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 15,
    letterSpacing: 0,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 11,
    letterSpacing: 0.44,
  },
  // Legacy backward compatibility
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
};

// ─── Border Radius (DESIGN.md §Shapes) ────────────────────────────────
export const ROUNDED = {
  none: 0,
  xs: 3,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 9999,
};

// ─── Shadows / Elevation (DESIGN.md §Elevation) ───────────────────────
export const SHADOWS = {
  level0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level2: {
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  level3: {
    shadowColor: BRAND.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  level4: {
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  // Legacy (kept for backward compat — maps to DESIGN.md levels)
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

// ─── Borders (DESIGN.md — Pill Mandate: no brutalist, no black borders) ─
export const BORDERS = {
  hairline: { borderWidth: 1, borderColor: SURFACE.hairline },
  input: { borderWidth: 1, borderColor: SURFACE.hairlineInput },
  inputFocused: { borderWidth: 1.5, borderColor: BRAND.terracotta },
  // Pill-friendly card border (replaces brutalist)
  card: { borderWidth: 1, borderColor: SURFACE.hairline },
  cardHover: { borderWidth: 1, borderColor: BRAND.terracottaSoft },
};

// ─── Festival Themes (DESIGN.md 节日主题) ─────────────────────────────
export const FESTIVALS = {
  DEFAULT: {
    id: 'DEFAULT',
    background: SURFACE.canvasWarm,
    primary: BRAND.terracotta,
    secondary: BRAND.terracottaPress,
    accent: '#000000',
    bannerText: 'AceProxy Global Sourcing',
    showStockAlert: false,
  },
  EID_WARMTH: {
    id: 'EID_WARMTH',
    background: '#FFF7ED',
    primary: BRAND.terracotta,
    secondary: '#9A3412',
    accent: '#000000',
    bannerText: 'LEBARAN 2026: CELEBRATE IN STYLE',
    showStockAlert: true,
    shadowOffset: { width: 4, height: 4 },
  },
  EID_PREMIUM: {
    id: 'EID_PREMIUM',
    background: '#064E3B',
    primary: '#F59E0B',
    secondary: '#FFFFFF',
    accent: '#F59E0B',
    bannerText: 'LEBARAN 2026: ELITE STEWARD SELECTION',
    showStockAlert: true,
    shadowOffset: { width: 8, height: 8 },
  },
  EID_FINANCIAL: {
    id: 'EID_FINANCIAL',
    background: '#FFFFFF',
    primary: '#1E3A8A',
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
  },
};

export const getActiveFestival = (countryCode: string) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (countryCode === 'ID' && month >= 2 && month <= 4) {
    return FESTIVALS.EID_PREMIUM;
  }

  if (month <= 2) {
    return FESTIVALS.CHINESE_NEW_YEAR;
  }

  return FESTIVALS.DEFAULT;
};

// ─── Component Presets (DESIGN.md §Components) ────────────────────────
export const COMPONENTS = {
  buttonPrimaryPill: {
    backgroundColor: BRAND.terracotta,
    color: TEXT.onPrimary,
    ...TYPOGRAPHY.buttonLg,
    borderRadius: ROUNDED.pill,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    color: BRAND.terracotta,
    ...TYPOGRAPHY.buttonLg,
    borderRadius: ROUNDED.pill,
    paddingVertical: 11,
    paddingHorizontal: 27,
    borderWidth: 1.5,
    borderColor: BRAND.terracotta,
  },
  buttonOceanPill: {
    backgroundColor: BRAND.ocean,
    color: TEXT.onPrimary,
    ...TYPOGRAPHY.buttonMd,
    borderRadius: ROUNDED.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    color: TEXT.inkSecondary,
    ...TYPOGRAPHY.buttonMd,
    borderRadius: ROUNDED.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonDanger: {
    backgroundColor: SEMANTIC.error,
    color: TEXT.onPrimary,
    ...TYPOGRAPHY.buttonMd,
    borderRadius: ROUNDED.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cardProduct: {
    backgroundColor: SURFACE.canvas,
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: SURFACE.hairline,
    overflow: 'hidden' as const,
  },
  cardTrust: {
    backgroundColor: BRAND.oceanSoft,
    borderRadius: ROUNDED.md,
    padding: 16,
  },
  cardPricingCompare: {
    backgroundColor: SEMANTIC.warningSoft,
    borderRadius: ROUNDED.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchBar: {
    backgroundColor: SURFACE.canvasGray,
    borderRadius: ROUNDED.pill,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  pillTagPrimary: {
    backgroundColor: BRAND.terracottaSoft,
    color: BRAND.terracotta,
    ...TYPOGRAPHY.badge,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillTagOcean: {
    backgroundColor: BRAND.oceanSoft,
    color: BRAND.ocean,
    ...TYPOGRAPHY.badge,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillTagSuccess: {
    backgroundColor: SEMANTIC.successSoft,
    color: SEMANTIC.success,
    ...TYPOGRAPHY.badge,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillTagWarning: {
    backgroundColor: SEMANTIC.warningSoft,
    color: SEMANTIC.warning,
    ...TYPOGRAPHY.badge,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillTagError: {
    backgroundColor: SEMANTIC.errorSoft,
    color: SEMANTIC.error,
    ...TYPOGRAPHY.badge,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeSave: {
    backgroundColor: SEMANTIC.error,
    color: TEXT.onPrimary,
    ...TYPOGRAPHY.badge,
    borderRadius: ROUNDED.pill,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  bottomNav: {
    backgroundColor: SURFACE.canvas,
    paddingTop: 8,
    paddingBottom: 20,
  },
};
