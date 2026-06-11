export const TH_CONFIG = {
  country: 'TH',
  name: 'Thailand 🇹🇭',
  locale: 'th-TH',
  language: 'th',
  currency: { code: 'THB', symbol: '฿', locale: 'th-TH', exchangeRateToCny: 5.0 },
  domain: 'aceproxy.co.th',

  shipping: {
    provider: 'YUNTU' as const,
    costCny: {
      charged: { perKg: 58, perPiece: 14, maxWeightKg: 25, estimatedDays: '5-8', volumetricDivisor: 5000 },
      general: { perKg: 51, perPiece: 8, maxWeightKg: 25, estimatedDays: '5-6', volumetricDivisor: 5000 },
    },
    markup: { perKg: 17, perPiece: 6 },
    maxWeightKg: 25,
    maxDimensions: { maxLengthCm: 60, maxLWHSumCm: 135, maxSecondSideCm: 40 },
    additionalServices: {
      REPACK: { costCny: 4, label: 'เปลี่ยนบรรจุภัณฑ์' },
      COMPRESS: { costCny: 2, label: 'บีบอัดแพ็คเกจ' },
      MERGE: { costCny: 4, label: 'รวมพัสดุ' },
      SPLIT: { costCny: 4, label: 'แยกพัสดุ' },
    },
  },

  payment: {
    provider: 'OMISE',
    methods: ['PROMPTPAY', 'TRUEMONEY', 'CREDIT_CARD'],
  },

  pricing: {
    serviceFeePct: 0.15,
    riskPoolPct: 0.015,
    exchangeRateMarkup: 0.03,
    comparePlatform: 'Shopee TH',
    comparePriceMultiplier: 2.1,
  },

  holidays: [
    { name: 'Songkran', month: 4, warmupDays: 21, theme: 'songkran-water' },
    { name: 'Loy Krathong', month: 11, warmupDays: 14, theme: 'loykratong-gold' },
    { name: 'Mother\'s Day', month: 8, warmupDays: 7, theme: 'mother-blue' },
  ],

  maxDeclaredValueUsd: 150,
  redeliveryFeeCny: 60,
  insuranceRate: 0.007,
  insuranceMinFeeCny: 5,
};
