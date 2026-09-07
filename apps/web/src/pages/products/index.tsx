import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search, ArrowRight, ArrowLeft, ArrowUpDown, Package,
  RefreshCw, Filter, X, ChevronDown, Grid3X3, List,
  Percent, Star, ShoppingCart, Home,
} from 'lucide-react';

// ─── Types ───
interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  priceIdr: number;
  costCny: number;
  images: string[];
  imageUrls?: string;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Category {
  name: string;
  count: number;
}

// ─── Helpers ───
function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

function getImageUrl(images: string[], fallback: string): string {
  if (images?.length > 0) {
    const src = images[0];
    if (src?.startsWith('http')) return src;
    if (src?.startsWith('[')) {
      try { const arr = JSON.parse(src); return arr[0] || fallback; } catch { return fallback; }
    }
    return src;
  }
  return fallback;
}

function getEffectiveImages(row: any): string[] {
  if (row.images?.length) return row.images;
  if (row.imageUrls) {
    try { return JSON.parse(row.imageUrls); } catch { return []; }
  }
  return [];
}

// ─── Translation ───
type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'Semua Produk — AceProxy',
    heading: 'Semua Produk',
    search: 'Cari produk...',
    allCategories: 'Semua Kategori',
    sortDefault: 'Urut: Default',
    sortPriceAsc: 'Harga: Rendah → Tinggi',
    sortPriceDesc: 'Harga: Tinggi → Rendah',
    sortNewest: 'Terbaru',
    sortPopular: 'Terpopuler',
    showing: 'Menampilkan',
    of: 'dari',
    products: 'produk',
    prev: 'Sebelumnya',
    next: 'Berikutnya',
    loading: 'Memuat produk...',
    error: 'Server sedang sibuk. Silakan coba lagi.',
    retry: 'Coba Lagi',
    empty: 'Belum ada produk tersedia.',
    emptyAction: 'Tambah Produk di Admin',
    saveTag: 'HEMAT',
    source: '1688 Source',
    clearFilters: 'Hapus Filter',
  },
  EN: {
    title: 'All Products — AceProxy',
    heading: 'All Products',
    search: 'Search products...',
    allCategories: 'All Categories',
    sortDefault: 'Sort: Default',
    sortPriceAsc: 'Price: Low → High',
    sortPriceDesc: 'Price: High → Low',
    sortNewest: 'Newest',
    sortPopular: 'Most Popular',
    showing: 'Showing',
    of: 'of',
    products: 'products',
    prev: 'Previous',
    next: 'Next',
    loading: 'Loading products...',
    error: 'Server busy. Please try again.',
    retry: 'Retry',
    empty: 'No products available yet.',
    emptyAction: 'Add Products in Admin',
    saveTag: 'SAVE',
    source: '1688 Source',
    clearFilters: 'Clear Filters',
  },
  ZH: {
    title: '全部商品 — AceProxy',
    heading: '全部商品',
    search: '搜索商品...',
    allCategories: '全部分类',
    sortDefault: '排序: 默认',
    sortPriceAsc: '价格: 低 → 高',
    sortPriceDesc: '价格: 高 → 低',
    sortNewest: '最新',
    sortPopular: '最热',
    showing: '显示',
    of: '/',
    products: '件商品',
    prev: '上一页',
    next: '下一页',
    loading: '加载商品中...',
    error: '服务器繁忙，请重试。',
    retry: '重试',
    empty: '暂无商品。',
    emptyAction: '去管理后台添加商品',
    saveTag: '省',
    source: '1688 货源',
    clearFilters: '清除筛选',
  },
};

// ─── Sort options ───
const SORT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '', labelKey: 'sortDefault' },
  { value: 'price_asc', labelKey: 'sortPriceAsc' },
  { value: 'price_desc', labelKey: 'sortPriceDesc' },
  { value: 'newest', labelKey: 'sortNewest' },
  { value: 'popular', labelKey: 'sortPopular' },
];

// ─── Page ───
export default function ProductsPage() {
  const router = useRouter();
  const { category: qCat, search: qSearch, sort: qSort, page: qPage } = router.query as Record<string, string>;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('ID');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter state — synced from URL
  const [selectedCategory, setSelectedCategory] = useState(qCat || '');
  const [searchQuery, setSearchQuery] = useState(qSearch || '');
  const [currentSort, setCurrentSort] = useState(qSort || '');
  const [currentPage, setCurrentPage] = useState(parseInt(qPage || '1'));

  const t = T[lang];

  // ─── Data fetching ───
  const fetchProducts = useCallback(async (page: number, cat: string, search: string, sort: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (cat) params.set('category', cat);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/v1/product/list?${params.toString()}`);
      if (!res.ok) throw new Error('API unavailable');
      const json = await res.json();
      const data = json.data || json;
      setProducts(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      setError('Server sedang sibuk');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/product/categories');
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || json || []);
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Initial load & URL sync ───
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!router.isReady) return;
    const cat = qCat || '';
    const search = qSearch || '';
    const sort = qSort || '';
    const page = parseInt(qPage || '1');
    setSelectedCategory(cat);
    setSearchQuery(search);
    setCurrentSort(sort);
    setCurrentPage(page);
    fetchProducts(page, cat, search, sort);
  }, [router.isReady, qCat, qSearch, qSort, qPage, fetchProducts]);

  // ─── URL updater ───
  function updateUrl(updates: Record<string, string>) {
    const newQuery = {
      ...(qCat ? { category: qCat } : {}),
      ...(qSearch ? { search: qSearch } : {}),
      ...(qSort ? { sort: qSort } : {}),
      ...(qPage && qPage !== '1' ? { page: qPage } : {}),
    };
    Object.entries(updates).forEach(([k, v]) => {
      if (v) newQuery[k] = v;
      else delete newQuery[k];
    });
    // Reset page when filters change (unless updating page itself)
    if (!('page' in updates)) {
      delete newQuery.page;
    }
    router.push({ pathname: '/products', query: newQuery as any }, undefined, { shallow: true });
  }

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    setCurrentPage(1);
    updateUrl({ category: cat });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    updateUrl({ search: searchQuery });
  }

  function handleSortChange(sort: string) {
    setCurrentSort(sort);
    setCurrentPage(1);
    updateUrl({ sort });
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    updateUrl({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Breadcrumb ───
  const breadcrumb = (
    <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-4">
      <Link href="/" className="hover:text-terracotta transition-colors">
        <Home size={14} />
      </Link>
      <span>/</span>
      <span className="text-ink">{t.heading}</span>
    </div>
  );

  // ─── Active Filter Tags ───
  const hasActiveFilters = selectedCategory || qSearch || currentSort;
  const activeFilters = (
    <>
      {selectedCategory && (
        <button
          onClick={() => handleCategoryChange('')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-terracotta text-white text-xs font-display font-bold uppercase
            hover:bg-ink transition-colors">
          {selectedCategory} <X size={13} />
        </button>
      )}
      {qSearch && (
        <button
          onClick={() => { setSearchQuery(''); setCurrentPage(1); updateUrl({ search: '' }); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-ink text-white text-xs font-display font-bold uppercase
            hover:bg-terracotta transition-colors">
          "{qSearch}" <X size={13} />
        </button>
      )}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSelectedCategory('');
            setSearchQuery('');
            setCurrentSort('');
            setCurrentPage(1);
            router.push('/products', undefined, { shallow: true });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-display font-bold uppercase
            hover:bg-canvas-gray transition-colors">
          {t.clearFilters}
        </button>
      )}
    </>
  );

  // ─── Pagination component ───
  const paginationEl = pagination.totalPages > 1 && (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-4 py-2.5 border-3 border-black font-display font-bold text-sm uppercase
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:bg-canvas-gray transition-colors bg-white"
        style={{ boxShadow: '3px 3px 0 #000' }}>
        <ArrowLeft size={16} />
      </button>

      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`w-10 h-10 border-3 border-black font-display font-bold text-sm
            transition-colors ${p === currentPage
              ? 'bg-terracotta text-white border-terracotta'
              : 'bg-white hover:bg-canvas-gray'}`}
          style={{ boxShadow: '3px 3px 0 #000' }}>
          {p}
        </button>
      ))}

      <button
        disabled={currentPage >= pagination.totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-4 py-2.5 border-3 border-black font-display font-bold text-sm uppercase
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:bg-canvas-gray transition-colors bg-white"
        style={{ boxShadow: '3px 3px 0 #000' }}>
        <ArrowRight size={16} />
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content="Browse all products — factory direct from 1688 China." />
      </Head>

      <div className="min-h-screen bg-canvas-warm font-body">

        {/* ─── Header (same as index.tsx) ─── */}
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
                <Link href="/login" className="btn-brutal-sm text-[13px] !px-4 !py-2">
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {breadcrumb}

          {/* ─── Filter Bar ─── */}
          <div className="bg-white border-4 border-black p-4 sm:p-5 mb-6"
            style={{ boxShadow: '4px 4px 0 #000' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="w-full pl-9 pr-4 py-2.5 border-3 border-black text-sm font-medium
                    outline-none focus:border-terracotta bg-canvas-warm"
                />
              </form>

              {/* Category Dropdown (Desktop) */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="hidden sm:block px-4 py-2.5 border-3 border-black font-display font-bold text-sm
                  bg-white outline-none focus:border-terracotta cursor-pointer uppercase"
                style={{ boxShadow: '3px 3px 0 #000' }}>
                <option value="">⬛ {t.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>⬛ {cat.name} ({cat.count})</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2.5 border-3 border-black font-display font-bold text-sm
                  bg-white outline-none focus:border-terracotta cursor-pointer uppercase"
                style={{ boxShadow: '3px 3px 0 #000' }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>⬛ {t[opt.labelKey]}</option>
                ))}
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="sm:hidden inline-flex items-center gap-1.5 px-4 py-2.5 border-3 border-black
                  font-display font-bold text-sm uppercase bg-white hover:bg-canvas-gray transition-colors"
                style={{ boxShadow: '3px 3px 0 #000' }}>
                <Filter size={16} /> Filter
              </button>
            </div>

            {/* Mobile Category Filter (expandable) */}
            {showMobileFilter && (
              <div className="mt-3 pt-3 border-t-2 border-black grid grid-cols-2 gap-2">
                <button
                  onClick={() => { handleCategoryChange(''); setShowMobileFilter(false); }}
                  className={`text-left px-3 py-2 border-2 border-black text-xs font-display font-bold uppercase
                    transition-colors ${!selectedCategory ? 'bg-terracotta text-white' : 'bg-canvas-gray hover:bg-terracotta hover:text-white'}`}>
                  ⬛ {t.allCategories}
                </button>
                {categories.map(cat => (
                  <button key={cat.name}
                    onClick={() => { handleCategoryChange(cat.name); setShowMobileFilter(false); }}
                    className={`text-left px-3 py-2 border-2 border-black text-xs font-display font-bold uppercase
                      transition-colors ${selectedCategory === cat.name ? 'bg-terracotta text-white' : 'bg-canvas-gray hover:bg-terracotta hover:text-white'}`}>
                    ⬛ {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Active Filters & Count */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {activeFilters}
              {!loading && !error && (
                <span className="text-xs font-display font-bold text-ink-mute uppercase tracking-wider ml-auto">
                  {t.showing} {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, pagination.total)} {t.of} {pagination.total} {t.products}
                </span>
              )}
            </div>
          </div>

          {/* ─── Product Grid ─── */}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-28 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <RefreshCw size={40} className="animate-spin mx-auto mb-6 text-terracotta" />
              <p className="font-bold text-ink-mute text-lg">{t.loading}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-28 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <p className="font-bold text-ink-mute mb-6 text-lg">{t.error}</p>
              <button onClick={() => fetchProducts(currentPage, selectedCategory, searchQuery, currentSort)}
                className="btn-brutal-sm">
                <RefreshCw size={16} /> {t.retry}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-28 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <Package size={56} className="mx-auto mb-6 text-ink-mute" />
              <p className="font-bold text-ink-mute mb-6 text-lg">{t.empty}</p>
              <Link href="/admin/products" className="btn-brutal-sm">
                <ArrowRight size={16} /> {t.emptyAction}
              </Link>
            </div>
          )}

          {/* Product Cards */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map(product => {
                  const imgs = getEffectiveImages(product);
                  return (
                    <Link key={product.id} href={`/products/${product.id}`}
                      className="card-brutal group">
                      {/* Product Image */}
                      <div className="aspect-square bg-canvas-gray flex items-center justify-center overflow-hidden border-b-4 border-black relative">
                        {imgs.length > 0 ? (
                          <img
                            src={getImageUrl(imgs, '')}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-5xl ${imgs.length > 0 ? 'hidden' : ''}`}>📦</span>

                        {/* Stock Alert */}
                        {product.stock > 0 && product.stock <= 5 && (
                          <span className="absolute top-2 left-2 bg-white border-2 border-black px-2 py-0.5 text-[10px] font-display font-bold text-error uppercase">
                            Only {product.stock} left
                          </span>
                        )}
                        {/* Rating Badge */}
                        {product.ratingCount > 0 && (
                          <span className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-0.5 text-[10px] font-display font-bold text-warning uppercase flex items-center gap-1">
                            <Star size={10} fill="#EAB308" strokeWidth={2} /> {product.ratingAvg.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <span className="inline-block px-2.5 py-0.5 border-2 border-black bg-canvas-gray text-[10px] font-display font-bold uppercase tracking-widest mb-3">
                          {t.source}
                        </span>
                        <h3 className="font-display font-bold text-sm text-ink mb-3 line-clamp-2 leading-snug
                          group-hover:text-terracotta transition-colors">
                          {product.name}
                        </h3>

                        {/* Price Row */}
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-xl font-display font-black text-terracotta">
                              {fmtRp(product.priceIdr)}
                            </div>
                          </div>
                          {product.ratingCount > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-ink-mute">
                              <Star size={12} className="text-warning fill-warning" />
                              {product.ratingAvg.toFixed(1)} ({product.ratingCount})
                            </div>
                          )}
                        </div>

                        {/* Category Tag */}
                        <div className="mt-2">
                          <span className="inline-block text-[10px] font-bold text-ink-mute uppercase tracking-wider">
                            {product.category || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {paginationEl}
            </>
          )}

        </div>

        {/* ─── Footer ─── */}
        <footer className="bg-ink text-white border-t-4 border-black mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-display font-black text-sm bg-terracotta text-white">A</div>
                  <span className="font-display font-black text-lg tracking-tight">ACEPROXY</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Belanja langsung dari pabrik China. Harga grosir, kualitas terjamin.
                </p>
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">Layanan</h4>
                <ul className="space-y-2.5">
                  <li><Link href="/arbibot" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">ArbiBot</Link></li>
                  <li><Link href="/products" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">Semua Produk</Link></li>
                  <li><Link href="/virtual-account" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">Virtual Account</Link></li>
                  <li><Link href="/warehouse" className="text-sm text-white/70 hover:text-terracotta transition-colors font-bold">NT Warehouse</Link></li>
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
