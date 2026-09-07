/**
 * 商品数据 Hooks
 * 
 * 使用 React 状态管理（不用 TanStack Query 以简化 Expo 依赖）
 * 后续可迁移到 React Query 以获得缓存和自动刷新能力
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/APIService';
import type { Product } from '../services/types';

interface UseProductsOptions {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  total: number;
  refresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { category, search, pageSize = 20, sortBy } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProducts({
        category,
        search,
        page: pageNum,
        pageSize,
        sortBy,
      });
      if (append) {
        setProducts((prev) => [...prev, ...(data.items || data || [])]);
      } else {
        setProducts(data.items || data || []);
      }
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [category, search, pageSize, sortBy]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  }, [page, fetchProducts]);

  const hasMore = products.length < total;

  return { products, isLoading, error, total, refresh, loadMore, hasMore };
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProduct(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { product, isLoading, error, refresh: fetch };
}

export function useHeroProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHeroProducts(category);
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, isLoading, error, refresh: fetch };
}
