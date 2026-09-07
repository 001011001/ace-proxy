/**
 * 订单相关类型
 */

import type { LogisticsNode, Parcel } from './logistics';

export type { LogisticsNode, Parcel };

/** 退款类型 */
export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason?: string | null;
  status: string;
  approverId?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SOURCING'
  | 'CONSOLIDATING'
  | 'SHIPPING'
  | 'IN_CUSTOMS'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  userId: string;
  partnerId: string | null;
  status: OrderStatus;
  country: string | null;
  totalAmount: number;
  sourceCost: number | null;
  shippingFee: number | null;
  serviceFee: number | null;
  commissionAmount: number;
  riskPoolAmount: number | null;
  lossAmount: number | null;
  createdAt: string;
  // 关联
  items?: OrderItem[];
  logisticsNodes?: LogisticsNode[];
  parcels?: Parcel[];
  refunds?: Refund[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    name: string;
    imageUrls: string | null;
  };
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  destination: string;
  partnerId?: string;
  termsAccepted: boolean;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

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

export interface CartUpdateRequest {
  productId: string;
  quantity: number;
}
