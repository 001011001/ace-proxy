/**
 * 支付相关类型
 */
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface PaymentInvoice {
  id: string;
  orderId: string;
  amount: number;
  description: string;
  status: PaymentStatus;
  paymentUrl: string;
  createdAt: string;
  expiresAt: string;
}

export interface CreateInvoiceRequest {
  orderId: string;
  amount: number;
  description: string;
}

export interface PaymentProofRequest {
  orderId: string;
  proofUri: string;
}

export interface PaymentConfirmRequest {
  orderId: string;
}
