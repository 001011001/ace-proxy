export const PH_CONFIG = {
  country: 'PH',
  name: 'Philippines 🇵🇭',
  locale: 'en-PH',
  language: 'en',
  currency: { code: 'PHP', symbol: '₱', locale: 'en-PH', exchangeRateToCny: 7.8 },
  domain: 'aceproxy.ph',

  shipping: {
    provider: 'YUNTU' as const,
    costCny: {
      charged: {
        tiers: [
          { minKg: 0, maxKg: 1, perKg: 65, perPiece: 15 },
          { minKg: 1, maxKg: 10, perKg: 62, perPiece: 50 },
        ],
        estimatedDays: '8-10',
        volumetricDivisor: 0,
      },
      general: {
        tiers: [
          { minKg: 0, maxKg: 1, perKg: 44, perPiece: 15 },
          { minKg: 1, maxKg: 10, perKg: 46, perPiece: 50 },
        ],
        estimatedDays: '5-6',
        volumetricDivisor: 0,
      },
    },
    markup: { perKg: 20, perPiece: 7 },
    maxWeightKg: 10,
    maxDimensions: { maxLengthCm: 100, maxLWHSumCm: 300 },
    additionalServices: {
      REPACK: { costCny: 4, label: 'Repackaging' },
      COMPRESS: { costCny: 2, label: 'Compress & Reinforce' },
      MERGE: { costCny: 4, label: 'Consolidation' },
      SPLIT: { costCny: 4, label: 'Split' },
    },
  },

  payment: {
    provider: 'PAYMONGO',
    methods: ['GCASH', 'MAYA', 'GRABPAY', 'CREDIT_CARD'],
  },

  pricing: {
    serviceFeePct: 0.12,
    riskPoolPct: 0.02,
    exchangeRateMarkup: 0.04,
    comparePlatform: 'Shopee PH',
    comparePriceMultiplier: 2.2,
  },

  holidays: [
    { name: 'Christmas', month: 12, warmupDays: 90, theme: 'christmas-red' },
    { name: 'All Saints\' Day', month: 11, warmupDays: 30, theme: 'saints-purple' },
    { name: 'Holy Week', month: 3, warmupDays: 14, theme: 'lent-purple' },
  ],

  maxDeclaredValueUsd: 170,
  redeliveryFeeCny: 60,
  insuranceRate: 0.007,
  insuranceMinFeeCny: 5,
};
