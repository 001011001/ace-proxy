import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isDev = process.env.NODE_ENV === 'development';
const BASE_URL = isDev
  ? 'http://10.0.2.2:3000/api/v1'  // Android emulator -> host machine
  : 'https://api.aceproxy.id/api/v1';  // Production API

class APIService {
  private token: string | null = null;

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

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const token = await this.loadToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Station / Products
  async getJakartaHome() {
    return this.request('/station/jakarta/home');
  }

  // Orders
  async createOrder(data: {
    items: any[];
    amounts: { total: number; cost: number; shipping: number; serviceFee: number };
    partner_id?: string;
    destination?: string;
    terms_accepted: boolean;
  }) {
    return this.request('/trade/order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateFees(baseAmount: number) {
    return this.request('/trade/calculate-fees', {
      method: 'POST',
      body: JSON.stringify({ baseAmount }),
    });
  }

  // Cart
  async getCart(): Promise<any> {
    return this.request('/trade/cart');
  }

  // Products
  async getProduct(productId: string): Promise<any> {
    return this.request(`/station/products/${productId}`);
  }

  // Payment
  async createInvoice(data: { orderId: string; amount: number; description: string }) {
    return this.request('/payment/create-invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadPaymentProof(orderId: string, proofUri: string): Promise<any> {
    return this.request('/payment/upload-proof', {
      method: 'POST',
      body: JSON.stringify({ orderId, proofUri }),
    });
  }

  async confirmPayment(orderId: string): Promise<any> {
    return this.request('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  // Chat - AI Steward
  async stewardChat(
    message: string,
    history: Array<{ role: string; content: string }> = [],
  ): Promise<{
    reply: string;
    toolUsed: string | null;
    toolData?: any[];
  }> {
    return this.request('/chat/steward', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  // Profit
  async getProfitPulse(): Promise<{ amount: string; trend: string }> {
    return this.request('/station/profit-pulse');
  }
}

export const api = new APIService();
