import type {
  ApiEnvelope,
  ArbiBotAnalysis,
  AuthResponse,
  CreateOrderPayload,
  CreateOrderResult,
  FeeBreakdown,
  Invoice,
  OrderListResponse,
  OrderTimelineNode,
  PaymentMethod,
  ProductDetail,
  ProductListResponse,
  ProductQuery,
  StationHome,
  User,
} from '@/types/api';

/**
 * API 客户端 — 对接 NestJS 后端
 *
 * 全局前缀：/api/v1（main.ts setGlobalPrefix）
 * 后端默认端口 3001，开发环境通过 Vite proxy 转发（见 vite.config.ts）
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const TOKEN_KEY = 'aceproxy_token';

/** Token 读写（localStorage 持久化） */
export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* SSR / 隐私模式下静默失败 */
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
  },
};

/** API 错误 — 携带状态码，便于上层判断 401 跳转登录 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** 是否需要 JWT 认证，默认 true */
  auth?: boolean;
  /** 外部传入的信号，用于取消请求 */
  signal?: AbortSignal;
}

/**
 * 统一请求封装
 * - 自动注入 Authorization header
 * - 统一解析 JSON / 错误处理
 * - 401 时清除本地 token（由上层 authStore 监听跳转）
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers: customHeaders, signal, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // 网络层失败（后端未启动 / 断网）
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend berjalan.');
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    // 错误响应同样是 ApiEnvelope 格式：{ code, message, data: null }
    // （见 AllExceptionsFilter — message 已由过滤器 join 为字符串）
    const rawMessage: unknown = isJson ? payload?.message : payload;
    const message =
      (typeof rawMessage === 'string' && rawMessage) ||
      (Array.isArray(rawMessage) ? rawMessage.join('; ') : '') ||
      `Request gagal (${response.status})`;

    if (response.status === 401) tokenStore.clear();

    throw new ApiError(response.status, message, isJson ? payload : undefined);
  }

  // ─── 成功响应：解包 ApiEnvelope { code, message, data, timestamp } ───
  // 后端 ApiResponseInterceptor 统一包装，必须先取 .data
  if (isJson && payload && typeof payload === 'object' && 'data' in payload && 'code' in payload) {
    const envelope = payload as ApiEnvelope<T>;

    // 业务错误码非 0 也视为失败（如 INSUFFICIENT_BALANCE 2001 / PRODUCT_OUT_OF_STOCK 2003）
    if (envelope.code !== 0) {
      throw new ApiError(response.status, envelope.message || 'Request gagal', envelope);
    }

    return envelope.data;
  }

  // 兜底：未包装的响应（如健康检查等裸端点）直接返回
  return payload as T;
}

/**
 * 构造查询字符串，自动过滤空值
 * 参数类型用 object 而非 Record<string, unknown>：
 * 接口（如 ProductQuery）默认无索引签名，无法赋值给 Record 类型。
 */
function toQueryString(params: object = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ══════════════════════════════════════════════════════════════
//  Station — 站点/商品（公开接口，无需登录）
// ══════════════════════════════════════════════════════════════

export const stationApi = {
  /** 站点首页（节日引擎 + 爆款货盘 + 站点配置） */
  getHome: (station = 'jakarta') => request<StationHome>(`/station/${station}/home`, { auth: false }),

  /** 商品列表（分页/搜索/分类/价格区间/排序） */
  listProducts: (query: ProductQuery = {}, signal?: AbortSignal) =>
    request<ProductListResponse>(`/station/products${toQueryString(query)}`, { auth: false, signal }),

  /** 商品详情（含评价） */
  getProduct: (id: string, signal?: AbortSignal) =>
    request<ProductDetail>(`/station/products/${id}`, { auth: false, signal }),

  /** 爆款商品 */
  getHeroProducts: (category?: string, signal?: AbortSignal) =>
    request<ProductDetail[]>(`/station/hero-products${toQueryString({ category })}`, { auth: false, signal }),
};

// ══════════════════════════════════════════════════════════════
//  ArbiBot — 比价分析
// ══════════════════════════════════════════════════════════════

export const arbibotApi = {
  /** 单链接分析（POST /arbibot/analyze） */
  analyze: (url: string, signal?: AbortSignal) =>
    request<ArbiBotAnalysis>('/arbibot/analyze', { method: 'POST', body: { url }, signal }),
};

// ══════════════════════════════════════════════════════════════
//  Auth — 认证
// ══════════════════════════════════════════════════════════════

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  /**
   * 注册（POST /auth/register）
   * ⚠️ 后端 RegisterDto 仅接受 { email, password }（无 name 字段）。
   * 全局 ValidationPipe 启用 forbidNonWhitelisted，传多余字段会导致 400。
   */
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  /** 当前登录用户（GET /auth/me） */
  me: () => request<User>('/auth/me'),

  /** 开发环境快捷登录（生产环境后端禁用） */
  devLogin: (email?: string, displayName?: string) =>
    request<AuthResponse>('/auth/dev-login', {
      method: 'POST',
      body: { email, displayName },
      auth: false,
    }),
};

// ══════════════════════════════════════════════════════════════
//  Chat — AI 管家
// ══════════════════════════════════════════════════════════════

export const chatApi = {
  /**
   * AI 管家对话（POST /chat/steward）
   * 注意：后端使用 JwtAuthGuard，未登录时会返回 401。
   * 上层需处理 401 — 降级为引导用户登录。
   */
  steward: (message: string, signal?: AbortSignal) =>
    request<{ reply: string }>('/chat/steward', { method: 'POST', body: { message }, signal }),
};

// ══════════════════════════════════════════════════════════════
//  Trade — 下单与费用计算
// ══════════════════════════════════════════════════════════════

export const tradeApi = {
  /**
   * 创建订单（POST /trade/order）
   * 需登录；CreateOrderDto 启用 forbidNonWhitelisted，字段不可多余
   */
  createOrder: (payload: CreateOrderPayload) =>
    request<CreateOrderResult>('/trade/order', { method: 'POST', body: payload }),

  /** 计算最终费用（POST /trade/calculate-fees） */
  calculateFees: (baseAmount: number) =>
    request<FeeBreakdown>('/trade/calculate-fees', { method: 'POST', body: { baseAmount } }),
};

// ══════════════════════════════════════════════════════════════
//  Order — 订单查询与物流时间线
// ══════════════════════════════════════════════════════════════

export const orderApi = {
  /** 订单列表（GET /order/list） */
  list: (query: { status?: string; page?: number; limit?: number } = {}, signal?: AbortSignal) =>
    request<OrderListResponse>(`/order/list${toQueryString(query)}`, { signal }),

  /** 物流时间线（GET /order/:id/timeline — 15 节点） */
  timeline: (id: string, signal?: AbortSignal) =>
    request<OrderTimelineNode[]>(`/order/${id}/timeline`, { signal }),
};

// ══════════════════════════════════════════════════════════════
//  Payment — Xendit 支付
// ══════════════════════════════════════════════════════════════

export const paymentApi = {
  /** 可用支付方式（GET /payment/methods，公开） */
  methods: () => request<PaymentMethod[]>('/payment/methods', { auth: false }),

  /** 创建发票（POST /payment/create-invoice） */
  createInvoice: (params: {
    orderId: string;
    amount: number;
    description: string;
    paymentMethods?: string[];
  }) => request<Invoice>('/payment/create-invoice', { method: 'POST', body: params }),

  /** 订单的所有发票（GET /payment/order/:orderId/invoices） */
  invoicesByOrder: (orderId: string, signal?: AbortSignal) =>
    request<Invoice[]>(`/payment/order/${orderId}/invoices`, { signal }),
};

export { request };
