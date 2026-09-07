import { useState, useEffect, useCallback } from 'react';
import { stationApi, ApiError } from '@/lib/api';
import type { Product, ProductDetail, ProductListResponse, ProductQuery, StationHome } from '@/types/api';

/**
 * 通用异步状态
 */
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 请求错误消息本地化提取
 * ApiError 携带 status，其余为未知错误
 */
function extractError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

/** 商品列表（分页/搜索/筛选/排序） */
export function useProducts(query: ProductQuery = {}): AsyncState<ProductListResponse> {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // 序列化 query 用于依赖比较（避免对象引用变化导致无限请求）
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    stationApi
      .listProducts(JSON.parse(queryKey), controller.signal)
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch((err) => {
        if (!active) return;
        // 忽略主动取消
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

/** 商品详情 */
export function useProduct(id: string | undefined): AsyncState<ProductDetail> {
  const [data, setData] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    stationApi
      .getProduct(id, controller.signal)
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
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}

/**
 * 爆款商品（GET /station/hero-products）
 *
 * 与 StationHome.products（AceHeroProduct，无图片字段）不同，
 * 该端点返回完整 AceProduct（含 images），适合首页网格展示真实商品图。
 */
export function useHeroProducts(): AsyncState<Product[]> {
  const [data, setData] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    stationApi
      .getHeroProducts(undefined, controller.signal)
      .then((res) => {
        if (!active) return;
        // 兼容两种返回：数组 或 { items: [] }
        setData(Array.isArray(res) ? res : ((res as unknown as ProductListResponse).items ?? []));
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
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}

/** 站点首页（节日 + 爆款 + 配置） */
export function useStationHome(station = 'jakarta'): AsyncState<StationHome> {
  const [data, setData] = useState<StationHome | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    stationApi
      .getHome(station)
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
  }, [station, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}
