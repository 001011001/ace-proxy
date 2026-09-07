/**
 * 认证状态管理 (Zustand)
 */
import { create } from 'zustand';
import { api } from '../services/APIService';
import type { UserProfile } from '../services/types';

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(email, password);
      await api.setToken(data.token);
      const user = await api.getMe();
      set({
        user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.register(email, password);
      await api.setToken(data.token);
      const user = await api.getMe();
      set({
        user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await api.clearToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = await api.loadToken();
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await api.getMe();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      await api.clearToken();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
