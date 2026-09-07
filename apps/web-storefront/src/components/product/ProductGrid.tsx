import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types/api';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  /** 空状态点击行为（如「重置筛选」） */
  onEmptyAction?: () => void;
  showGap?: boolean;
}

/** 商品网格 — 响应式 2/3/4 列 */
export function ProductGrid({ products, isLoading, onEmptyAction, showGap = false }: ProductGridProps) {
  const { t } = useTranslation();

  if (isLoading) return <ProductGridSkeleton count={8} />;

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title={t('products.noResults')}
        description={t('products.noResultsDesc')}
        actionLabel={onEmptyAction ? t('products.reset') : undefined}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-lg2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} showGap={showGap} />
      ))}
    </div>
  );
}
