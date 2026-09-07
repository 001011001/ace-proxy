/**
 * 购物车状态管理 (Zustand)
 * 
 * 管理本地购物车状态，与后端 Cart API 同步
 */
import { create } from 'zustand';
import { api } from '../services/APIService';
import type { CartItem } from '../services/types';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Computed
  get totalItems(): number;
  get totalAmount(): number;
  get selectedItems(): CartItem[];
  get selectedTotal(): number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await api.getCart();
      set({ items: items || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      await api.addToCart(productId, quantity);
      const items = await api.getCart();
      set({ items: items || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateItem: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.updateCartItem(productId, quantity);
      const items = await api.getCart();
      set({ items: items || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  removeItem: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.removeFromCart(productId);
      const items = await api.getCart();
      set({ items: items || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.clearCart();
      set({ items: [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Getters (computed via get())
  get totalItems(): number {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  get totalAmount(): number {
    return get().items.reduce((sum, item) => {
      return sum + (item.product?.priceIdr || 0) * item.quantity;
    }, 0);
  },

  get selectedItems(): CartItem[] {
    return get().items.filter((item) => item.selected);
  },

  get selectedTotal(): number {
    return get().selectedItems.reduce((sum, item) => {
      return sum + (item.product?.priceIdr || 0) * item.quantity;
    }, 0);
  },
}));
