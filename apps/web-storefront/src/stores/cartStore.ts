import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/api';

/**
 * 购物车状态 — 本地持久化
 *
 * 设计说明：
 * - 未登录用户也可加购（持久化到 localStorage），登录后合并到服务端由后续 Phase 处理
 * - 加购时校验库存上限，避免超卖
 */
interface CartState {
  items: CartItem[];
  /** 侧边抽屉开关 */
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);

        if (existing) {
          // 已存在 — 增加数量（不超过库存）
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + quantity, item.stock) }
                : i,
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: Math.min(quantity, item.stock) }],
            isOpen: true,
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
          ),
        });
      },

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'aceproxy-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** 购物车商品总件数 */
export const selectCartCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

/** 购物车总价（IDR） */
export const selectCartTotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.priceIdr * item.quantity, 0);
