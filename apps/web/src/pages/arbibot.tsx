import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Bot, ArrowLeft, ArrowRight, Home, Search, Sparkles,
  Percent, RefreshCw, ExternalLink, ShoppingCart, Star, Check,
  Share2, Copy, CheckCheck, MessageCircle, Zap,
} from 'lucide-react';

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'ArbiBot — AceProxy',
    heading: 'ArbiBot AI',
    subtitle: 'Tempel link produk dari Amazon, Shopee, atau Tokopedia. ArbiBot akan mencari barang yang sama dari pabrik China dengan harga lebih murah.',
    placeholder: 'Tempel link produk di sini...',
    search: 'Cari Barang',
    searching: 'Mencari...',
    source1688: '1688 SOURCE',
    found: 'Ditemukan!',
    resultTitle: 'Hasil Pencocokan ArbiBot',
    originalPrice: 'Harga Asli',
    factoryPrice: 'Harga Pabrik',
    ourPrice: 'Harga AceProxy',
    youSave: 'Anda Hemat',
    addToCart: 'Tambah ke Keranjang',
    howItWorks: 'Cara Kerja',
    step1: 'Tempel link produk dari marketplace mana pun',
    step2: 'ArbiBot AI mencari produk yang sama di 1688',
    step3: 'Bandingkan harga dan lihat potensi keuntungan',
    step4: 'Tambahkan ke keranjang dan checkout dengan harga pabrik',
    empty: 'Mulai dengan menempelkan link produk di atas.',
    tips: 'Tips: Coba paste link dari Shopee, Tokopedia, atau Amazon',
    back: 'Kembali',
    directBuy: '1688 直购模式',
    directBuyDesc: '您从商品详情页跳转过来。我们将直接为您采购此商品。',
    share: 'Bagikan',
    shareWhatsApp: 'WhatsApp',
    shareCopy: 'Salin Tautan',
    copied: 'Tersalin!',
    directToCart: 'Langsung Beli',
  },
  EN: {
    title: 'ArbiBot — AceProxy',
    heading: 'ArbiBot AI',
    subtitle: 'Paste a product link from Amazon, Shopee, or Tokopedia. ArbiBot will find the same item from Chinese factories at a lower price.',
    placeholder: 'Paste product link here...',
    search: 'Find Product',
    searching: 'Searching...',
    source1688: '1688 SOURCE',
    found: 'Found!',
    resultTitle: 'ArbiBot Match Results',
    originalPrice: 'Original Price',
    factoryPrice: 'Factory Price',
    ourPrice: 'AceProxy Price',
    youSave: 'You Save',
    addToCart: 'Add to Cart',
    howItWorks: 'How It Works',
    step1: 'Paste a product link from any marketplace',
    step2: 'ArbiBot AI finds the same product on 1688',
    step3: 'Compare prices and see profit potential',
    step4: 'Add to cart and checkout at factory price',
    empty: 'Start by pasting a product link above.',
    tips: 'Tip: Try pasting a link from Shopee, Tokopedia, or Amazon',
    back: 'Back',
    directBuy: '1688 Direct Purchase',
    directBuyDesc: 'You came from the product page. We will directly source this for you.',
    share: 'Share',
    shareWhatsApp: 'WhatsApp',
    shareCopy: 'Copy Link',
    copied: 'Copied!',
    directToCart: 'Buy Now',
  },
  ZH: {
    title: 'ArbiBot — AceProxy',
    heading: 'ArbiBot AI 智能找货',
    subtitle: '粘贴 Amazon、Shopee 或 Tokopedia 的商品链接，ArbiBot 将从中国工厂找到同款商品，价格更低。',
    placeholder: '在此粘贴商品链接...',
    search: '查找商品',
    searching: '搜索中...',
    source1688: '1688 货源',
    found: '找到了!',
    resultTitle: 'ArbiBot 匹配结果',
    originalPrice: '原价',
    factoryPrice: '工厂价',
    ourPrice: 'AceProxy 售价',
    youSave: '你节省',
    addToCart: '加入购物车',
    howItWorks: '使用流程',
    step1: '粘贴任意平台的商品链接',
    step2: 'ArbiBot AI 在 1688 搜索同款',
    step3: '对比价格，查看利润空间',
    step4: '加入购物车，以工厂价结算',
    empty: '在上方粘贴商品链接开始搜索。',
    tips: '提示：试试粘贴 Shopee、Tokopedia 或 Amazon 链接',
    back: '返回',
    directBuy: '1688 直购模式',
    directBuyDesc: '您从商品详情页跳转过来，我们将直接为您采购此商品。',
    share: '分享',
    shareWhatsApp: 'WhatsApp',
    shareCopy: '复制链接',
    copied: '已复制！',
    directToCart: '立即购买',
  },
};

function getPlatformFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('shopee')) return 'Shopee';
    if (host.includes('tokopedia')) return 'Tokopedia';
    if (host.includes('amazon')) return 'Amazon';
    if (host.includes('lazada')) return 'Lazada';
    if (host.includes('tiktok')) return 'TikTok Shop';
    if (host.includes('blibli')) return 'Blibli';
    if (host.includes('bukalapak')) return 'Bukalapak';
    return 'Marketplace';
  } catch { return 'Marketplace'; }
}

function formatterCny(n: number): string { return `¥${n.toFixed(2)}`; }

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('aceproxy_token'); } catch { return null; }
}

interface ArbiBotDisplay {
  found: boolean;
  originalName: string;
  originalPlatform: string;
  originalPrice: number;
  originalImage: string;
  matchedName: string;
  matchedUrl: string;
  factoryPriceCny: number;
  aceProxyPrice: number;
  image: string;
  savings: number;
  margin: number;
  riskStatus: string;
  riskReason?: string;
  sourceUrl: string;
}

export default function ArbiBotPage() {
  const router = useRouter();
  const [lang] = useState<Lang>('ID');
  const [url, setUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<ArbiBotDisplay | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [directMode, setDirectMode] = useState(false);
  const [directName, setDirectName] = useState('');
  const [copied, setCopied] = useState(false);
  const t = T[lang];

  // ─── Handle 1688 Direct Purchase query param ───
  useEffect(() => {
    const { direct, name } = router.query;
    if (direct && typeof direct === 'string') {
      setUrl(decodeURIComponent(direct));
      setDirectMode(true);
      setDirectName(typeof name === 'string' ? decodeURIComponent(name) : '');
      // Auto-search for direct buy
      handleSearchDirect(decodeURIComponent(direct));
    }
  }, [router.query]);

  async function handleSearchDirect(directUrl: string) {
    setSearching(true);
    setSearched(true);
    setErrorMsg(null);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const apiRes = await fetch('/arbibot/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: directUrl }),
      });
      const data = await apiRes.json();
      if (apiRes.ok && data.sourcePriceCNY > 0) {
        const allInPriceIDR = Math.round(data.allInPriceIDR);
        const marketPriceIDR = Math.round(allInPriceIDR * 2.34);
        const savings = marketPriceIDR - allInPriceIDR;
        const margin = data.arbitrageGapPct ? Math.round(data.arbitrageGapPct * 100) : 0;
        setResult({
          found: true,
          originalName: directUrl.split('/').pop()?.replace(/-/g, ' ') || '1688 Product',
          originalPlatform: '1688',
          originalPrice: marketPriceIDR,
          originalImage: '',
          matchedName: `1688 Source: ¥${data.sourcePriceCNY.toFixed(0)}`,
          matchedUrl: data.matchedSourceUrl || directUrl,
          factoryPriceCny: data.sourcePriceCNY,
          aceProxyPrice: allInPriceIDR,
          image: '',
          savings,
          margin,
          riskStatus: data.riskStatus,
          riskReason: data.riskReason,
          sourceUrl: data.sourceUrl,
        });
      } else {
        setErrorMsg(data.message || 'Could not find pricing info for this 1688 product.');
      }
    } catch {
      setErrorMsg('ArbiBot AI is temporarily unavailable. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  // ─── Share handlers ───
  function handleShareWhatsApp() {
    if (!result) return;
    const shareUrl = `${window.location.origin}/arbibot`;
    const text = encodeURIComponent(`🔥 ArbiBot found this 1688 deal: ${result.matchedName} at ¥${result.factoryPriceCny.toFixed(0)} instead of Rp ${result.originalPrice.toLocaleString()}! Save ${result.margin}%!`);
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function handleCopyLink() {
    const shareUrl = `${window.location.origin}/arbibot`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setSearching(true);
    setSearched(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiRes = await fetch('/arbibot/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await apiRes.json();

      // ArbiBotAnalysis response format from backend
      if (apiRes.ok && data.sourcePriceCNY > 0) {
        const analysis = data;
        const allInPriceIDR = Math.round(analysis.allInPriceIDR);
        // Original market price ≈ all-in price × 2.34 (existing formula)
        const marketPriceIDR = Math.round(allInPriceIDR * 2.34);
        const savings = marketPriceIDR - allInPriceIDR;
        const margin = analysis.arbitrageGapPct ? Math.round(analysis.arbitrageGapPct * 100) : 0;

        setResult({
          found: true,
          originalName: url.split('/').pop()?.replace(/-/g, ' ') || 'Product',
          originalPlatform: getPlatformFromUrl(url),
          originalPrice: marketPriceIDR,
          originalImage: '',
          matchedName: `1688 Source: ¥${analysis.sourcePriceCNY.toFixed(0)}`,
          matchedUrl: analysis.matchedSourceUrl || url,
          factoryPriceCny: analysis.sourcePriceCNY,
          aceProxyPrice: allInPriceIDR,
          image: '',
          savings,
          margin,
          riskStatus: analysis.riskStatus,
          riskReason: analysis.riskReason,
          sourceUrl: analysis.sourceUrl,
        });
      } else {
        // API returned but no valid source price
        setErrorMsg(data.message || 'Could not find a matching product from Chinese factories. Try another link.');
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message?.includes('auth') || err?.message?.includes('Unauthorized')
          ? 'Please login first to use ArbiBot AI.'
          : 'ArbiBot AI is temporarily unavailable. Please try again shortly.'
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <Head><title>{t.title}</title></Head>
      <div className="min-h-screen bg-canvas-warm font-body">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                <span className="font-display font-black text-lg tracking-tight hidden sm:block">ACEPROXY</span>
              </Link>
              <Link href="/login" className="btn-brutal-sm text-[13px] !px-4 !py-2">Masuk</Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-terracotta"><Home size={14} /></Link>
            <span>/</span>
            <span className="text-ink">ArbiBot</span>
          </div>

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border-3 border-black bg-white mb-4">
              <Bot size={20} className="text-terracotta" />
              <span className="text-xs font-display font-bold uppercase tracking-wider">AI Powered</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black text-ink uppercase tracking-[-0.04em] mb-4">
              {t.heading}
            </h1>
            <p className="text-sm sm:text-base text-ink-secondary max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* 1688 Direct Buy Banner */}
          {directMode && (
            <div className="bg-terracotta text-white border-4 border-black p-4 mb-8 flex items-center gap-3"
              style={{ boxShadow: '4px 4px 0 #000' }}>
              <div className="w-10 h-10 border-2 border-white bg-white/20 flex items-center justify-center flex-shrink-0">
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm uppercase">{t.directBuy}</h3>
                <p className="text-xs text-white/80 font-medium">{t.directBuyDesc}</p>
                {directName && <p className="text-xs text-white/90 font-bold mt-1">{directName}</p>}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-10">
            <div className="bg-white border-4 border-black p-3 sm:p-4 flex gap-3"
              style={{ boxShadow: '6px 6px 0 #000' }}>
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full pl-10 pr-4 py-3 sm:py-4 border-3 border-black text-sm
                    outline-none focus:border-terracotta" />
              </div>
              <button
                type="submit"
                disabled={!url.trim() || searching}
                className={`btn-brutal text-sm sm:text-base !px-5 sm:!px-8 ${!url.trim() || searching ? 'opacity-50 pointer-events-none' : ''}`}>
                {searching ? (
                  <><RefreshCw size={18} className="animate-spin" /> {t.searching}</>
                ) : (
                  <><Search size={18} /> {t.search}</>
                )}
              </button>
            </div>
            <p className="text-xs text-ink-mute mt-2 text-center font-medium">{t.tips}</p>
          </form>

          {/* Searching Animation */}
          {searching && (
            <div className="text-center py-16 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <div className="flex items-center justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 border-3 border-black bg-terracotta"
                    style={{ 
                      animation: `bounce 0.7s ${i * 0.12}s infinite`,
                      transform: `rotate(${i * 45}deg)`
                    }} />
                ))}
              </div>
              <p className="font-bold text-ink-mute text-lg">
                <Sparkles size={18} className="inline mr-2 text-terracotta" />
                AI sedang mencari produk terbaik...
              </p>
              <p className="text-sm text-ink-mute mt-2 font-medium">Menelusuri 1688, Taobao, Pinduoduo...</p>
              <div className="mt-6 w-full max-w-md mx-auto h-2 bg-canvas-gray border-2 border-black overflow-hidden">
                <div className="h-full bg-terracotta animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {/* Error Display */}
          {!searching && errorMsg && (
            <div className="text-center py-14 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <div className="w-14 h-14 mx-auto mb-4 border-3 border-error bg-error-soft flex items-center justify-center">
                <Sparkles size={26} className="text-error" />
              </div>
              <p className="font-bold text-ink-mute text-lg mb-6">{errorMsg}</p>
              <button onClick={() => { setErrorMsg(null); setSearched(false); setUrl(''); }}
                className="btn-brutal-sm">
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          )}

          {/* Results */}
          {!searching && result && (
            <div className="space-y-6">
              <div className="bg-success-soft border-4 border-success p-4 flex items-center gap-3"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="w-10 h-10 border-3 border-success bg-success flex items-center justify-center flex-shrink-0">
                  <Check size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-success uppercase">{t.found}</h3>
                  <p className="text-xs font-bold">{t.resultTitle}</p>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="bg-white border-4 border-black p-5" style={{ boxShadow: '4px 4px 0 #000' }}>
                  <div className="text-xs font-display font-bold text-ink-mute uppercase tracking-wider mb-3">
                    {result.originalPlatform} — {t.originalPrice}
                  </div>
                  <div className="aspect-video bg-canvas-gray border-3 border-black flex items-center justify-center mb-3">
                    <span className="text-4xl">🛍️</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink mb-2 line-clamp-2">{result.originalName}</h4>
                  <div className="text-2xl font-display font-black text-ink-mute line-through">
                    {fmtRp(result.originalPrice)}
                  </div>
                </div>

                {/* AceProxy Match */}
                <div className="bg-white border-4 border-terracotta p-5 relative" style={{ boxShadow: '4px 4px 0 #F97316' }}>
                  <div className="absolute -top-3 right-4 px-3 py-0.5 border-2 border-terracotta bg-terracotta text-white text-[10px] font-display font-black uppercase">
                    {t.source1688}
                  </div>
                  <div className="text-xs font-display font-bold text-terracotta uppercase tracking-wider mb-3">
                    AceProxy — {t.ourPrice}
                  </div>
                  <div className="aspect-video bg-canvas-warm border-3 border-terracotta flex items-center justify-center mb-3">
                    <span className="text-4xl">🏭</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink mb-2 line-clamp-2">{result.matchedName}</h4>
                  
                  {/* Price Row */}
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold text-ink-mute">{t.factoryPrice}</span>
                    <span className="text-sm font-display font-black text-ink">{formatterCny(result.factoryPriceCny)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-ink-mute">AceProxy</span>
                    <span className="text-2xl font-display font-black text-terracotta">{fmtRp(result.aceProxyPrice)}</span>
                  </div>

                  {/* 1688 Source Link */}
                  {result.matchedUrl && (
                    <a href={result.matchedUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-[10px] font-display font-bold text-ocean uppercase hover:text-terracotta transition-colors">
                      <ExternalLink size={12} /> View on 1688
                    </a>
                  )}

                  {/* Risk Status Badge */}
                  {result.riskStatus === 'BLOCKED' && (
                    <div className="mt-3 p-2 border-2 border-error bg-error-soft text-error text-[10px] font-display font-bold uppercase">
                      ⚠️ {result.riskReason || 'Patent / IP risk detected'}
                    </div>
                  )}
                  {result.riskStatus === 'WARNING' && (
                    <div className="mt-3 p-2 border-2 border-warning bg-warning-soft text-warning text-[10px] font-display font-bold uppercase">
                      ⚡ {result.riskReason || 'Potential risk - review before listing'}
                    </div>
                  )}

                  {/* Savings Banner */}
                  <div className="mt-4 p-3 border-2 border-black bg-canvas-warm flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Percent size={18} className="text-terracotta" />
                      <span className="text-xs font-display font-bold uppercase">{t.youSave}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-lg text-terracotta">{fmtRp(result.savings)}</div>
                      <div className="text-[10px] font-display font-bold text-ink-mute">{result.margin}% margin</div>
                    </div>
                  </div>

                  {/* CTA - link to products page */}
                  <Link href="/products"
                    className="btn-brutal w-full mt-4 text-sm">
                    <ShoppingCart size={16} /> {t.addToCart}
                  </Link>

                  {/* Share Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleShareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-black bg-[#25D366] text-white text-[10px] font-display font-bold uppercase hover:bg-[#1DA851] transition-colors"
                      style={{ boxShadow: '2px 2px 0 #000' }}>
                      <MessageCircle size={13} /> {t.shareWhatsApp}
                    </button>
                    <button onClick={handleCopyLink}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-black text-[10px] font-display font-bold uppercase transition-colors ${copied ? 'bg-success text-white border-success' : 'bg-white hover:bg-canvas-gray'}`}
                      style={{ boxShadow: '2px 2px 0 #000' }}>
                      {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                      {copied ? t.copied : t.shareCopy}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State (before first search) */}
          {!searching && !result && !searched && (
            <div className="text-center py-16 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <Bot size={64} className="mx-auto mb-5 text-ink-mute" />
              <p className="font-bold text-ink-mute text-lg">{t.empty}</p>
            </div>
          )}

          {/* How It Works */}
          <section className="mt-16 bg-white border-4 border-black p-6 sm:p-8"
            style={{ boxShadow: '6px 6px 0 #000' }}>
            <h2 className="font-display text-xl font-black text-ink uppercase tracking-[-0.02em] mb-6 text-center">
              {t.howItWorks}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 border-4 border-black bg-terracotta text-white flex items-center justify-center font-display font-black text-xl mx-auto mb-3"
                    style={{ boxShadow: '3px 3px 0 #000' }}>
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold text-ink-secondary leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="bg-ink text-white border-t-4 border-black mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
            <p className="text-xs text-white/40 font-bold uppercase">© 2026 AceProxy</p>
          </div>
        </footer>
      </div>
    </>
  );
}


