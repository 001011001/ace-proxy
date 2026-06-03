export const translations = {
  zh: {
    home: '首页',
    arbiBot: 'AI 选品助手',
    currentStation: '当前站点',
    switchRole: '身份切换',
    shopper: '用户 (Sourcing)',
    partner: '指挥官 (Commander)',
    rider: '执行官 (Rider)',
    profitFlow: '实时优质好货',
    totalProfit: '今日精选价值',
    lebaranPremium: '🏆 开斋节精选',
    jakartaDesc: '雅加达站点吞吐量提升 40%，采购优势极大！',
  },
  id: {
    home: 'Beranda',
    arbiBot: 'Asisten Sourcing AI',
    currentStation: 'Stasiun Saat Ini',
    switchRole: 'Ganti Peran',
    shopper: 'Sourcing (Pembeli)',
    partner: 'Partner (Commander)',
    rider: 'Kurir (Executor)',
    profitFlow: 'Temuan Produk Real-time',
    totalProfit: 'Keunggulan Harga Hari Ini',
    lebaranPremium: '🏆 Lebaran Premium',
    jakartaDesc: 'Kapasitas stasiun Jakarta naik 40%, keunggulan pengadaan sangat besar!',
  },
  en: {
    home: 'Home',
    arbiBot: 'AI Sourcing Assistant',
    currentStation: 'Current Station',
    switchRole: 'Switch Role',
    shopper: 'Sourcing',
    partner: 'Commander',
    rider: 'Executor',
    profitFlow: 'Real-time Good Finds',
    totalProfit: "Today's Value Advantage",
    lebaranPremium: '🏆 Lebaran Premium',
    jakartaDesc: 'Jakarta throughput up 40%, sourcing advantage is massive!',
  }

};

export type Language = keyof typeof translations;
