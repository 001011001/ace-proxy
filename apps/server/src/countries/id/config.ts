export const ID_CONFIG = {
  country: 'ID',
  name: 'Indonesia 🇮🇩',
  locale: 'id-ID',
  language: 'id',
  currency: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', exchangeRateToCny: 2200 },
  domain: 'aceproxy.id',

  shipping: {
    provider: 'YUNTU' as const,
    costCny: {
      jabodetabek: {
        tiers: [
          { minKg: 0, maxKg: 1, perKg: 130, perPiece: 20, minCharge: 0.1 },
          { minKg: 1, maxKg: 10, perKg: 140, perPiece: 50, minCharge: 0.5 },
        ],
        estimatedDays: '7-9',
      },
      other: {
        tiers: [
          { minKg: 0, maxKg: 1, perKg: 150, perPiece: 30, minCharge: 0.1 },
          { minKg: 1, maxKg: 10, perKg: 150, perPiece: 60, minCharge: 0.5 },
        ],
        estimatedDays: '12-16',
      },
    },
    markup: { perKg: 40, perPiece: 10 },
    maxWeightKg: 10,
    maxDimensions: { maxLengthCm: 100, maxLWHSumCm: 240, maxSecondSideCm: 70 },
    additionalServices: {
      REPACK: { costCny: 4, label: '更换外包装' },
      COMPRESS: { costCny: 2, label: '包装压缩加固' },
      MERGE: { costCny: 4, label: '合单' },
      SPLIT: { costCny: 4, label: '分单' },
      RELABEL: { costCny: 2, label: '换单' },
    },
    unreachableProvinces: ['PAPUA', 'PAPUA BARAT', 'PAPUA SELATAN', 'PAPUA TENGAH', 'PAPUA PEGUNUNGAN', 'PAPUA BARAT DAYA', 'MALUKU', 'MALUKU UTARA'],
    jabodetabek: ['JAKARTA', 'JAKARTA PUSAT', 'JAKARTA UTARA', 'JAKARTA BARAT', 'JAKARTA SELATAN', 'JAKARTA TIMUR', 'BOGOR', 'DEPOK', 'TANGERANG', 'TANGERANG SELATAN', 'BEKASI'],
  },

  payment: {
    provider: 'XENDIT',
    methods: ['OVO', 'DANA', 'QRIS', 'VA_BCA', 'VA_MANDIRI', 'VA_BNI'],
  },

  pricing: {
    serviceFeePct: 0.12,
    riskPoolPct: 0.015,
    exchangeRateMarkup: 0.03,
    comparePlatform: 'Shopee ID',
    comparePriceMultiplier: 2.3,
  },

  holidays: [
    { name: 'Eid al-Fitr', month: 4, warmupDays: 30, theme: 'eid-green' },
    { name: 'Eid al-Adha', month: 6, warmupDays: 14, theme: 'eid-green' },
    { name: 'Independence Day', month: 8, warmupDays: 14, theme: 'merdeka-red' },
  ],

  maxDeclaredValueUsd: 150,
  redeliveryFeeCny: 60,
  insuranceRate: 0.007,
  insuranceMinFeeCny: 5,
};
