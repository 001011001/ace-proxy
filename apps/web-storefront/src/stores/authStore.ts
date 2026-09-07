import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, tokenStore } from '@/lib/api';
import type { User } from '@/types/api';

/**
 * 认证状态 — 持久化的用户会话
 *
 * Token 存 tokenStore(localStorage)，user 由 zustand persist 管理。
 * 两者同步：logout 时同时清除。
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** 首次挂载后是否已完成 /auth/me 校验，避免闪烁 */
  isHydrated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  /** 注册 — 后端 RegisterDto 仅接受 email+password（forbidNonWhitelisted 会拒绝多余字段） */
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** 用已有 token 拉取用户信息（App 启动时调用） */
  hydrate: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          tokenStore.set(res.accessToken);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(email, password);
          tokenStore.set(res.accessToken);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        tokenStore.clear();
        set({ user: null, isAuthenticated: false });
      },

      hydrate: async () => {
        const token = tokenStore.get();
        if (!token) {
          set({ isHydrated: true, isAuthenticated: false, user: null });
          return;
        }
        // 已有 token — 校验有效性并拉取用户信息
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isHydrated: true });
        } catch {
          // token 失效（401 时 tokenStore 已自动清除）
          tokenStore.clear();
          set({ user: null, isAuthenticated: false, isHydrated: true });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'aceproxy-auth',
      // 只持久化 user，token 由 tokenStore 单独管理
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

/** 便捷选择器 */
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
