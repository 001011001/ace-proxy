import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { ProductGrid } from '@/components/product/ProductGrid';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProducts, useStationHome } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import type { ProductQuery } from '@/types/api';

const SORT_OPTIONS = [
  { value: 'newest', key: 'products.sortNewest' },
  { value: 'price_asc', key: 'products.sortPriceAsc' },
  { value: 'price_desc', key: 'products.sortPriceDesc' },
  { value: 'popular', key: 'products.sortPopular' },
] as const;

const PAGE_SIZE = 12;

export default function ProductListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── 筛选状态（由 URL 驱动，可分享/可后退） ───
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = (searchParams.get('sort') as ProductQuery['sort']) || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // 搜索输入本地状态（防抖后再写入 URL）
  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // 防抖：输入停止 400ms 后才触发查询
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParam('search', searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /** 更新单个参数（自动重置到第一页） */
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    // 除翻页外，任何筛选变化都重置页码
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  const handleReset = () => {
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  // 站点分类（trendingCategories）
  const { data: station } = useStationHome('jakarta');

  // 查询参数
  const query: ProductQuery = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      category: category || undefined,
      sort,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    [page, search, category, sort, minPrice, maxPrice],
  );

  const { data, isLoading } = useProducts(query);
  const products = data?.items ?? [];
  const pagination = data?.pagination;

  const hasActiveFilters = !!(search || category || minPrice || maxPrice || sort !== 'newest');

  return (
    <div className="mx-auto max-w-7xl px-lg2 py-xl2">
      {/* 页头 */}
      <div className="mb-xl2">
        <h1 className="font-display text-display-md uppercase tracking-tight">
          {t('products.title')}
        </h1>
        {pagination && (
          <p className="mt-sm2 font-body text-body-md text-ink-mute">
            {t('products.resultCount', { count: pagination.total })}
          </p>
        )}
      </div>

      {/* ─── 搜索 + 筛选栏 ─── */}
      <div className="mb-lg2 flex flex-col gap-md2 lg:flex-row lg:items-center">
        {/* 搜索 */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="pl-12"
            aria-label={t('products.searchPlaceholder')}
          />
        </div>

        {/* 排序 */}
        <div className="w-full lg:w-56">
          <Select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            aria-label={t('products.sortBy')}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.key)}
              </option>
            ))}
          </Select>
        </div>

        {/* 筛选开关（移动端） */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="lg:hidden"
        >
          <SlidersHorizontal size={16} />
          {t('products.filterCategory')}
        </Button>
      </div>

      {/* ─── 分类 chips + 价格区间 ─── */}
      <div
        className={cn(
          'mb-xl2 overflow-hidden transition-all duration-200',
          showFilters ? 'max-h-96' : 'max-h-0 lg:max-h-96',
        )}
      >
        <div className="rounded-sm border-3 border-ink bg-canvas-warm p-lg2">
          {/* 分类 */}
          <div className="mb-md2">
            <p className="mb-sm2 font-body text-caption font-bold uppercase tracking-widest text-ink-mute">
              {t('products.filterCategory')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParam('category', '')}
                className={cn(
                  'rounded-pill border-3 border-ink px-4 py-2 font-body text-body-sm font-bold transition-all',
                  !category ? 'bg-terracotta text-white shadow-brutal-sm' : 'bg-white hover:bg-canvas-gray',
                )}
              >
                {t('products.allCategories')}
              </button>

              {(station?.trendingCategories ?? []).map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => updateParam('category', cat.name)}
                  className={cn(
                    'rounded-pill border-3 border-ink px-4 py-2 font-body text-body-sm font-bold transition-all',
                    category === cat.name
                      ? 'bg-terracotta text-white shadow-brutal-sm'
                      : 'bg-white hover:bg-canvas-gray',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 价格区间 */}
          <div className="flex flex-wrap items-end gap-md2 border-t-3 border-ink pt-md2">
            <div className="w-32">
              <p className="mb-xs font-body text-micro font-bold uppercase text-ink-mute">
                {t('products.minPrice')}
              </p>
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="py-2"
              />
            </div>
            <div className="w-32">
              <p className="mb-xs font-body text-micro font-bold uppercase text-ink-mute">
                {t('products.maxPrice')}
              </p>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="∞"
                className="py-2"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                updateParam('minPrice', minPrice);
                updateParam('maxPrice', maxPrice);
              }}
            >
              {t('products.apply')}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X size={14} />
                {t('products.reset')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── 活跃筛选标签 ─── */}
      {hasActiveFilters && (
        <div className="mb-lg2 flex flex-wrap items-center gap-2">
          {search && (
            <Badge tone="terracotta">
              "{search}"<button onClick={() => { setSearchInput(''); updateParam('search', ''); }}><X size={12} /></button>
            </Badge>
          )}
          {category && (
            <Badge tone="ocean">
              {category}
              <button onClick={() => updateParam('category', '')}><X size={12} /></button>
            </Badge>
          )}
        </div>
      )}

      {/* ─── 商品网格 ─── */}
      <ProductGrid products={products} isLoading={isLoading} onEmptyAction={handleReset} />

      {/* ─── 分页 ─── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-huge flex items-center justify-center gap-md2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam('page', String(page - 1))}
          >
            <ChevronLeft size={16} />
          </Button>

          <span className="rounded-pill border-3 border-ink bg-white px-4 py-2 font-mono text-body-sm font-bold shadow-brutal-sm">
            {page} / {pagination.totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => updateParam('page', String(page + 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
