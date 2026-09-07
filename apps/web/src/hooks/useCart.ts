import { useState, useEffect, useCallback, useRef } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  priceIdr: number;
  costCny: number;
  qty: number;
  stock: number;
  selected: boolean;
}

interface BackendCartItem {
  id: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    priceIdr: number;
    costCny: number;
    images: string[];
    stock: number;
  };
  qty: number;
  priceIdr?: number;
  name?: string;
  image?: string;
  stock?: number;
}

const STORAGE_KEY = 'aceproxy_cart';

// ─── Token helper ───
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('aceproxy_token');
  } catch { return null; }
}

// ─── API Cart Operations (used when logged in) ───
async function fetchCartFromAPI(): Promise<CartItem[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/v1/cart', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch cart');

  const json = await res.json();
  const items = (json.data?.items || json.data || []).map((i: BackendCartItem): CartItem => {
    const product = i.product;
    return {
      id: i.id,
      productId: i.productId || product?.id || i.id,
      name: i.name || product?.name || '',
      image: i.image || (product?.images?.[0]) || '',
      priceIdr: i.priceIdr || product?.priceIdr || 0,
      costCny: product?.costCny || 0,
      qty: i.qty || 1,
      stock: i.stock || product?.stock || 999,
      selected: true,
    };
  });
  return items;
}

async function addToCartAPI(productId: string, qty: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  await fetch('/api/v1/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, qty }),
  });
}

async function updateCartItemAPI(itemId: string, qty: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  await fetch(`/api/v1/cart/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qty }),
  });
}

async function removeCartItemAPI(itemId: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  await fetch(`/api/v1/cart/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── localStorage Cart Operations (fallback) ───
function loadCartLocal(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function saveCartLocal(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── Hook ───
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const syncRef = useRef(false);

  // Initial load
  useEffect(() => {
    if (syncRef.current) return;
    syncRef.current = true;

    async function load() {
      const token = getToken();
      if (token) {
        // Try backend first
        try {
          const backendItems = await fetchCartFromAPI();
          setItems(backendItems);
          setUseBackend(true);
        } catch {
          // Backend failed, fallback to localStorage
          setItems(loadCartLocal());
        }
      } else {
        setItems(loadCartLocal());
      }
      setLoaded(true);
    }
    load();
  }, []);

  // ─── Operations ───
  const addToCart = useCallback(async (product: {
    productId: string;
    name: string;
    image: string;
    priceIdr: number;
    costCny: number;
    qty: number;
    stock: number;
  }) => {
    const addLocal = (prev: CartItem[]) => {
      const existing = prev.find(i => i.productId === product.productId);
      let next: CartItem[];
      if (existing) {
        const newQty = Math.min(existing.qty + product.qty, product.stock);
        next = prev.map(i =>
          i.productId === product.productId ? { ...i, qty: newQty } : i
        );
      } else {
        next = [...prev, {
          id: `cart-${Date.now()}`,
          productId: product.productId,
          name: product.name,
          image: product.image,
          priceIdr: product.priceIdr,
          costCny: product.costCny,
          qty: Math.min(product.qty, product.stock),
          stock: product.stock,
          selected: true,
        }];
      }
      return next;
    };

    if (useBackend) {
      try {
        await addToCartAPI(product.productId, product.qty);
        // Re-fetch to get server state
        const backendItems = await fetchCartFromAPI();
        setItems(backendItems);
      } catch {
        // Fallback to local
        setItems(prev => {
          const next = addLocal(prev);
          saveCartLocal(next);
          return next;
        });
      }
    } else {
      setItems(prev => {
        const next = addLocal(prev);
        saveCartLocal(next);
        return next;
      });
    }
  }, [useBackend]);

  const updateQty = useCallback((itemId: string, qty: number) => {
    if (useBackend) {
      if (qty <= 0) {
        removeCartItemAPI(itemId).then(() => {
          setItems(prev => prev.filter(i => i.id !== itemId));
        }).catch(() => {});
      } else {
        updateCartItemAPI(itemId, qty).then(() => {
          setItems(prev => prev.map(i => i.id === itemId ? { ...i, qty } : i));
        }).catch(() => {});
      }
    } else {
      setItems(prev => {
        let next: CartItem[];
        if (qty <= 0) {
          next = prev.filter(i => i.id !== itemId);
        } else {
          next = prev.map(i => i.id === itemId ? { ...i, qty: Math.min(qty, i.stock) } : i);
        }
        saveCartLocal(next);
        return next;
      });
    }
  }, [useBackend]);

  const removeItem = useCallback((itemId: string) => {
    if (useBackend) {
      removeCartItemAPI(itemId).then(() => {
        setItems(prev => prev.filter(i => i.id !== itemId));
      }).catch(() => {});
    } else {
      setItems(prev => {
        const next = prev.filter(i => i.id !== itemId);
        saveCartLocal(next);
        return next;
      });
    }
  }, [useBackend]);

  const toggleSelect = useCallback((itemId: string) => {
    setItems(prev => {
      const next = prev.map(i =>
        i.id === itemId ? { ...i, selected: !i.selected } : i
      );
      if (!useBackend) saveCartLocal(next);
      return next;
    });
  }, [useBackend]);

  const selectAll = useCallback((selected: boolean) => {
    setItems(prev => {
      const next = prev.map(i => ({ ...i, selected }));
      if (!useBackend) saveCartLocal(next);
      return next;
    });
  }, [useBackend]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (!useBackend) saveCartLocal([]);
  }, [useBackend]);

  // ─── Computed ───
  const count = items.length;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const selectedItems = items.filter(i => i.selected);
  const subtotal = selectedItems.reduce((s, i) => s + i.priceIdr * i.qty, 0);
  const allSelected = items.length > 0 && items.every(i => i.selected);

  return {
    items,
    loaded,
    count,
    totalQty,
    selectedItems,
    subtotal,
    allSelected,
    useBackend,
    addToCart,
    updateQty,
    removeItem,
    toggleSelect,
    selectAll,
    clearCart,
  };
}
