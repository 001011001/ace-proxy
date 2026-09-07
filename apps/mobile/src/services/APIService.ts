import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { ApiResponse } from './types';

const isDev = __DEV__ || process.env.NODE_ENV === 'development';

// 环境感知的 API 地址
const getBaseUrl = (): string => {
  if (isDev) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api/v1'; // Android 模拟器
    }
    if (Platform.OS === 'ios') {
      return 'http://localhost:3001/api/v1'; // iOS 模拟器
    }
    return 'http://localhost:3001/api/v1'; // Web 开发
  }
  return 'https://api.aceproxy.id/api/v1'; // 生产环境
};

const BASE_URL = getBaseUrl();

// 请求配置
const REQUEST_TIMEOUT = 30_000; // 30 秒超时
const MAX_RETRIES = 2; // 最多重试 2 次

class APIService {
  private token: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  // ─── Token 管理 ────────────────────────────────────────────────
  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('aceproxy_token', token);
  }

  async loadToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('aceproxy_token');
    }
    return this.token;
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('aceproxy_token');
  }

  // ─── 统一请求方法（支持超时、重试、统一响应解析）─────────────
  private async request<T>(
    path: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<T> {
    const token = await this.loadToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 401 自动清除 token
      if (response.status === 401) {
        await this.clearToken();
        throw new Error('UNAUTHORIZED: Session expired, please login again');
      }

      // 429 限流 — 等待后重试
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return this.request<T>(path, options, retryCount + 1);
      }

      const json: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(json.message || `HTTP ${response.status}`);
      }

      // 检查业务错误码
      if (json.code !== 0) {
        throw new Error(json.message || `Business error: ${json.code}`);
      }

      return json.data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('REQUEST_TIMEOUT: Request took too long');
      }

      // 网络错误自动重试
      if (retryCount < MAX_RETRIES && error.message?.includes('Network')) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(path, options, retryCount + 1);
      }

      throw error;
    }
  }

  // ─── Auth ──────────────────────────────────────────────────────
  async register(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // ─── Products ─────────────────────────────────────────────────
  async getProducts(params?: {
    category?: string;
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    const qs = query.toString();
    return this.request<any>(`/station/products${qs ? `?${qs}` : ''}`);
  }

  async getProduct(productId: string) {
    return this.request<any>(`/station/products/${productId}`);
  }

  async getJakartaHome() {
    return this.request<any>('/station/jakarta/home');
  }

  async getHeroProducts(category?: string) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<any>(`/station/hero-products${query}`);
  }

  // ─── Cart ─────────────────────────────────────────────────────
  async getCart() {
    return this.request<any>('/cart');
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.request<any>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request<any>('/cart/update', {
      method: 'PATCH',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request<any>('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  }

  async clearCart() {
    return this.request<any>('/cart/clear', {
      method: 'DELETE',
    });
  }

  // ─── Orders ───────────────────────────────────────────────────
  async createOrder(data: {
    items: Array<{ productId: string; quantity: number }>;
    destination: string;
    partnerId?: string;
    termsAccepted: boolean;
  }) {
    return this.request<any>('/trade/order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: { status?: string; page?: number; pageSize?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return this.request<any>(`/trade/orders${qs ? `?${qs}` : ''}`);
  }

  async getOrder(orderId: string) {
    return this.request<any>(`/trade/orders/${orderId}`);
  }

  async calculateFees(baseAmount: number) {
    return this.request<any>('/trade/calculate-fees', {
      method: 'POST',
      body: JSON.stringify({ baseAmount }),
    });
  }

  // ─── Payment ──────────────────────────────────────────────────
  async createInvoice(data: {
    orderId: string;
    amount: number;
    description: string;
  }) {
    return this.request<any>('/payment/create-invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadPaymentProof(orderId: string, proofUri: string) {
    return this.request<any>('/payment/upload-proof', {
      method: 'POST',
      body: JSON.stringify({ orderId, proofUri }),
    });
  }

  async confirmPayment(orderId: string) {
    return this.request<any>('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  // ─── Chat — AI Steward ────────────────────────────────────────
  async stewardChat(
    message: string,
    history: Array<{ role: string; content: string }> = [],
  ) {
    return this.request<{
      reply: string;
      toolUsed: string | null;
      toolData?: any[];
    }>('/chat/steward', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  // ─── Logistics ────────────────────────────────────────────────
  async getTracking(orderId: string) {
    return this.request<any>(`/logistics/tracking/${orderId}`);
  }

  // ─── Profit ───────────────────────────────────────────────────
  async getProfitPulse() {
    return this.request<{ amount: string; trend: string }>('/station/profit-pulse');
  }

  // ─── Dashboard ────────────────────────────────────────────────
  async getDashboard() {
    return this.request<any>('/dashboard');
  }

  // ─── Profile ─────────────────────────────────────────────────
  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async updateProfile(data: Record<string, any>) {
    return this.request<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ─── Addresses ────────────────────────────────────────────────
  async getAddresses() {
    return this.request<any>('/auth/addresses');
  }

  async addAddress(data: {
    label?: string;
    recipientName: string;
    phone: string;
    province?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    detail?: string;
    isDefault?: boolean;
  }) {
    return this.request<any>('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(addressId: string) {
    return this.request<any>(`/auth/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new APIService();
export default APIService;
