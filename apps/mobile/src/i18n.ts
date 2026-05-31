export const translations = {
  zh: {
    home: '首页',
    arbiBot: 'AI 套利助手',
    currentStation: '当前站点',
    switchRole: '身份切换',
    shopper: '用户',
    partner: '团长',
    rider: '骑手',
    profitFlow: '实时套利瀑布流',
    totalProfit: '今日全网预估利润',
    ramadanSpecial: '🌙 斋月特惠',
    jakartaDesc: '雅加达站点吞吐量提升 40%，目前物流利差极大！',
  },
  id: {
    home: 'Beranda',
    arbiBot: 'Asisten ArbiBot AI',
    currentStation: 'Stasiun Saat Ini',
    switchRole: 'Ganti Peran',
    shopper: 'Pembeli',
    partner: 'Partner',
    rider: 'Kurir',
    profitFlow: 'Aliran Arbitrase Real-time',
    totalProfit: 'Estimasi Profit Jaringan Hari Ini',
    ramadanSpecial: '🌙 Spesial Ramadan',
    jakartaDesc: 'Kapasitas stasiun Jakarta naik 40%, selisih logistik sangat besar!',
  },
  en: {
    home: 'Home',
    arbiBot: 'ArbiBot AI Assistant',
    currentStation: 'Current Station',
    switchRole: 'Switch Role',
    shopper: 'Shopper',
    partner: 'Partner',
    rider: 'Rider',
    profitFlow: 'Real-time Arbitrage Flow',
    totalProfit: "Today's Network Estimated Profit",
    ramadanSpecial: '🌙 Ramadan Special',
    jakartaDesc: 'Jakarta throughput up 40%, logistics margin is massive!',
  }
};

export type Language = keyof typeof translations;
