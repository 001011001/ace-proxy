/**
 * 商品相关类型
 */
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  sourceUrl: string | null;
  priceIdr: number;
  costCny: number | null;
  imageUrls: string | null;
  stock: number;
  status: ProductStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  // 关联
  heroProduct?: HeroProduct;
  localizations?: ProductLocalization[];
}

export interface HeroProduct {
  id: string;
  name: string;
  category: string | null;
  sourcePriceCny: number | null;
  localPriceIdr: number | null;
  arbitrageGapPct: number | null;
  status: string;
  patentStatus: string;
  lastAuditAt: string;
}

export interface ProductLocalization {
  id: string;
  country: string;
  name: string;
  description: string | null;
  priceLocal: number;
  currency: string;
  shippingCost: number;
  orderCount: number;
  ratingAvg: number;
  isActive: boolean;
}

export interface ProductListQuery {
  category?: string;
  status?: ProductStatus;
  country?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
}
