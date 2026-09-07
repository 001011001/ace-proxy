import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  User, ShoppingBag, Wallet, MapPin, Heart, Settings,
  ArrowRight, Home, Package, LogOut, RefreshCw,
  Clock, TrendingUp, ChevronRight, X, ArrowLeft,
  Smartphone, Key
} from 'lucide-react';

// ─── Helpers ───
function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface OrderSummary {
  id: string;
  status: string;
  totalIdr: number;
  productCount: number;
  createdAt: string;
}

interface WalletSummary {
  availableBalance?: number;
  pendingBalance?: number;
  totalSaved?: number;
}

type Tab = 'dashboard' | 'orders' | 'wallet' | 'addresses';

// ─── Translation ───
type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'Akun Saya — AceProxy',
    dashboard: 'Dashboard',
    orders: 'Pesanan Saya',
    wallet: 'Dompet',
    addresses: 'Alamat',
    welcome: 'Halo,',
    member: 'Anggota',
    totalOrders: 'Total Pesanan',
    totalSpent: 'Total Belanja',
    savedThisMonth: 'Hemat Bulan Ini',
    balance: 'Saldo',
    topUp: 'Isi Saldo',
    recentOrders: 'Pesanan Terbaru',
    viewAll: 'Lihat Semua',
    orderStatus: {
      pending: 'Menunggu',
      paid: 'Dibayar',
      purchased: 'Dibeli',
      shipping: 'Dikirim',
      delivered: 'Diterima',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    },
    quickLinks: 'Pintasan',
    linkCart: 'Keranjang',
    linkProducts: 'Belanja',
    linkArbiBot: 'ArbiBot',
    linkWishlist: 'Favorit',
    logout: 'Keluar',
    loading: 'Memuat...',
    needLogin: 'Silakan masuk untuk melihat akun Anda.',
    goLogin: 'Masuk / Daftar',
    backToHome: 'Kembali ke Beranda',
    noOrders: 'Belum ada pesanan.',
    startShopping: 'Mulai Belanja',
    history: 'Riwayat Transaksi',
    noTransactions: 'Belum ada transaksi.',
  },
  EN: {
    title: 'My Account — AceProxy',
    dashboard: 'Dashboard',
    orders: 'My Orders',
    wallet: 'Wallet',
    addresses: 'Addresses',
    welcome: 'Hello,',
    member: 'Member',
    totalOrders: 'Total Orders',
    totalSpent: 'Total Spent',
    savedThisMonth: 'Saved This Month',
    balance: 'Balance',
    topUp: 'Top Up',
    recentOrders: 'Recent Orders',
    viewAll: 'View All',
    orderStatus: {
      pending: 'Pending',
      paid: 'Paid',
      purchased: 'Purchased',
      shipping: 'Shipping',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    quickLinks: 'Quick Links',
    linkCart: 'Cart',
    linkProducts: 'Shop',
    linkArbiBot: 'ArbiBot',
    linkWishlist: 'Wishlist',
    logout: 'Logout',
    loading: 'Loading...',
    needLogin: 'Please log in to view your account.',
    goLogin: 'Sign In / Register',
    backToHome: 'Back to Home',
    noOrders: 'No orders yet.',
    startShopping: 'Start Shopping',
    history: 'Transaction History',
    noTransactions: 'No transactions yet.',
  },
  ZH: {
    title: '我的账户 — AceProxy',
    dashboard: '控制台',
    orders: '我的订单',
    wallet: '钱包',
    addresses: '地址',
    welcome: '你好，',
    member: '会员',
    totalOrders: '订单总数',
    totalSpent: '累计消费',
    savedThisMonth: '本月节省',
    balance: '余额',
    topUp: '充值',
    recentOrders: '最近订单',
    viewAll: '查看全部',
    orderStatus: {
      pending: '待处理',
      paid: '已付款',
      purchased: '已采购',
      shipping: '运输中',
      delivered: '已送达',
      completed: '已完成',
      cancelled: '已取消',
    },
    quickLinks: '快捷入口',
    linkCart: '购物车',
    linkProducts: '去购物',
    linkArbiBot: 'ArbiBot',
    linkWishlist: '收藏',
    logout: '退出登录',
    loading: '加载中...',
    needLogin: '请先登录查看账户。',
    goLogin: '登录 / 注册',
    backToHome: '返回首页',
    noOrders: '暂无订单。',
    startShopping: '去购物',
    history: '交易记录',
    noTransactions: '暂无交易记录。',
  },
};

// ─── Status colors ───
function statusBadge(status: string, t: any) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-400',
    paid: 'bg-blue-50 text-blue-800 border-blue-400',
    purchased: 'bg-purple-50 text-purple-800 border-purple-400',
    shipping: 'bg-orange-50 text-orange-800 border-orange-400',
    delivered: 'bg-green-50 text-green-800 border-green-400',
    completed: 'bg-green-50 text-green-800 border-green-400',
    cancelled: 'bg-red-50 text-red-800 border-red-400',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 border-2 text-[10px] font-display font-bold uppercase ${colors[status] || 'bg-gray-50 border-gray-300'}`}>
      {(t.orderStatus as any)[status] || status}
    </span>
  );
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('aceproxy_token');
  } catch { return null; }
}

export default function AccountPage() {
  const [lang, setLang] = useState<Lang>('ID');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [wallet, setWallet] = useState<WalletSummary>({});
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = T[lang];

  useEffect(() => {
    setMounted(true);
    fetchAccountData();
  }, []);

  async function fetchAccountData() {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch user info
      const userRes = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const userJson = await userRes.json();
        setUser(userJson.data || userJson);
        setNeedsLogin(false);
      } else {
        setNeedsLogin(true);
      }

      // Fetch orders
      try {
        const orderRes = await fetch('/api/v1/order/list?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (orderRes.ok) {
          const orderJson = await orderRes.json();
          setOrders(orderJson.data?.items || orderJson.data || []);
        }
      } catch { /* orders optional */ }

      // Fetch wallet/vault
      try {
        const vaultRes = await fetch('/api/v1/vault/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (vaultRes.ok) {
          const vaultJson = await vaultRes.json();
          const data = vaultJson.data || vaultJson;
          setWallet({
            availableBalance: data.availableBalance || data.totalBalance || 0,
            pendingBalance: data.pendingBalance || 0,
            totalSaved: data.totalSaved || 0,
          });
        }
      } catch { /* vault optional */ }
    } catch {
      setNeedsLogin(true);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem('aceproxy_token');
      localStorage.removeItem('aceproxy_user');
    } catch { /* ignore */ }
    setUser(null);
    setNeedsLogin(true);
  }

  // Loading
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center">
        <div className="text-center py-20 bg-white border-4 border-black px-10" style={{ boxShadow: '6px 6px 0 #000' }}>
          <RefreshCw size={40} className="animate-spin mx-auto mb-5 text-terracotta" />
          <p className="font-bold text-ink-mute">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (needsLogin || !user) {
    return (
      <>
        <Head><title>{t.title}</title></Head>
        <div className="min-h-screen bg-canvas-warm font-body flex flex-col">
          <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center h-16">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                  <span className="font-display font-black text-lg tracking-tight hidden sm:block">ACEPROXY</span>
                </Link>
              </div>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              <div className="bg-white border-4 border-black p-8 text-center" style={{ boxShadow: '8px 8px 0 #000' }}>
                <User size={56} className="mx-auto mb-5 text-ink-mute" />
                <h1 className="font-display text-xl font-black text-ink uppercase mb-3">{t.needLogin}</h1>
                <div className="flex flex-col gap-3 mt-6">
                  <Link href="/login" className="btn-brutal text-base">
                    {t.goLogin} <ArrowRight size={18} />
                  </Link>
                  <Link href="/" className="text-sm font-bold text-ink-mute hover:text-terracotta transition-colors">
                    <ArrowLeft size={14} className="inline mr-1" />{t.backToHome}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Logged in — Account Dashboard
  return (
    <>
      <Head><title>{t.title}</title></Head>
      <div className="min-h-screen bg-canvas-warm font-body">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                <span className="font-display font-black text-lg text-ink tracking-tight hidden sm:block">ACEPROXY</span>
              </Link>
              <div className="flex items-center gap-2.5">
                <Link href="/cart" className="relative p-2 border-3 border-black bg-white hover:bg-canvas-gray transition-colors">
                  <ShoppingBag size={20} className="text-ink" />
                </Link>
                <Link href="/" className="text-xs font-bold text-ink-mute hover:text-terracotta transition-colors hidden sm:flex items-center gap-1">
                  <Home size={14} /> {t.backToHome}
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* User Card */}
          <div className="bg-terracotta border-4 border-black p-6 sm:p-8 mb-6" style={{ boxShadow: '6px 6px 0 #000' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-3 border-white bg-white/20 flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{t.welcome}</p>
                  <h2 className="font-display text-2xl font-black text-white">{user.name || user.email}</h2>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-white/20 text-white text-[10px] font-display font-bold uppercase">
                    {t.member}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border-3 border-white text-white font-display font-bold text-xs uppercase
                  hover:bg-white hover:text-terracotta transition-colors">
                <LogOut size={14} /> {t.logout}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <ShoppingBag size={20} />, label: t.totalOrders, value: orders.length.toString(), color: 'bg-white' },
              { icon: <TrendingUp size={20} />, label: t.totalSpent, value: fmtRp(orders.reduce((s, o) => s + (o.totalIdr || 0), 0)), color: 'bg-white' },
              { icon: <Wallet size={20} />, label: t.savedThisMonth, value: fmtRp(wallet.totalSaved || 0), color: 'bg-white' },
              { icon: <Heart size={20} />, label: t.balance, value: fmtRp(wallet.availableBalance || 0), color: 'bg-white' },
            ].map(stat => (
              <div key={stat.label} className={`${stat.color} border-3 border-black p-4 text-center`}
                style={{ boxShadow: '3px 3px 0 #000' }}>
                <div className="flex justify-center mb-2 text-terracotta">{stat.icon}</div>
                <p className="text-[10px] font-display font-bold text-ink-mute uppercase mb-1">{stat.label}</p>
                <p className="font-display font-black text-sm text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Left: Tabs + Content */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {([
                  { id: 'dashboard' as Tab, label: t.dashboard, icon: <Home size={16} /> },
                  { id: 'orders' as Tab, label: t.orders, icon: <Package size={16} /> },
                  { id: 'wallet' as Tab, label: t.wallet, icon: <Wallet size={16} /> },
                  { id: 'addresses' as Tab, label: t.addresses, icon: <MapPin size={16} /> },
                ]).map(tb => (
                  <button key={tb.id} onClick={() => setTab(tb.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-3 border-black font-display font-bold text-xs uppercase
                      whitespace-nowrap transition-colors
                      ${tab === tb.id ? 'bg-terracotta text-white border-terracotta' : 'bg-white hover:bg-canvas-gray'}`}>
                    {tb.icon} {tb.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white border-4 border-black p-6" style={{ boxShadow: '6px 6px 0 #000' }}>
                {/* Dashboard Tab */}
                {tab === 'dashboard' && (
                  <div>
                    <h3 className="font-display font-black text-lg text-ink uppercase mb-5">{t.recentOrders}</h3>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package size={40} className="mx-auto mb-3 text-ink-mute" />
                        <p className="font-bold text-ink-mute mb-4">{t.noOrders}</p>
                        <Link href="/products" className="btn-brutal-sm">{t.startShopping}</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 border-3 border-black">
                            <div>
                              <p className="font-display font-bold text-sm">#{order.id?.slice(-8)}</p>
                              <p className="text-[10px] text-ink-mute font-medium mt-0.5">{order.createdAt}</p>
                            </div>
                            <div className="text-right">
                              {statusBadge(order.status, t)}
                              <p className="font-display font-black text-sm mt-1">{fmtRp(order.totalIdr || 0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {tab === 'orders' && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-display font-black text-lg text-ink uppercase">{t.orders}</h3>
                      <Link href="/orders" className="flex items-center gap-1 text-xs font-display font-bold text-terracotta uppercase hover:text-ink transition-colors">
                        {t.viewAll} <ChevronRight size={14} />
                      </Link>
                    </div>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package size={40} className="mx-auto mb-3 text-ink-mute" />
                        <p className="font-bold text-ink-mute mb-4">{t.noOrders}</p>
                        <Link href="/products" className="btn-brutal-sm">{t.startShopping}</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 border-3 border-black">
                            <div>
                              <p className="font-display font-bold text-sm">#{order.id?.slice(-8)}</p>
                              <p className="text-[11px] text-ink-mute font-medium mt-0.5">
                                {order.productCount || 0} items · {order.createdAt}
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              {statusBadge(order.status, t)}
                              <p className="font-display font-black text-sm">{fmtRp(order.totalIdr || 0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wallet Tab */}
                {tab === 'wallet' && (
                  <div>
                    <h3 className="font-display font-black text-lg text-ink uppercase mb-5">{t.wallet}</h3>
                    <div className="bg-canvas-warm border-3 border-black p-6 mb-6">
                      <p className="text-xs font-bold text-ink-mute uppercase mb-1">{t.balance}</p>
                      <p className="font-display text-3xl font-black text-terracotta">{fmtRp(wallet.availableBalance || 0)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="border-3 border-black p-4 text-center">
                        <p className="text-[10px] font-bold text-ink-mute uppercase mb-1">Pending</p>
                        <p className="font-display font-black text-lg">{fmtRp(wallet.pendingBalance || 0)}</p>
                      </div>
                      <div className="border-3 border-black p-4 text-center bg-green-50">
                        <p className="text-[10px] font-bold text-ink-mute uppercase mb-1">{t.savedThisMonth}</p>
                        <p className="font-display font-black text-lg text-green-700">{fmtRp(wallet.totalSaved || 0)}</p>
                      </div>
                    </div>
                    <h4 className="font-display font-bold text-sm text-ink uppercase mb-3">{t.history}</h4>
                    <div className="text-center py-8 border-3 border-black border-dashed">
                      <Clock size={32} className="mx-auto mb-2 text-ink-mute" />
                      <p className="text-sm font-bold text-ink-mute">{t.noTransactions}</p>
                    </div>
                  </div>
                )}

                {/* Addresses Tab */}
                {tab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-display font-black text-lg text-ink uppercase">{t.addresses}</h3>
                      <button className="btn-brutal-sm text-[11px]">+ Add</button>
                    </div>
                    <div className="text-center py-12 border-3 border-black border-dashed">
                      <MapPin size={40} className="mx-auto mb-3 text-ink-mute" />
                      <p className="font-bold text-ink-mute">{t.noTransactions}</p>
                      <p className="text-xs text-ink-mute mt-1">Address management coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Links */}
            <div className="mt-6 lg:mt-0">
              <div className="bg-white border-4 border-black p-5 sticky top-20" style={{ boxShadow: '6px 6px 0 #000' }}>
                <h3 className="font-display font-black text-sm text-ink uppercase mb-4 border-b-3 border-black pb-2">
                  {t.quickLinks}
                </h3>
                <div className="space-y-2">
                  <Link href="/products"
                    className="flex items-center justify-between px-4 py-3 border-3 border-black
                      font-display font-bold text-sm hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors group">
                    <span className="flex items-center gap-2"><ShoppingBag size={16} /> {t.linkProducts}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/cart"
                    className="flex items-center justify-between px-4 py-3 border-3 border-black
                      font-display font-bold text-sm hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors group">
                    <span className="flex items-center gap-2"><Package size={16} /> {t.linkCart}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/arbibot"
                    className="flex items-center justify-between px-4 py-3 border-3 border-black
                      font-display font-bold text-sm hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors group">
                    <span className="flex items-center gap-2"><TrendingUp size={16} /> {t.linkArbiBot}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/orders"
                    className="flex items-center justify-between px-4 py-3 border-3 border-black
                      font-display font-bold text-sm hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors group">
                    <span className="flex items-center gap-2"><Clock size={16} /> {t.orders}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Language Switcher */}
                <div className="mt-5 pt-4 border-t-2 border-dashed border-black/10">
                  <p className="text-[10px] font-bold text-ink-mute uppercase mb-2">Bahasa</p>
                  <div className="flex gap-1.5">
                    {(['ID', 'EN', 'ZH'] as Lang[]).map(l => (
                      <button key={l} onClick={() => setLang(l)}
                        className={`px-3 py-1.5 border-2 border-black text-xs font-display font-bold
                          ${lang === l ? 'bg-terracotta text-white border-terracotta' : 'bg-white hover:bg-canvas-gray'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
