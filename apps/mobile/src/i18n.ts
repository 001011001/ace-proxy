export const translations = {
  zh: {
    home: '首页',
    arbiBot: 'AI 选品助手',
    currentStation: '当前站点',
    switchRole: '身份切换',
    shopper: '用户',
    partner: '团长',
    rider: '骑手',
    profitFlow: '实时优质好货',
    totalProfit: '今日全网价格优势',
    ramadanSpecial: '🌙 斋月特惠',
    jakartaDesc: '雅加达站点吞吐量提升 40%，目前采购优势极大！',
  },
  id: {
    home: 'Beranda',
    arbiBot: 'Asisten Sourcing AI',
    currentStation: 'Stasiun Saat Ini',
    switchRole: 'Ganti Peran',
    shopper: 'Pembeli',
    partner: 'Partner',
    rider: 'Kurir',
    profitFlow: 'Temuan Produk Real-time',
    totalProfit: 'Keunggulan Harga Hari Ini',
    ramadanSpecial: '🌙 Spesial Ramadan',
    jakartaDesc: 'Kapasitas stasiun Jakarta naik 40%, keunggulan pengadaan sangat besar!',
  },
  en: {
    home: 'Home',
    arbiBot: 'AI Sourcing Assistant',
    currentStation: 'Current Station',
    switchRole: 'Switch Role',
    shopper: 'Shopper',
    partner: 'Partner',
    rider: 'Rider',
    profitFlow: 'Real-time Good Finds',
    totalProfit: "Today's Price Advantage",
    ramadanSpecial: '🌙 Ramadan Special',
    jakartaDesc: 'Jakarta throughput up 40%, sourcing advantage is massive!',
  }
};

export type Language = keyof typeof translations;
