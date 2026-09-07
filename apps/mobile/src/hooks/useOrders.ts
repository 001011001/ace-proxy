/**
 * 订单数据 Hooks
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/APIService';
import type { Order } from '../services/types';

interface UseOrdersOptions {
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getOrders(options);
      setOrders(data?.items || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.page, options.pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { orders, isLoading, error, refresh: fetch };
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { order, isLoading, error, refresh: fetch };
}
