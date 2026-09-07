import { useState, useEffect, useCallback } from 'react';
import { orderApi, ApiError } from '@/lib/api';
import type { OrderListResponse, OrderTimelineNode } from '@/types/api';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function extractError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

/**
 * 订单状态 → 展示元数据
 *
 * 后端 ace_orders.status 实际取值：PENDING / PAID（见 TradeService），
 * 其余为物流过程中的扩展状态，此处一并覆盖以便时间线与列表展示。
 */
export const ORDER_STATUS_META: Record<string, { label: string; tone: 'warning' | 'success' | 'error' | 'ocean' | 'default' }> = {
  PENDING: { label: 'Menunggu Pembayaran', tone: 'warning' },
  CREATED: { label: 'Dibuat', tone: 'default' },
  PAID: { label: 'Dibayar', tone: 'success' },
  MATCHING: { label: 'Mencari Supplier', tone: 'ocean' },
  MATCHED: { label: 'Supplier Ditemukan', tone: 'ocean' },
  PURCHASING: { label: 'Proses Pembelian', tone: 'ocean' },
  PURCHASED: { label: 'Dibeli', tone: 'ocean' },
  WAREHOUSE_RECEIVED: { label: 'Masuk Gudang', tone: 'ocean' },
  QC_PASSED: { label: 'Lolos QC', tone: 'success' },
  QC_FAILED: { label: 'Gagal QC', tone: 'error' },
  CONSOLIDATING: { label: 'Konsolidasi', tone: 'ocean' },
  CONSOLIDATED: { label: 'Terkonsolidasi', tone: 'ocean' },
  SHIPPED: { label: 'Dikirim', tone: 'ocean' },
  CUSTOMS: { label: 'Bea Cukai', tone: 'warning' },
  IN_TRANSIT: { label: 'Dalam Perjalanan', tone: 'ocean' },
  DELIVERED: { label: 'Diterima', tone: 'success' },
  CANCELLED: { label: 'Dibatalkan', tone: 'error' },
};

/** 获取状态展示元数据（未知状态回退为原始值） */
export function getStatusMeta(status: string) {
  return (
    ORDER_STATUS_META[status] ?? {
      label: status,
      tone: 'default' as const,
    }
  );
}

/** 订单列表 */
export function useOrders(query: { status?: string; page?: number; limit?: number } = {}): AsyncState<OrderListResponse> {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    orderApi
      .list(JSON.parse(queryKey), controller.signal)
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(extractError(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [queryKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}

/** 订单物流时间线（15 节点） */
export function useOrderTimeline(orderId: string | undefined): AsyncState<OrderTimelineNode[]> {
  const [data, setData] = useState<OrderTimelineNode[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    orderApi
      .timeline(orderId, controller.signal)
      .then((res) => {
        if (!active) return;
        setData(res ?? []);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(extractError(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [orderId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}
