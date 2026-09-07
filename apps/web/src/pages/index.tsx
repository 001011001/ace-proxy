import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Search, ShoppingCart, User, Globe, Menu, Shield,
  RefreshCw, ArrowRight, Package, Star, X, Bot
} from 'lucide-react';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

// ─── Types ───
interface Product {
  id: string;
  name: string;
  category: string;
  priceIdr: number;
  costCny: number;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  stock: number;
}

interface HomeData {
  heroProducts?: Product[];
  featuredProducts?: Product[];
  categories?: { name: string; count: number }[];
}

// ─── Helpers ───
function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

function getImageUrl(images: string[], fallback: string): string {
  if (images?.length > 0) {
    const src = images[0];
    if (src.startsWith('http')) return src;
    if (src.startsWith('[')) {
      try { const arr = JSON.parse(src); return arr[0] || fallback; } catch { return fallback; }
    }
    return src;
  }
  return fallback;
}

// ─── Main Page ───
export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'ID' | 'EN' | 'ZH'>('ID');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [pauseAuto, setPauseAuto] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Carousel auto-advance every 5s
  useEffect(() => {
    if (pauseAuto) return;
    const t = setInterval(() => setCarouselIdx(prev => (prev + 1) % 3), 5000);
    return () => clearInterval(t);
  }, [pauseAuto]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/station/jakarta/home');
      if (res.ok) {
        const json = await res.json();
        setData(json.data || json);
      } else {
        throw new Error('API unavailable');
      }
    } catch {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/v1/product/list?limit=12'),
          fetch('/api/v1/product/categories'),
        ]);
        const prodJson = await prodRes.json();
        const catJson = await catRes.json();
        setData({
          featuredProducts: prodJson.data?.items || [],
          categories: catJson.data || [],
        });
      } catch {
        setError('Backend tidak tersedia');
      }
    } finally {
      setLoading(false);
    }
  }

  const products = data?.featuredProducts || data?.heroProducts || [];
  const categories = data?.categories || [];

  const T = {
    ID: {
      hero: 'Belanja Langsung dari Pabrik China',
      subtitle: 'Harga grosir langsung 1688. Kualitas terjamin dengan pengecekan AI. Pengiriman aman ke seluruh Indonesia.',
      cta: 'Lihat Produk',
      trusted: 'Dipercaya 10.000+ pembeli',
      search: 'Cari produk, brand, atau kategori...',
      categories: 'Kategori',
      featured: 'Produk Unggulan',
      allProducts: 'Semua Produk',
      admin: 'Admin',
      loading: 'Memuat produk...',
      error: 'Server sedang sibuk. Silakan coba lagi.',
      retry: 'Coba Lagi',
      nav: { home: 'Beranda', products: 'Produk', cart: 'Keranjang', orders: 'Pesanan', account: 'Akun' },
      saveTag: 'HEMAT',
      empty: 'Belum ada produk tersedia.',
      emptyAction: 'Tambah Produk di Admin',
      freeConsolidation: 'Gratis Konsolidasi',
      aiQuality: 'AI Quality Check',
      damageWarranty: 'Garansi Kerusakan',
      hotProducts: 'Trending Sekarang',
      howItWorks: 'Cara Belanja',
      step1: 'Cari Produk',
      step1desc: 'Telusuri katalog atau paste link 1688 langsung',
      step2: 'ArbiBot Bandingkan',
      step2desc: 'AI cari harga terbaik & verifikasi kualitas',
      step3: 'Kami Belikan',
      step3desc: 'Pembayaran escrow aman, barang sampai rumah',
      whyUs: 'Kenapa AceProxy?',
      why1: 'Harga Pabrik',
      why1desc: 'Langsung dari 1688, lebih murah 50-200%',
      why2: 'AI Cek Kualitas',
      why2desc: 'AI verifikasi sebelum dikirim ke Indonesia',
      why3: 'Aman & Terjamin',
      why3desc: 'Escrow Xendit, uang aman sampai terima',
      why4: 'Konsolidasi Gratis',
      why4desc: 'Gabung banyak paket, kirim sekali gratis',
      arbiBotCTA: 'Paste link produk & cari harga terbaik',
      arbiBotAction: 'Mulai ArbiBot',
      services: 'Layanan',
      company: 'Perusahaan',
      contact: 'Kontak',
      about: 'Tentang Kami',
      privacy: 'Kebijakan Privasi',
    },
    EN: {
      hero: 'Direct from Chinese Factories',
      subtitle: 'Wholesale prices from 1688. AI quality assurance. Safe delivery to Indonesia.',
      cta: 'Browse Products',
      trusted: 'Trusted by 10,000+ buyers',
      search: 'Search products, brands, categories...',
      categories: 'Categories',
      featured: 'Featured Products',
      allProducts: 'All Products',
      admin: 'Admin',
      loading: 'Loading products...',
      error: 'Server busy. Please try again.',
      retry: 'Retry',
      nav: { home: 'Home', products: 'Products', cart: 'Cart', orders: 'Orders', account: 'Account' },
      saveTag: 'SAVE',
      empty: 'No products available yet.',
      emptyAction: 'Add Products in Admin',
      freeConsolidation: 'Free Consolidation',
      aiQuality: 'AI Quality Check',
      damageWarranty: 'Damage Warranty',
      services: 'Services',
      company: 'Company',
      contact: 'Contact',
      about: 'About Us',
      privacy: 'Privacy Policy',
      hotProducts: 'Trending Now',
      howItWorks: 'How It Works',
      step1: 'Find Products',
      step1desc: 'Browse catalog or paste 1688 product link',
      step2: 'ArbiBot Compares',
      step2desc: 'AI finds best prices & verifies quality',
      step3: 'We Buy For You',
      step3desc: 'Secure escrow payment, delivered to your door',
      whyUs: 'Why AceProxy?',
      why1: 'Factory Prices',
      why1desc: 'Direct from 1688, 50-200% cheaper',
      why2: 'AI Quality Check',
      why2desc: 'AI verifies before shipping to Indonesia',
      why3: 'Safe & Guaranteed',
      why3desc: 'Xendit escrow, money safe until delivery',
      why4: 'Free Consolidation',
      why4desc: 'Combine packages, ship together for free',
      arbiBotCTA: 'Paste product link & find best prices',
      arbiBotAction: 'Open ArbiBot',
    },
    ZH: {
      hero: '中国工厂直供',
      subtitle: '1688批发价直接买。AI质检保证品质。安全送达印尼。',
      cta: '浏览商品',
      trusted: '10,000+ 用户信赖',
      search: '搜索商品、品牌、分类...',
      categories: '分类',
      featured: '精选商品',
      allProducts: '全部商品',
      admin: '管理后台',
      loading: '加载商品中...',
      error: '服务器繁忙，请重试。',
      retry: '重试',
      nav: { home: '首页', products: '商品', cart: '购物车', orders: '订单', account: '我的' },
      saveTag: '省',
      empty: '暂无商品。',
      emptyAction: '去管理后台添加商品',
      freeConsolidation: '免费集运',
      aiQuality: 'AI质检',
      damageWarranty: '破损保障',
      services: '服务',
      company: '公司',
      contact: '联系我们',
      about: '关于我们',
      privacy: '隐私政策',
      hotProducts: '今日爆款',
      howItWorks: '怎么买',
      step1: '选商品',
      step1desc: '浏览商品或直接粘贴1688产品链接',
      step2: 'ArbiBot比价',
      step2desc: 'AI全网比价，验证品质',
      step3: '我们代购',
      step3desc: 'Xendit托管支付，安全送到家',
      whyUs: '为什么选AceProxy？',
      why1: '工厂价',
      why1desc: '1688直供，便宜50-200%',
      why2: 'AI质检',
      why2desc: 'AI验证品质后才发往印尼',
      why3: '安全可靠',
      why3desc: 'Xendit托管，收货才放款',
      why4: '免费集运',
      why4desc: '多包裹合并，一次免费寄送',
      arbiBotCTA: '粘贴链接，全网比价',
      arbiBotAction: '打开ArbiBot',
    },
  };
  const t = T[lang];

  return (
    <>
      <Head>
        <title>AceProxy — Belanja Langsung dari Pabrik China</title>
        <meta name="description" content="Harga grosir langsung 1688. AI quality inspection. Free consolidation shipping." />
      </Head>

      <div className="min-h-screen bg-canvas-warm font-body">
        {/* ─── Header (BRUTALISM: border-b-4, sticky) ─── */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo — square block */}
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">
                  A
                </div>
                <span className="font-display font-black text-lg text-ink tracking-tight hidden sm:block">
                  ACEPROXY
                </span>
              </Link>

              {/* Search — brutalist input (desktop) */}
              <div className="hidden md:flex flex-1 max-w-lg mx-6">
                <div className="relative w-full">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
                  <input
                    placeholder={t.search}
                    className="w-full pl-11 pr-5 py-3 border-3 border-black bg-white
                      text-sm font-medium text-ink placeholder:text-ink-mute/40
                      outline-none
                      focus:border-terracotta
                      shadow-[3px_3px_0_#000]"
                  />
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Language Switcher — pill-style but square */}
                <button
                  onClick={() => setLang(lang === 'ID' ? 'EN' : lang === 'EN' ? 'ZH' : 'ID')}
                  className="flex items-center gap-1 px-2.5 py-1.5 border-3 border-black
                    text-xs font-bold hover:bg-terracotta hover:text-white hover:border-terracotta
                    transition-all duration-100 bg-white"
                  title="Switch Language"
                >
                  <Globe size={14} />
                  <span className="hidden sm:inline font-display">{lang}</span>
                </button>

                {/* Cart Button */}
                <Link href="/cart"
                  className="relative p-2 border-3 border-black bg-white
                    hover:bg-canvas-gray transition-colors"
                  title={t.nav.cart}>
                  <ShoppingCart size={20} className="text-ink" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-terracotta text-white text-[10px] font-display font-black flex items-center justify-center border-2 border-black">
                    0
                  </span>
                </Link>

                {/* Admin Button (desktop) */}
                <Link href="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-3 border-black
                    text-xs font-bold bg-white hover:bg-ink hover:text-white hover:border-ink
                    transition-all duration-100"
                  title={t.admin}>
                  <Shield size={14} />
                  <span className="font-display text-[11px]">{t.admin}</span>
                </Link>

                {/* Account / Masuk Button — Primary Brutalist */}
                <Link href="/account"
                  className="btn-brutal-sm text-[13px] !px-4 !py-2 !gap-1.5">
                  <User size={14} />
                  <span className="hidden sm:inline">{t.nav.account}</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenu(!mobileMenu)}
                  className="md:hidden p-2 border-3 border-black bg-white
                    hover:bg-canvas-gray transition-colors">
                  {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenu && (
            <div className="md:hidden border-t-4 border-black bg-white px-4 py-4 space-y-2">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input
                  placeholder={t.search}
                  className="w-full pl-9 pr-4 py-2.5 border-3 border-black text-sm outline-none"
                />
              </div>
              <Link href="/products"
                onClick={() => setMobileMenu(false)}
                className="block px-4 py-2.5 border-3 border-black font-bold text-sm hover:bg-terracotta hover:text-white transition-colors">
                {t.nav.products}
              </Link>
              <Link href="/cart"
                onClick={() => setMobileMenu(false)}
                className="block px-4 py-2.5 border-3 border-black font-bold text-sm hover:bg-terracotta hover:text-white transition-colors">
                {t.nav.cart}
              </Link>
              <Link href="/orders"
                onClick={() => setMobileMenu(false)}
                className="block px-4 py-2.5 border-3 border-black font-bold text-sm hover:bg-terracotta hover:text-white transition-colors">
                {t.nav.orders}
              </Link>
              <Link href="/admin"
                onClick={() => setMobileMenu(false)}
                className="block px-4 py-2.5 border-3 border-black font-bold text-sm hover:bg-ink hover:text-white transition-colors">
                {t.admin}
              </Link>
            </div>
          )}
        </header>

        {/* ─── Hero Carousel Banner ─── */}
        <section className="relative bg-ink border-b-4 border-black overflow-hidden"
          onMouseEnter={() => setPauseAuto(true)}
          onMouseLeave={() => setPauseAuto(false)}>
          <div className="relative h-[280px] sm:h-[360px] lg:h-[420px]">
            {[
              {
                gradient: 'from-terracotta via-orange-600 to-ink',
                title: t.hero,
                sub: t.subtitle,
                cta: t.cta, link: '/products',
                badge: '🏭 Pabrik Langsung',
              },
              {
                gradient: 'from-ocean via-blue-700 to-ink',
                title: lang === 'ZH' ? 'AI质检保证品质' : 'AI Verifikasi Kualitas',
                sub: lang === 'ZH' ? '发货前AI自动检查商品质量，破损免费重发' : 'AI cek kualitas sebelum dikirim. Garansi kerusakan!',
                cta: t.arbiBotAction, link: '/arbibot',
                badge: '🤖 AI Powered',
              },
              {
                gradient: 'from-emerald-600 via-teal-700 to-ink',
                title: lang === 'ZH' ? '免费集运到印尼' : 'Gratis Konsolidasi',
                sub: lang === 'ZH' ? '多包裹合并一箱，一次免费送到家门口' : 'Gabung banyak paket jadi satu. Kirim gratis ke seluruh Indonesia!',
                cta: lang === 'ZH' ? '立即选购' : 'Belanja Sekarang', link: '/products',
                badge: '📦 Gratis Ongkir',
              },
            ].map((s, i) => (
              <div key={i}
                className={`absolute inset-0 transition-all duration-700 ease-in-out bg-gradient-to-r ${s.gradient} flex items-center
                  ${carouselIdx === i ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-[1.02]'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                  <div className="max-w-2xl">
                    <span className="inline-block px-3 py-1 border-2 border-white/25 bg-white/10 text-white text-xs font-display font-bold uppercase tracking-wider mb-4 sm:mb-5">
                      {s.badge}
                    </span>
                    <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl text-white leading-[1.08] tracking-[-0.03em] uppercase mb-3 sm:mb-4">
                      {s.title}
                    </h1>
                    <p className="text-sm sm:text-lg text-white/80 max-w-xl mb-5 sm:mb-6 leading-relaxed font-medium">
                      {s.sub}
                    </p>
                    <Link href={s.link}
                      className="inline-flex items-center gap-2 px-5 py-3 border-3 border-white bg-white text-ink font-display font-bold text-sm uppercase
                        shadow-[4px_4px_0_rgba(255,255,255,0.3)]
                        hover:translate-x-1 hover:-translate-y-0.5 transition-all duration-150">
                      {s.cta} <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Arrows */}
            <button onClick={() => setCarouselIdx(prev => prev === 0 ? 2 : prev - 1)}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 border-2 border-white/25 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all rounded-sm"
              aria-label="Previous slide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => setCarouselIdx(prev => prev === 2 ? 0 : prev + 1)}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 border-2 border-white/25 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all rounded-sm"
              aria-label="Next slide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
              {[0, 1, 2].map(d => (
                <button key={d} onClick={() => setCarouselIdx(d)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white transition-all duration-200 rounded-sm ${
                    carouselIdx === d ? 'bg-white scale-125' : 'bg-transparent hover:bg-white/40'
                  }`}
                  aria-label={`Slide ${d + 1}`} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── ArbiBot AI Compact Entry ─── */}
        <section className="bg-canvas-warm border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <Link href="/arbibot"
              className="flex items-center justify-between gap-3 p-3 sm:p-4 border-3 border-black bg-white
                hover:bg-terracotta hover:text-white hover:border-terracotta
                group transition-all duration-150"
              style={{ boxShadow: '3px 3px 0 #000' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 border-3 border-black bg-canvas-warm flex items-center justify-center flex-shrink-0
                  group-hover:bg-white/20 group-hover:border-white transition-colors">
                  <Bot size={22} className="text-terracotta group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0">
                  <span className="font-display font-black text-sm sm:text-base text-ink group-hover:text-white uppercase transition-colors">
                    ArbiBot AI
                  </span>
                  <p className="text-xs sm:text-sm text-ink-mute group-hover:text-white/80 truncate transition-colors font-bold">
                    {t.arbiBotCTA}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 px-3 py-2 border-3 border-black bg-terracotta text-white
                group-hover:bg-white group-hover:text-terracotta group-hover:border-white
                transition-all duration-150 font-display font-bold text-xs uppercase">
                {t.arbiBotAction} <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </section>

        {/* ─── Category Grid (金刚位 — 对标Shopee/淘宝) ─── */}
        <section className="py-12 sm:py-16 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-9 gap-6">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em]">
                {t.categories}
              </h2>
              {/* Regional Pulse (Independent Site Exclusive) */}
              <div className="bg-ink p-4 border-3 border-black shadow-[4px_4px_0_#F97316] flex items-center gap-4">
                <div className="relative w-3 h-3">
                  <div className="absolute inset-0 bg-terracotta rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-terracotta w-3 h-3 rounded-full border-2 border-black"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-display font-black text-white/50 uppercase leading-none">Jakarta Logistics Pulse</span>
                  <span className="text-xs font-display font-black text-white uppercase mt-1">North Jakarta: 89% Capacity (Last 11kg)</span>
                </div>
                <div className="w-24 h-2 bg-white/10 border border-white/20">
                   <div className="h-full bg-terracotta" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {[
                { icon: '👗', name: lang === 'ZH' ? '穆斯林时尚' : 'Muslim Fashion', emoji: '🧕' },
                { icon: '👚', name: lang === 'ZH' ? '女装' : 'Wanita', emoji: '👚' },
                { icon: '👕', name: lang === 'ZH' ? '男装' : 'Pria', emoji: '👕' },
                { icon: '📱', name: lang === 'ZH' ? '电子产品' : 'Elektronik', emoji: '📱' },
                { icon: '🏠', name: lang === 'ZH' ? '家居生活' : 'Rumah', emoji: '🏠' },
                { icon: '💄', name: lang === 'ZH' ? '美妆护肤' : 'Kecantikan', emoji: '💄' },
                { icon: '🧸', name: lang === 'ZH' ? '母婴玩具' : 'Mainan', emoji: '🧸' },
                { icon: '👜', name: lang === 'ZH' ? '箱包配饰' : 'Aksesoris', emoji: '👜' },
              ].map(cat => (
                <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center justify-center gap-2 p-4
                    border-3 border-black bg-white text-center
                    hover:bg-terracotta hover:text-white hover:border-terracotta
                    transition-all duration-150"
                  style={{ boxShadow: '3px 3px 0 #000' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}>
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <span className="text-xs font-display font-bold group-hover:text-white uppercase leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Products Grid (BRUTALISM: hard-shadow cards, square) ─── */}
        <section className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-9">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em]">
                {t.featured}
              </h2>
              <Link href="/products"
                className="flex items-center gap-1.5 text-sm font-display font-bold text-terracotta uppercase
                  hover:text-ink transition-colors tracking-wider">
                {t.allProducts} <ArrowRight size={18} />
              </Link>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-20 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
                <RefreshCw size={36} className="animate-spin mx-auto mb-5 text-terracotta" />
                <p className="font-bold text-ink-mute">{t.loading}</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
                <p className="font-bold text-ink-mute mb-6 text-lg">{t.error}</p>
                <button onClick={fetchData} className="btn-brutal-sm">
                  <RefreshCw size={16} /> {t.retry}
                </button>
              </div>
            )}

            {/* Product Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.slice(0, 8).map(product => (
                  <Link key={product.id} href={`/products/${product.id}`}
                    className="card-brutal group">
                    {/* Product Image */}
                    <div className="aspect-square bg-canvas-gray flex items-center justify-center overflow-hidden border-b-4 border-black relative">
                      {product.images?.length > 0 ? (
                        <img
                          src={getImageUrl(product.images, '')}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-5xl ${product.images?.length > 0 ? 'hidden' : ''}`}>
                        {product.category?.includes('Fashion') || product.category?.includes('Muslim') ? '👗' :
                         product.category?.includes('Electronics') ? '📱' :
                         product.category?.includes('Home') ? '🏠' :
                         product.category?.includes('Gift') ? '🎁' : '📦'}
                      </span>
                      {/* Stock badge */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="absolute top-2 left-2 bg-white border-2 border-black px-2 py-0.5 text-[10px] font-display font-bold text-error uppercase">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <span className="inline-block px-2.5 py-0.5 border-2 border-black bg-canvas-gray text-[10px] font-display font-bold uppercase tracking-widest mb-3">
                        1688 Source
                      </span>
                      <h3 className="font-display font-bold text-sm text-ink mb-3 line-clamp-2 leading-snug
                        group-hover:text-terracotta transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xl font-display font-black text-terracotta">
                            {fmtRp(product.priceIdr)}
                          </div>
                        </div>
                        {product.ratingAvg > 0 && (
                          <div className="flex items-center gap-1 text-xs font-bold text-ink-mute">
                            <Star size={12} className="text-warning fill-warning" />
                            {product.ratingAvg.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-20 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
                <Package size={52} className="mx-auto mb-5 text-ink-mute" />
                <p className="font-bold text-ink-mute mb-6 text-lg">{t.empty}</p>
                <Link href="/admin/products" className="btn-brutal-sm">
                  <ArrowRight size={16} /> {t.emptyAction}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ─── Personalized Recommendations ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <PersonalizedRecommendations
            title={lang === 'ZH' ? '猜你喜欢' : lang === 'EN' ? 'Recommended For You' : 'Rekomendasi Untukmu'}
            variant="home"
            limit={4}
          />
        </div>

        {/* ─── Footer (BRUTALISM: black background, thick top border) ─── */}
        <footer className="bg-ink text-white border-t-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-display font-black text-sm bg-terracotta text-white">
                    A
                  </div>
                  <span className="font-display font-black text-lg tracking-tight">ACEPROXY</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Belanja langsung dari pabrik China. Harga grosir, kualitas terjamin.
                </p>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">
                  {t.services}
                </h4>
                <ul className="space-y-2.5">
                  <li><Link href="/arbibot" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">ArbiBot</Link></li>
                  <li><Link href="/products" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">{t.allProducts}</Link></li>
                  <li><Link href="/orders" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">{t.nav.orders}</Link></li>
                  <li><Link href="/cart" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">{t.nav.cart}</Link></li>
                  <li><Link href="/account" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">{t.nav.account}</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">
                  {t.company}
                </h4>
                <ul className="space-y-2.5">
                  <li><span className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer font-bold">{t.about}</span></li>
                  <li><span className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer font-bold">{t.privacy}</span></li>
                  <li><Link href="/admin" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">Admin Panel</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">
                  {t.contact}
                </h4>
                <ul className="space-y-2.5 text-sm text-white/70">
                  <li className="font-bold">WhatsApp: +62 812-xxxx-xxxx</li>
                  <li className="font-bold">Email: support@aceproxy.id</li>
                  <li className="font-bold">Jakarta, Indonesia</li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-12 pt-6 border-t-2 border-white/10 text-center">
              <p className="text-xs text-white/40 font-bold tracking-wider uppercase">
                © 2026 AceProxy. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
