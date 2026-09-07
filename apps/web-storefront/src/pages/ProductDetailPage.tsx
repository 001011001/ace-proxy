import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ShoppingCart, Zap, Minus, Plus, PackageOpen, ArrowLeft } from 'lucide-react';

import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PriceStack } from '@/components/product/PriceStack';
import { TrustCard } from '@/components/product/TrustCard';
import { ProductCard } from '@/components/product/ProductCard';
import { FullPageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, cn, placeholderImage } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  // 相关商品（同分类）— 必须在早期返回之前调用 hook
  // product 首帧为 null，加载完成后 category 生效并自动重新请求
  const { data: relatedData } = useProducts(
    product?.category ? { category: product.category, limit: 5 } : { limit: 5 },
  );

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <FullPageLoader />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-lg2 py-huge">
        <EmptyState
          icon={<PackageOpen size={48} />}
          title={t('common.error')}
          description={error || t('products.noResults')}
          actionLabel={t('common.back')}
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [placeholderImage(product.id)];
  const isOutOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);

  // 同分类推荐（排除当前商品，最多 4 件）
  const relatedProducts = (relatedData?.items ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        priceIdr: product.priceIdr,
        costCny: product.costCny,
        image: images[0],
        stock: product.stock,
      },
      quantity,
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-lg2 py-xl2">
      {/* 面包屑 */}
      <Link
        to="/products"
        className="mb-lg2 inline-flex items-center gap-1 font-body text-body-sm font-bold text-ink-mute hover:text-terracotta"
      >
        <ArrowLeft size={16} />
        {t('products.title')}
      </Link>

      <div className="grid gap-xl2 lg:grid-cols-2">
        {/* ══════ 左：图库 ══════ */}
        <div>
          <div className="overflow-hidden rounded-sm border-3 border-ink bg-canvas-warm shadow-brutal-md">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="aspect-square w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = placeholderImage(product.id);
              }}
            />
          </div>

          {/* 缩略图 */}
          {images.length > 1 && (
            <div className="mt-md2 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'h-20 w-20 shrink-0 overflow-hidden rounded-xs border-3 bg-canvas-warm transition-all',
                    idx === activeImage ? 'border-terracotta shadow-brutal-sm' : 'border-ink hover:border-terracotta',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══════ 右：信息 + 购买 ══════ */}
        <div>
          {/* 分类 + 状态 */}
          <div className="mb-md2 flex flex-wrap items-center gap-2">
            {product.category && <Badge tone="ocean">{product.category}</Badge>}
            {isOutOfStock ? (
              <Badge tone="error">{t('product.outOfStock')}</Badge>
            ) : (
              <Badge tone="success">{t('product.stock', { count: product.stock })}</Badge>
            )}
          </div>

          <h1 className="font-display text-heading-xl leading-tight tracking-tight">{product.name}</h1>

          {/* 评分 */}
          {product.ratingCount > 0 && (
            <div className="mt-md2 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={cn(
                      i < Math.round(product.ratingAvg) ? 'fill-warning text-warning' : 'text-canvas-gray',
                    )}
                  />
                ))}
              </div>
              <span className="font-body text-body-sm font-bold">{product.ratingAvg.toFixed(1)}</span>
              <span className="font-body text-body-sm text-ink-mute">({product.ratingCount})</span>
            </div>
          )}

          {/* 价格栈 */}
          <div className="mt-lg2">
            <PriceStack costCny={product.costCny} priceIdr={product.priceIdr} />
          </div>

          {/* 数量 + 购买 */}
          <div className="mt-lg2 flex flex-wrap items-center gap-md2">
            {/* 数量选择器 */}
            <div className="flex items-center rounded-pill border-3 border-ink bg-white shadow-brutal-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-l-pill transition-colors hover:bg-canvas-warm disabled:opacity-40"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-mono text-body-md font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="flex h-11 w-11 items-center justify-center rounded-r-pill transition-colors hover:bg-canvas-warm disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1"
            >
              <ShoppingCart size={18} />
              {t('product.addToCart')}
            </Button>

            <Button variant="secondary" size="md" onClick={handleBuyNow} disabled={isOutOfStock}>
              <Zap size={18} />
              {t('product.buyNow')}
            </Button>
          </div>

          {/* 信任卡 */}
          <div className="mt-xl2">
            <TrustCard />
          </div>
        </div>
      </div>

      {/* ══════ 描述 + 评价 ══════ */}
      <div className="mt-huge grid gap-xl2 lg:grid-cols-3">
        {/* 描述 */}
        <div className="lg:col-span-2">
          <h2 className="border-b-3 border-ink pb-sm2 font-display text-heading-lg">
            {t('product.description')}
          </h2>
          <p className="mt-md2 whitespace-pre-line font-body text-body-md leading-relaxed text-ink-secondary">
            {product.description || '—'}
          </p>
        </div>

        {/* 评价 */}
        <div>
          <h2 className="border-b-3 border-ink pb-sm2 font-display text-heading-lg">
            {t('product.reviews')}
          </h2>

          {product.reviews && product.reviews.length > 0 ? (
            <ul className="mt-md2 space-y-md2">
              {product.reviews.map((review) => (
                <li key={review.id} className="rounded-sm border-3 border-ink bg-white p-md2">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-body-sm font-bold">
                      {review.user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-warning text-warning' : 'text-canvas-gray'}
                        />
                      ))}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-xs font-body text-body-sm text-ink-mute">{review.comment}</p>
                  )}
                  <p className="mt-xs font-mono text-micro text-ink-mute">
                    {formatDate(review.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-md2 font-body text-body-sm text-ink-mute">{t('product.noReviews')}</p>
          )}
        </div>
      </div>

      {/* ══════ 相关商品 ══════ */}
      {relatedProducts.length > 0 && (
        <div className="mt-huge border-t-3 border-ink pt-xl2">
          <h2 className="mb-lg2 font-display text-heading-xl uppercase tracking-tight">
            {t('product.relatedProducts')}
          </h2>
          <div className="grid grid-cols-2 gap-lg2 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} showGap />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
