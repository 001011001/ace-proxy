/**
 * AceProxy 统一 API 响应格式
 * 
 * 所有 API 端点强制遵守此格式。
 * code=0 表示成功，非0表示业务错误码。
 */

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type ApiError = ApiResponse<null>;

// 业务错误码
export const ERROR_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  CONFLICT: 1005,
  RATE_LIMITED: 1006,
  INTERNAL_ERROR: 5000,
  // 业务错误
  INSUFFICIENT_BALANCE: 2001,
  ORDER_NOT_FOUND: 2002,
  PRODUCT_OUT_OF_STOCK: 2003,
  COUPON_EXPIRED: 2004,
  PAYMENT_FAILED: 2005,
  QC_REJECTED: 2006,
  DUPLICATE_ORDER: 2007,
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
