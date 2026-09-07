import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = unknown>(path: string | null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !!path,
    error: null,
  });

  const fetch = useCallback(async (customPath?: string) => {
    const p = customPath ?? path;
    if (!p) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get<T>(p);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error';
      setState(s => ({ ...s, loading: false, error: msg }));
    }
  }, [path]);

  useEffect(() => {
    if (path) fetch();
  }, [path, fetch]);

  return { ...state, refetch: fetch };
}

export function useApiMutation<T = unknown, B = unknown>(path: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (body?: B): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = method === 'DELETE'
        ? await api.delete<T>(path)
        : method === 'PUT'
        ? await api.put<T>(path, body)
        : await api.post<T>(path, body);
      setLoading(false);
      return data;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error';
      setError(msg);
      setLoading(false);
      return null;
    }
  }, [path, method]);

  return { mutate, loading, error };
}
