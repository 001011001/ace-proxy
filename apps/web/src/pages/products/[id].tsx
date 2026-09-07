import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft, ArrowRight, Home, ShoppingCart, Star, Shield,
  Truck, Award, RefreshCw, Percent, Package, Check, Minus, Plus,
  TrendingUp, ChevronLeft, ChevronRight, Expand, X,
  Share2, Copy, CheckCheck, MessageCircle, ExternalLink,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

// ─── Types ───
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  images: string[];
  user: { id: string; email: string };
}

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  priceIdr: number;
  costCny: number;
  imageUrls: string;
  images: string[];
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  status: string;
  reviews?: Review[];
  createdAt: string;
  sourceUrl?: string;
}

// ─── Helpers ───
function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}
function fmtCny(n: number): string {
  return `¥${n.toFixed(2)}`;
}

function getEffectiveImages(row: any): string[] {
  if (row.images?.length) return row.images;
  if (row.imageUrls) {
    try { return JSON.parse(row.imageUrls); } catch { return []; }
  }
  return [];
}

function parseRatingAvg(val: any): number {
  return Number(val) || 0;
}

function parseRatingCount(val: any): number {
  return Number(val) || 0;
}

// ─── Translation ───
type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: '— AceProxy',
    breadcrumbHome: 'Beranda',
    breadcrumbProducts: 'Produk',
    loading: 'Memuat produk...',
    error: 'Produk tidak ditemukan.',
    errorDesc: 'Produk mungkin telah dihapus atau tautan tidak valid.',
    backToProducts: 'Kembali ke Produk',
    retry: 'Coba Lagi',
    sold: 'terjual',
    source1688: 'SUMBER 1688',
    priceStack: 'Rincian Harga',
    factoryPrice: 'Harga Pabrik (1688)',
    aceProxyPrice: 'Harga AceProxy',
    marketPrice: 'Harga Pasar',
    youSave: 'Anda Hemat',
    arbitrageTitle: 'Analisis Arbitrase',
    arbitrageDesc: 'Harga pabrik vs harga jual — potensi keuntungan Anda',
    margin: 'Margin',
    daysWage: 'setara upah',
    daysWageDesc: 'hari kerja lokal',
    trustTitle: 'Jaminan AceProxy',
    trustQC: 'QC Inspeksi AI — Setiap produk diperiksa sebelum dikirim',
    trustWarranty: 'Garansi Kerusakan — Barang rusak diganti atau uang kembali',
    trustConsolidation: 'Konsolidasi Gratis — Gabungkan banyak pesanan tanpa biaya',
    trustPayment: 'Pembayaran Aman — Escrow Xendit, dana aman sampai diterima',
    description: 'Deskripsi',
    reviews: 'Ulasan',
    noReviews: 'Belum ada ulasan untuk produk ini.',
    addToCart: 'Masukkan Keranjang',
    qty: 'Kuantitas',
    stock: 'Stok',
    outOfStock: 'Stok Habis',
    inStock: 'Tersedia',
    onlyLeft: 'Hanya',
    left: 'tersisa!',
    share: 'Bagikan',
    shareWhatsApp: 'WhatsApp',
    shareCopy: 'Salin Tautan',
    copied: 'Tersalin!',
    quickBuy: 'Beli Cepat via 1688',
  },
  EN: {
    title: '— AceProxy',
    breadcrumbHome: 'Home',
    breadcrumbProducts: 'Products',
    loading: 'Loading product...',
    error: 'Product not found.',
    errorDesc: 'This product may have been removed or the link is invalid.',
    backToProducts: 'Back to Products',
    retry: 'Retry',
    sold: 'sold',
    source1688: '1688 SOURCE',
    priceStack: 'Price Breakdown',
    factoryPrice: 'Factory Price (1688)',
    aceProxyPrice: 'AceProxy Price',
    marketPrice: 'Market Price',
    youSave: 'You Save',
    arbitrageTitle: 'Arbitrage Analysis',
    arbitrageDesc: 'Factory price vs selling price — your profit potential',
    margin: 'Margin',
    daysWage: '≈ daily wage',
    daysWageDesc: 'local working days',
    trustTitle: 'AceProxy Guarantee',
    trustQC: 'AI QC Inspection — Every product checked before shipping',
    trustWarranty: 'Damage Warranty — Damaged items replaced or refunded',
    trustConsolidation: 'Free Consolidation — Combine multiple orders at no cost',
    trustPayment: 'Secure Payment — Xendit escrow, funds safe until delivery',
    description: 'Description',
    reviews: 'Reviews',
    noReviews: 'No reviews yet for this product.',
    addToCart: 'Add to Cart',
    qty: 'Quantity',
    stock: 'Stock',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    onlyLeft: 'Only',
    left: 'left!',
    share: 'Share',
    shareWhatsApp: 'WhatsApp',
    shareCopy: 'Copy Link',
    copied: 'Copied!',
    quickBuy: 'Quick Buy via 1688',
  },
  ZH: {
    title: '— AceProxy',
    breadcrumbHome: '首页',
    breadcrumbProducts: '商品',
    loading: '加载商品...',
    error: '商品未找到。',
    errorDesc: '该商品可能已被删除或链接无效。',
    backToProducts: '返回商品列表',
    retry: '重试',
    sold: '已售',
    source1688: '1688货源',
    priceStack: '价格明细',
    factoryPrice: '工厂价 (1688)',
    aceProxyPrice: 'AceProxy 售价',
    marketPrice: '市场价',
    youSave: '立省',
    arbitrageTitle: '套利分析',
    arbitrageDesc: '工厂价 vs 售价 — 你的利润空间',
    margin: '利润率',
    daysWage: '≈ 日薪',
    daysWageDesc: '天当地工资',
    trustTitle: 'AceProxy 保障',
    trustQC: 'AI 质检 — 每件商品发货前都经过检查',
    trustWarranty: '破损保障 — 损坏包换或退款',
    trustConsolidation: '免费集运 — 合并多个订单零费用',
    trustPayment: '安全支付 — Xendit 托管，收货后再放款',
    description: '商品描述',
    reviews: '用户评价',
    noReviews: '该商品暂无评价。',
    addToCart: '加入购物车',
    qty: '数量',
    stock: '库存',
    outOfStock: '缺货',
    inStock: '有货',
    onlyLeft: '仅剩',
    left: '件!',
    share: '分享',
    shareWhatsApp: 'WhatsApp',
    shareCopy: '复制链接',
    copied: '已复制！',
    quickBuy: '1688快速代购',
  },
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lang, setLang] = useState<Lang>('ID');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { addToCart: addToCartFn } = useCart();

  const t = T[lang];

  // ─── Share handlers ───
  function handleShareWhatsApp() {
    if (!product) return;
    const shareUrl = `${window.location.origin}/products/${product.id}`;
    const text = encodeURIComponent(`🔥 ${product.name} — Cuma ${fmtRp(product.priceIdr)} di AceProxy! Belanja langsung dari pabrik China, harga grosir!`);
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function handleCopyLink() {
    if (!product) return;
    const shareUrl = `${window.location.origin}/products/${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function handleQuickBuy1688() {
    if (!product?.sourceUrl) return;
    // Redirect to ArbiBot with the 1688 URL pre-filled for direct purchase
    router.push(`/arbibot?direct=${encodeURIComponent(product.sourceUrl)}&name=${encodeURIComponent(product.name)}`);
  }

  // ─── Fetch ───
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetch(`/api/v1/product/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        const data = json.data || json;
        if (!data || !data.id) throw new Error('Empty');
        setProduct(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Computed values ───
  const images = product ? getEffectiveImages(product) : [];
  const savings = product?.costCny
    ? Math.round(product.priceIdr - product.costCny * 2200)
    : 0;
  const marginPct = product?.costCny
    ? Math.round(((product.priceIdr - product.costCny * 2200) / product.priceIdr) * 100)
    : 0;
  const isOutOfStock = (product?.stock ?? 0) <= 0;

  // ─── Add to Cart handler ───
  function handleAddToCart() {
    if (!product) return;
    addToCartFn({
      productId: product.id,
      name: product.name,
      image: images[0] || '',
      priceIdr: product.priceIdr,
      costCny: product.costCny,
      qty: quantity,
      stock: product.stock,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  }

  // ─── Image handlers ───
  function prevImage() { setSelectedImage(s => (s - 1 + images.length) % images.length); }
  function nextImage() { setSelectedImage(s => (s + 1) % images.length); }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={44} className="animate-spin mx-auto mb-6 text-terracotta" />
          <p className="font-bold text-ink-mute text-lg">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found ───
  if (error || !product) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-black flex items-center justify-center bg-white"
            style={{ boxShadow: '6px 6px 0 #000' }}>
            <Package size={36} className="text-ink-mute" />
          </div>
          <h1 className="font-display text-2xl font-black text-ink uppercase mb-3">{t.error}</h1>
          <p className="text-ink-secondary mb-8">{t.errorDesc}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/products" className="btn-brutal-sm-outline">
              <ArrowLeft size={16} /> {t.backToProducts}
            </Link>
            <button onClick={() => router.reload()} className="btn-brutal-sm">
              <RefreshCw size={16} /> {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───
  return (
    <>
      <Head>
        <title>{product.name} {t.title}</title>
        <meta name="description" content={product.description?.slice(0, 160) || product.name} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description?.slice(0, 160)} />
        {images.length > 0 && <meta property="og:image" content={images[0]} />}
      </Head>

      <div className="min-h-screen bg-canvas-warm font-body">

        {/* ─── Header ─── */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                <span className="font-display font-black text-lg text-ink tracking-tight hidden sm:block">ACEPROXY</span>
              </Link>
              <div className="flex items-center gap-2.5">
                <Link href="/cart" className="relative p-2 border-3 border-black bg-white hover:bg-canvas-gray transition-colors">
                  <ShoppingCart size={20} className="text-ink" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-terracotta text-white text-[10px] font-display font-black flex items-center justify-center border-2 border-black">0</span>
                </Link>
                <Link href="/account" className="btn-brutal-sm text-[13px] !px-4 !py-2">Akun</Link>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Breadcrumb ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider">
            <Link href="/" className="hover:text-terracotta transition-colors"><Home size={14} /></Link>
            <span>/</span>
            <Link href="/products" className="hover:text-terracotta transition-colors">{t.breadcrumbProducts}</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-terracotta transition-colors">{product.category}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-ink truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">

            {/* ===== LEFT: Image Gallery ===== */}
            <div className="mb-8 lg:mb-0">
              {/* Main Image */}
              <div
                className="relative aspect-square bg-canvas-gray border-4 border-black overflow-hidden cursor-pointer group"
                style={{ boxShadow: '6px 6px 0 #000' }}
                onClick={() => setLightboxOpen(true)}>
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-8xl ${images.length > 0 ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
                  📦
                </span>

                {/* Expand Icon Overlay */}
                <div className="absolute top-3 right-3 w-10 h-10 border-3 border-black bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Expand size={20} />
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 border-3 border-black bg-white flex items-center justify-center
                        hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors"
                      style={{ boxShadow: '3px 3px 0 #000' }}>
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 border-3 border-black bg-white flex items-center justify-center
                        hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors"
                      style={{ boxShadow: '3px 3px 0 #000' }}>
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 border-2 border-black bg-white text-xs font-display font-bold">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-20 border-3 transition-colors overflow-hidden
                        ${i === selectedImage ? 'border-terracotta' : 'border-black hover:border-ink-secondary'}`}
                      style={{ boxShadow: i === selectedImage ? '2px 2px 0 #000' : 'none' }}>
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== RIGHT: Product Info ===== */}
            <div>
              {/* Category Badge */}
              {product.category && (
                <Link href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="inline-block px-3 py-1 border-3 border-black bg-canvas-gray
                    text-[11px] font-display font-bold uppercase tracking-widest mb-4
                    hover:bg-ink hover:text-white hover:border-ink transition-colors">
                  {product.category}
                </Link>
              )}

              {/* Product Name */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-ink uppercase tracking-[-0.02em] leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={18}
                      fill={s <= Math.round(parseRatingAvg(product.ratingAvg)) ? '#EAB308' : 'none'}
                      strokeWidth={2}
                      className={s <= Math.round(parseRatingAvg(product.ratingAvg)) ? 'text-warning' : 'text-ink-mute/30'} />
                  ))}
                </div>
                <span className="text-sm font-bold text-ink-secondary">
                  {parseRatingAvg(product.ratingAvg).toFixed(1)} ({parseRatingCount(product.ratingCount)} {t.sold})
                </span>
              </div>

              {/* ─── Price Stack (AceProxy Unique Feature!) ─── */}
              <div className="border-4 border-black bg-white p-5 mb-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h3 className="font-display font-black text-sm text-ink-mute uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={16} /> {t.priceStack}
                </h3>

                {/* Regional Logistics Slot (Independent Site Component) */}
                <div className="mb-6 p-4 bg-ink border-2 border-black">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-display font-black text-terracotta uppercase">Jakarta Regional Slot</span>
                      <span className="text-[10px] font-display font-black text-white uppercase">89% Full</span>
                   </div>
                   <div className="w-full h-3 bg-white/10 border border-white/20">
                      <div className="h-full bg-terracotta animate-pulse" style={{ width: '89%' }}></div>
                   </div>
                   <p className="text-[9px] font-bold text-white/50 uppercase mt-2">
                      Reserve now to lock today's priority express shipment.
                   </p>
                </div>

                {/* Factory Price */}
                <div className="flex items-center justify-between py-2 border-b-2 border-dashed border-black/20">
                  <span className="text-sm font-bold text-ink-secondary">{t.factoryPrice}</span>
                  <span className="text-sm font-display font-bold text-ink">
                    {product.costCny ? fmtCny(product.costCny) : '—'}
                  </span>
                </div>

                {/* AceProxy Price */}
                <div className="flex items-center justify-between py-2 border-b-2 border-dashed border-black/20">
                  <span className="text-sm font-bold text-ink-secondary">{t.aceProxyPrice}</span>
                  <span className="text-lg font-display font-black text-terracotta">
                    {fmtRp(product.priceIdr)}
                  </span>
                </div>

                {/* Savings Summary */}
                <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                  <span className="font-display font-black text-sm text-terracotta uppercase">
                    {t.youSave}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-display font-black text-xl text-terracotta">
                      {fmtRp(savings)}
                    </span>
                    {marginPct > 0 && (
                      <span className="px-2.5 py-0.5 border-2 border-black bg-canvas-warm text-[11px] font-display font-black text-terracotta uppercase">
                        {marginPct}% margin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Arbitrage Analysis ─── */}
              {product.costCny > 0 && (
                <div className="border-4 border-black bg-[#FFFBEB] p-5 mb-6"
                  style={{ boxShadow: '4px 4px 0 #000' }}>
                  <h3 className="font-display font-black text-sm text-ink uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Percent size={16} className="text-warning" /> {t.arbitrageTitle}
                  </h3>
                  <p className="text-xs text-ink-secondary mb-3 leading-relaxed">{t.arbitrageDesc}</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-2xl font-display font-black text-warning">{marginPct}%</div>
                      <div className="text-[10px] font-bold text-ink-mute uppercase">{t.margin}</div>
                    </div>
                    <div className="w-1 h-10 bg-black/20" />
                    <div>
                      <div className="text-2xl font-display font-black text-ink">{fmtRp(savings)}</div>
                      <div className="text-[10px] font-bold text-ink-mute uppercase">{t.youSave}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── VisionQC 2.0 (Elite Trust) ─── */}
              <div className="border-4 border-black bg-ink p-5 mb-6 text-white"
                style={{ boxShadow: '4px 4px 0 #F97316' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-black text-sm text-terracotta uppercase tracking-widest flex items-center gap-2">
                    <Bot size={18} /> VisionQC 2.0 Active
                  </h3>
                  <div className="bg-terracotta px-2 py-0.5 border-2 border-black text-[9px] font-display font-black text-black">
                     PREMIUM TRUST
                  </div>
                </div>
                <p className="text-[11px] font-medium leading-relaxed mb-4 text-white/80">
                  Our AI visual auditor is standing by. Every item in this sourcing node is cross-referenced with manufacturing specs and the 1688 original blueprint before shipment.
                </p>
                <button 
                  onClick={() => Alert.alert('VisionQC 2.0', 'Visual Audit System is locked for this sourcing node.')}
                  className="w-full py-2.5 border-3 border-terracotta text-terracotta font-display font-black text-xs uppercase hover:bg-terracotta hover:text-black transition-all"
                >
                  View Sample Quality Report
                </button>
              </div>

              {/* ─── Stock Status ─── */}
              <div className="flex items-center gap-3 mb-5">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border-3 border-black bg-error text-white text-sm font-display font-bold uppercase">
                    <X size={14} /> {t.outOfStock}
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border-3 border-black bg-success-soft text-success text-sm font-display font-bold uppercase">
                      <Check size={14} /> {t.inStock}
                    </span>
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="text-sm font-bold text-error uppercase">
                        {t.onlyLeft} {product.stock} {t.left}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* ─── Quantity + Add to Cart ─── */}
              {!isOutOfStock && (
                <>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border-3 border-black bg-white"
                      style={{ boxShadow: '3px 3px 0 #000' }}>
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-11 h-11 flex items-center justify-center border-r-3 border-black
                          hover:bg-canvas-gray transition-colors font-display font-black">
                        <Minus size={18} />
                      </button>
                      <div className="w-14 text-center font-display font-black text-lg select-none">
                        {quantity}
                      </div>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        className="w-11 h-11 flex items-center justify-center border-l-3 border-black
                          hover:bg-canvas-gray transition-colors font-display font-black">
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className={`btn-brutal flex-1 text-base gap-2 transition-all ${addedToCart ? '!bg-success !border-success' : ''}`}>
                      {addedToCart ? (
                        <><Check size={20} /> Ditambahkan!</>
                      ) : (
                        <><ShoppingCart size={20} /> {t.addToCart}</>
                      )}
                    </button>
                  </div>

                  {/* View Cart link after adding */}
                  {addedToCart && (
                    <Link href="/cart"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border-3 border-black
                        font-display font-bold text-sm uppercase bg-white
                        hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors mb-4"
                      style={{ boxShadow: '3px 3px 0 #000' }}>
                      Lihat Keranjang <ArrowRight size={14} />
                    </Link>
                  )}
                </>
              )}

              {/* ─── Source Link ─── */}
              {product.sourceUrl && (
                <a href={product.sourceUrl} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black
                    bg-canvas-gray text-xs font-display font-bold text-ink uppercase tracking-wider
                    hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors mb-4">
                  {t.source1688} <ArrowRight size={12} />
                </a>
              )}

              {/* ─── Share Buttons ─── */}
              <div className="border-4 border-black bg-white p-4 mb-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h3 className="font-display font-black text-xs text-ink-mute uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Share2 size={14} /> {t.share}
                </h3>
                <div className="flex gap-2">
                  {/* WhatsApp Share */}
                  <button onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-[#25D366] text-white text-[11px] font-display font-bold uppercase hover:bg-[#1DA851] transition-colors"
                    style={{ boxShadow: '2px 2px 0 #000' }}>
                    <MessageCircle size={14} /> {t.shareWhatsApp}
                  </button>
                  {/* Copy Link */}
                  <button onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black text-[11px] font-display font-bold uppercase transition-colors ${copiedLink ? 'bg-success text-white border-success' : 'bg-white hover:bg-canvas-gray'}`}
                    style={{ boxShadow: '2px 2px 0 #000' }}>
                    {copiedLink ? <CheckCheck size={14} /> : <Copy size={14} />}
                    {copiedLink ? t.copied : t.shareCopy}
                  </button>
                  {/* 1688 Quick Buy */}
                  {product.sourceUrl && (
                    <button onClick={handleQuickBuy1688}
                      className="flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-terracotta text-white text-[11px] font-display font-bold uppercase hover:bg-terracotta/90 transition-colors"
                      style={{ boxShadow: '2px 2px 0 #000' }}>
                      <ExternalLink size={14} /> {t.quickBuy}
                    </button>
                  )}
                </div>
              </div>

              {/* ─── Trust Badges ─── */}
              <div className="border-4 border-black bg-white p-5 mt-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h3 className="font-display font-black text-sm text-ink uppercase tracking-widest mb-4">
                  {t.trustTitle}
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: <Shield size={18} />, text: t.trustQC },
                    { icon: <Award size={18} />, text: t.trustWarranty },
                    { icon: <Truck size={18} />, text: t.trustConsolidation },
                    { icon: <Shield size={18} />, text: t.trustPayment },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b-2 border-dashed border-black/10 last:border-0 last:pb-0">
                      <span className="text-terracotta flex-shrink-0 mt-0.5">{item.icon}</span>
                      <span className="text-sm font-medium text-ink-secondary leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Description ===== */}
          {product.description && (
            <section className="mt-10">
              <h2 className="font-display text-xl sm:text-2xl font-black text-ink uppercase tracking-[-0.02em] mb-5 border-b-4 border-black pb-3">
                {t.description}
              </h2>
              <div className="bg-white border-4 border-black p-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="prose prose-sm max-w-none font-body text-ink-secondary leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>
            </section>
          )}

          {/* ===== Reviews ===== */}
          <section className="mt-10">
            <h2 className="font-display text-xl sm:text-2xl font-black text-ink uppercase tracking-[-0.02em] mb-5 border-b-4 border-black pb-3 flex items-center gap-3">
              {t.reviews}
              <span className="text-base font-body font-bold text-ink-mute normal-case">
                ({parseRatingCount(product.ratingCount)})
              </span>
            </h2>

            {!product.reviews || product.reviews.length === 0 ? (
              <div className="text-center py-14 bg-white border-4 border-black"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <Star size={36} className="mx-auto mb-4 text-ink-mute/30" />
                <p className="font-bold text-ink-mute">{t.noReviews}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className="bg-white border-4 border-black p-5"
                    style={{ boxShadow: '4px 4px 0 #000' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 border-2 border-black bg-canvas-gray flex items-center justify-center font-display font-black text-xs text-ink-mute uppercase">
                          {review.user?.email?.[0] || '?'}
                        </div>
                        <span className="text-sm font-bold text-ink">
                          {review.user?.email?.split('@')[0] || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={14}
                            fill={s <= review.rating ? '#EAB308' : 'none'}
                            strokeWidth={2}
                            className={s <= review.rating ? 'text-warning' : 'text-ink-mute/25'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-ink-secondary leading-relaxed">{review.comment}</p>
                    )}
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, i) => (
                          <img key={i} src={img} alt=""
                            className="w-16 h-16 object-cover border-2 border-black" />
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-[10px] font-bold text-ink-mute uppercase tracking-wider">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ===== Personalized Recommendations ===== */}
          <PersonalizedRecommendations
            title="You May Also Like"
            variant="detail"
            limit={4}
          />
        </div>

        {/* ─── Lightbox ─── */}
        {lightboxOpen && images.length > 0 && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-12 h-12 border-3 border-white text-white flex items-center justify-center
                hover:bg-white hover:text-black transition-colors font-display font-black">
              <X size={24} />
            </button>
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 w-12 h-12 border-3 border-white text-white flex items-center justify-center
                    hover:bg-white hover:text-black transition-colors">
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 w-12 h-12 border-3 border-white text-white flex items-center justify-center
                    hover:bg-white hover:text-black transition-colors">
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ─── Footer ─── */}
        <footer className="bg-ink text-white border-t-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-display font-black text-sm bg-terracotta text-white">A</div>
                  <span className="font-display font-black text-lg tracking-tight">ACEPROXY</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">Belanja langsung dari pabrik China. Harga grosir, kualitas terjamin.</p>
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">Layanan</h4>
                <ul className="space-y-2.5">
                  <li><Link href="/arbibot" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">ArbiBot</Link></li>
                  <li><Link href="/products" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">Semua Produk</Link></li>
                  <li><Link href="/virtual-account" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">Virtual Account</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">Perusahaan</h4>
                <ul className="space-y-2.5">
                  <li><span className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer font-bold">Tentang Kami</span></li>
                  <li><span className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer font-bold">Kebijakan Privasi</span></li>
                  <li><Link href="/admin" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">Admin Panel</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">Kontak</h4>
                <ul className="space-y-2.5 text-sm text-white/70">
                  <li className="font-bold">WhatsApp: +62 812-xxxx-xxxx</li>
                  <li className="font-bold">Email: support@aceproxy.id</li>
                  <li className="font-bold">Jakarta, Indonesia</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-6 border-t-2 border-white/10 text-center">
              <p className="text-xs text-white/40 font-bold tracking-wider uppercase">© 2026 AceProxy. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
