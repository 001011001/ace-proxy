/**
 * API 类型定义 — 严格对齐 NestJS 后端契约
 *
 * 数据来源：
 * - StationController: /station/jakarta/home, /station/products, /station/products/:id, /station/hero-products
 * - ProductService.listProducts / getProductById
 * - Prisma schema: AceProduct, AceHeroProduct, AceHolidayConfig
 *
 * ⚠️ 重要：后端启用 ApiResponseInterceptor（main.ts），
 * 所有响应统一包装为 { code, message, data, timestamp }。
 * API 客户端必须先解包 .data 才能拿到真实数据。
 */

/** 统一响应包装（@ace-proxy/shared ApiResponse） */
export interface ApiEnvelope<T = unknown> {
  /** 0 = 成功，非 0 = 业务错误码（见 ERROR_CODES） */
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/** 业务错误码（对齐 packages/shared ERROR_CODES） */
export const ERROR_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  CONFLICT: 1005,
  RATE_LIMITED: 1006,
  INTERNAL_ERROR: 5000,
  INSUFFICIENT_BALANCE: 2001,
  ORDER_NOT_FOUND: 2002,
  PRODUCT_OUT_OF_STOCK: 2003,
} as const;

/** 通用分页结构（ProductService.listProducts 返回） */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 商品（列表项 — ProductService.listProducts select 字段） */
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  /** JSON 字符串（原始字段） */
  imageUrls: string;
  priceIdr: number;
  costCny: number;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  status: string;
  /** 已解析的图片 URL 数组（ProductService.parseImages 生成） */
  images: string[];
}

/** 商品评价 */
export interface ProductReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

/** 商品详情（含评价 — ProductService.getProductById） */
export type ProductDetail = Product & {
  createdAt: string;
  updatedAt: string;
  reviews: ProductReview[];
};

/** 商品列表响应 */
export interface ProductListResponse {
  items: Product[];
  pagination: Pagination;
}

/** 爆款商品（AceHeroProduct — StationService.getStationHome） */
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

/** 节日配置（AceHolidayConfig） */
export interface HolidayConfig {
  id: number;
  stationId: string;
  festivalName: string;
  themeId: string;
  reminderDays: number;
  reminderMessage: string | null;
  isActive: boolean;
  updatedAt: string;
}

/** 站点首页响应（StationService.getStationHome） */
export interface StationHome {
  stationName: string;
  regionCode: string;
  currency: string;
  language: string;
  timezone: string;
  activeHoliday: HolidayConfig | null;
  announcement: string;
  products: HeroProduct[];
  trendingCategories: Array<{ name: string; [key: string]: unknown }>;
  lossPreventionStatus: string;
}

/** 商品列表查询参数（对齐 StationController.listProducts） */
export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

/** ArbiBot 分析结果（ArbiBotService.analyzeLink） */
export interface ArbiBotAnalysis {
  sourceUrl: string;
  matchedSourceUrl: string;
  sourcePriceCNY: number;
  allInPriceIDR: number;
  arbitrageGapPct: number;
  riskStatus: 'CLEAN' | 'WARNING' | 'BLOCKED';
  riskReason?: string;
  breakdown: {
    sourceCost: number;
    shippingEstimate: number;
    serviceFee: number;
    riskPool: number;
  };
}

/**
 * 用户
 *
 * ⚠️ 字段完整性因端点而异：
 * - login 返回：{ id, email, role, level, displayName }
 * - register 返回：{ id, email, role, displayName }（无 level）
 * - GET /auth/me 返回最全：额外含 phone, avatar, totalSpend, credits, createdAt
 * 因此除核心三字段外全部可选。
 */
export interface User {
  id: string;
  email: string;
  role: string;
  level?: string;
  displayName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  credits?: number;
  totalSpend?: number;
  createdAt?: string;
}

/**
 * 登录/注册响应
 * 后端返回 { user, ...{ accessToken, expiresIn } }（generateToken 展开）
 */
export interface AuthResponse {
  accessToken: string;
  expiresIn?: string;
  user: User;
}

/**
 * 购物车项（本地状态）
 *
 * costCny 用于下单时构造 amounts.cost（采购成本，单位 CNY）。
 * 注意：订单金额单位不统一 —— total 为 IDR，cost/shipping/serviceFee 为 CNY
 * （见 OrderController CSV 导出的表头定义）。
 */
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  /** 售价（IDR） */
  priceIdr: number;
  /** 采购成本（CNY） */
  costCny: number;
  image: string;
  quantity: number;
  stock: number;
}

/** 订单列表项（GET /order/list select 字段） */
export interface OrderListItem {
  id: string;
  status: string;
  /** Decimal 序列化后为 number/string，运行时统一转 number */
  totalAmount: number;
  createdAt: string;
  userId: string;
  country: string | null;
}

/** 订单列表响应 */
export interface OrderListResponse {
  items: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 物流时间线节点（GET /order/:id/timeline）
 * 后端已附加 label（中文说明）与 time（ISO 字符串）
 */
export interface OrderTimelineNode {
  id: string;
  orderId: string;
  /** 15 节点状态枚举，如 CREATED / PAID / DELIVERED */
  node: string;
  /** 后端映射的中文标签 */
  label: string;
  timestamp: string;
  time: string;
  [key: string]: unknown;
}

/** 支付方式（GET /payment/methods） */
export interface PaymentMethod {
  code: string;
  name: string;
  type?: string;
  fee?: number;
  [key: string]: unknown;
}

/** 创建订单入参（POST /trade/order — CreateOrderDto） */
export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  amounts: {
    total: number;
    cost: number;
    shipping: number;
    serviceFee: number;
  };
  partner_id?: string;
  destination?: string;
  terms_accepted: boolean;
}

/** 创建订单响应 */
export interface CreateOrderResult {
  orderId?: string;
  id?: string;
  status?: string;
  [key: string]: unknown;
}

/** 费用计算响应（POST /trade/calculate-fees） */
export interface FeeBreakdown {
  serviceFee?: number;
  shipping?: number;
  total?: number;
  [key: string]: unknown;
}

/** 发票（POST /payment/create-invoice） */
export interface Invoice {
  invoiceId?: string;
  id?: string;
  invoiceUrl?: string;
  url?: string;
  amount?: number;
  status?: string;
  [key: string]: unknown;
}
