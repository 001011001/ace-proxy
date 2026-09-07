/**
 * 前端 API 类型定义
 * 
 * 与 @ace-proxy/shared 包保持一致
 * 此处为前端独立副本，避免 monorepo 依赖问题
 */

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Product ────────────────────────────────────────────────────
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
  status: string;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ──────────────────────────────────────────────────────
export interface Order {
  id: string;
  userId: string;
  partnerId: string | null;
  status: string;
  country: string | null;
  totalAmount: number;
  sourceCost: number | null;
  shippingFee: number | null;
  serviceFee: number | null;
  commissionAmount: number;
  createdAt: string;
  items?: OrderItem[];
  logisticsNodes?: LogisticsNode[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    name: string;
    imageUrls: string | null;
  };
}

export interface LogisticsNode {
  id: string;
  node: string;
  timestamp: string;
  location: string | null;
  note: string | null;
}

// ─── Cart ───────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selected: boolean;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    priceIdr: number;
    imageUrls: string | null;
    stock: number;
  };
}

// ─── User ───────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'PARTNER' | 'RIDER' | 'ADMIN';
  totalSpend: number;
  credits: number;
  level: string;
  lastLoginAt: string | null;
  createdAt: string;
}
