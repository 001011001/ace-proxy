import { Link } from 'react-router-dom';
import { Star, TrendingUp, PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn, placeholderImage } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
  /** 显示"利差"徽章（首页爆款用） */
  showGap?: boolean;
}

/**
 * ProductCard — Neo-Brutalism 商品卡片
 *
 * 设计要点：
 * - 硬阴影 + 粗边框，hover 时阴影放大、卡片上浮（物理感）
 * - 利差徽章（terracotta）突出"省多少"，是 AceProxy 的核心价值
 * - 缺货状态禁用加购，避免无效交互
 */
export function ProductCard({ product, showGap = false }: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage = product.images?.[0] || placeholderImage(product.id);
  const isOutOfStock = product.stock <= 0;

  // 利差 = (售价 - 成本) / 售价，成本按 CNY→IDR 粗算展示（仅作视觉参考）
  const gapPct = product.priceIdr > 0 ? Math.round(((product.priceIdr - product.costCny) / product.priceIdr) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止 Link 跳转
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      priceIdr: product.priceIdr,
      costCny: product.costCny,
      image: primaryImage,
      stock: product.stock,
    });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-sm border-3 border-ink bg-white',
        'shadow-brutal-md transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-brutal-lg',
      )}
    >
      {/* 图片区 */}
      <div className="relative aspect-square overflow-hidden border-b-3 border-ink bg-canvas-warm">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // 图片加载失败 → 占位图兜底
            (e.currentTarget as HTMLImageElement).src = placeholderImage(product.id);
          }}
        />

        {/* 利差徽章 — 核心价值主张 */}
        {showGap && gapPct > 0 && (
          <div className="absolute left-2 top-2">
            <Badge tone="terracotta" className="shadow-brutal-sm">
              <TrendingUp size={12} />-{gapPct}%
            </Badge>
          </div>
        )}

        {/* 缺货遮罩 */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
            <span className="flex items-center gap-1 rounded-pill border-3 border-white px-3 py-1 font-display text-heading-sm text-white">
              <PackageOpen size={14} />
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex flex-1 flex-col p-sm2">
        {/* 分类 */}
        {product.category && (
          <span className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
            {product.category}
          </span>
        )}

        {/* 标题 — 两行截断 */}
        <h3 className="mt-xs line-clamp-2 font-body text-body-sm font-bold leading-tight text-ink">
          {product.name}
        </h3>

        {/* 评分 */}
        {product.ratingCount > 0 && (
          <div className="mt-xs flex items-center gap-1">
            <Star size={12} className="fill-warning text-warning" />
            <span className="font-body text-micro font-bold text-ink">
              {product.ratingAvg.toFixed(1)}
            </span>
            <span className="font-body text-micro text-ink-mute">({product.ratingCount})</span>
          </div>
        )}

        {/* 价格 + 加购 */}
        <div className="mt-auto pt-md2">
          <p className="font-display text-heading-md text-ink">{formatPrice(product.priceIdr)}</p>

          <Button
            variant={isOutOfStock ? 'secondary' : 'primary'}
            size="sm"
            fullWidth
            className="mt-sm2"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}
          </Button>
        </div>
      </div>
    </Link>
  );
}
