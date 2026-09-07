import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Sparkles, Heart, TrendingUp, RefreshCw } from 'lucide-react';

interface RecommendedProduct {
  id: string;
  name: string;
  priceIdr: number;
  category: string;
  imageUrls?: string;
  ratingAvg: number;
  recommendedBecause?: string;
}

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

function getFirstImage(product: RecommendedProduct): string {
  if (!product.imageUrls) return '';
  try {
    const arr = JSON.parse(product.imageUrls);
    return Array.isArray(arr) ? arr[0] || '' : '';
  } catch {
    return product.imageUrls.startsWith('http') ? product.imageUrls : '';
  }
}

interface PersonalizedRecommendationsProps {
  userId?: string;
  title?: string;
  limit?: number;
  /** 'home' | 'detail' | 'cart' affects layout style */
  variant?: 'home' | 'detail' | 'cart';
}

/**
 * PersonalizedRecommendations — 个性化推荐组件
 * 
 * 数据源：UserAnalyticsService.getPersonalizedRecommendations()
 * 基于 RFM 模型的用户偏好评级推荐
 */
export default function PersonalizedRecommendations({
  userId,
  title,
  limit = 4,
  variant = 'home',
}: PersonalizedRecommendationsProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError(false);
      try {
        // Try personalized recommendations if userId provided
        if (userId) {
          const res = await fetch(`/api/v1/user-analytics/recommendations/${userId}`);
          if (res.ok) {
            const json = await res.json();
            const items = json.data || json;
            if (items.length > 0) {
              setProducts(items.slice(0, limit));
              setLoading(false);
              return;
            }
          }
        }

        // Fallback: trending products from station endpoint
        const res = await fetch(`/api/v1/product/list?limit=${limit}&orderBy=ratingCount`);
        if (res.ok) {
          const json = await res.json();
          const items = (json.data?.items || json.data || []).map((p: any) => ({
            ...p,
            priceIdr: Number(p.priceIdr),
            ratingAvg: Number(p.ratingAvg),
          }));
          setProducts(items.slice(0, limit));
        } else {
          throw new Error('Failed');
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, limit]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-10">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-5 h-5 bg-canvas-gray border-2 border-black animate-pulse" />
          <div className="h-6 w-40 bg-canvas-gray border-2 border-black animate-pulse" />
        </div>
        <div className={`grid gap-4 ${
          variant === 'cart'
            ? 'grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
        }`}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-white border-4 border-black p-3 animate-pulse"
              style={{ boxShadow: '3px 3px 0 #000' }}>
              <div className="aspect-square bg-canvas-gray border-2 border-black mb-3" />
              <div className="h-3 bg-canvas-gray border border-black mb-2 w-3/4" />
              <div className="h-5 bg-canvas-gray border border-black w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error / Empty
  if (error || products.length === 0) {
    return null; // Don't show anything rather than an empty section
  }

  const displayTitle = title || (
    variant === 'cart' ? 'You Might Also Like' :
    variant === 'detail' ? 'Similar Products' :
    'Recommended For You'
  );

  const TitleIcon = variant === 'cart' ? Heart : variant === 'detail' ? TrendingUp : Sparkles;

  return (
    <section className={variant === 'cart' ? 'mt-6' : 'py-10'}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <TitleIcon size={20} className="text-terracotta" />
        <h2 className="font-display font-black text-lg text-ink uppercase tracking-[-0.01em]">
          {displayTitle}
        </h2>
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${
        variant === 'cart'
          ? 'grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
      }`}>
        {products.map(product => {
          const img = getFirstImage(product);
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="card-brutal group">
              
              {/* Image */}
              <div className="aspect-square bg-canvas-gray overflow-hidden border-b-4 border-black relative">
                {img ? (
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-4xl">📦</span>
                )}

                {/* Recommendation reason badge */}
                {product.recommendedBecause && (
                  <span className="absolute bottom-1.5 left-1.5 bg-white border-2 border-black px-2 py-0.5 text-[9px] font-display font-bold text-terracotta uppercase">
                    {product.recommendedBecause.length > 24
                      ? product.recommendedBecause.slice(0, 24) + '...'
                      : product.recommendedBecause}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-display font-bold text-xs text-ink line-clamp-2 leading-snug mb-2
                  group-hover:text-terracotta transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-end justify-between">
                  <div className="font-display font-black text-sm text-terracotta">
                    {fmtRp(product.priceIdr)}
                  </div>
                  {product.ratingAvg > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-ink-mute">
                      <Star size={10} className="text-warning fill-warning" />
                      {product.ratingAvg.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
