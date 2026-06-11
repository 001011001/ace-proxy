# AceProxy 技术方案

> 版本: v1.0 | 日期: 2026-06-06

---

## 1. 架构概览

```
┌──────────────────────────────────────────────────────────┐
│                        Client Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Mobile (RN)  │  │ Web (Next.js)│  │ Landing (SPA) │  │
│  │ Expo + TS    │  │ TS + React   │  │ Single HTML   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         └─────────────────┼──────────────────┘          │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTPS + JWT
┌───────────────────────────┼──────────────────────────────┐
│                    API Gateway (NestJS)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Auth    │ │  Chat    │ │  Payment │ │  Trade   │   │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       └────────────┼─────────────┼────────────┘         │
│                    ▼                                     │
│            ┌──────────────┐                              │
│            │ Prisma ORM   │                              │
│            └──────┬───────┘                              │
└───────────────────┼──────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────┐
│              Data & AI Layer                              │
│  ┌───────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │ PostgreSQL│   │  Ollama      │   │  Xendit API  │   │
│  │ (9 tables)│   │  Qwen3:4b    │   │  (Payment)   │   │
│  └───────────┘   └──────────────┘   └──────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈详情

| 层 | 技术 | 版本 | 说明 |
|----|------|------|------|
| **后端框架** | NestJS | 10.x | TypeScript, 模块化 DI |
| **数据库 ORM** | Prisma | 5.22 | 类型安全, Migration |
| **数据库** | PostgreSQL | 14 | Docker Compose, 生产就绪 |
| **认证** | Passport + JWT | — | 7 天过期, bcrypt 加密 |
| **AI 引擎** | Ollama + Qwen3 | 4B | 本地运行, Function Calling |
| **支付** | Xendit | v2 API | 印尼本地支付网关 |
| **移动端** | React Native + Expo | — | Android APK 优先 |
| **Web 端** | Next.js 13 | Pages Router | SSR/CSR 混合 |
| **部署** | Docker Compose | — | 一键启动 |
| **消息通知** | WhatsApp Business | — | Webhook 集成预留 |

---

## 3. 数据库设计

### 3.1 核心表 (9 张)

| 表名 | 前缀 | 用途 | 关键字段 |
|------|------|------|----------|
| `AceUser` | ace_ | 用户账户 | email, password_hash, role, level, credits |
| `AceOrder` | ace_ | 订单主表 | status, totalAmount, commissionAmount, riskPoolAmount |
| `AcePartner` | ace_ | 团长/分销 | inviteCode, commissionRate, balance |
| `AceVaultLedger` | ace_ | 财务账本 | orderId, account, amount, entryType (DEBIT/CREDIT) |
| `AceHeroProduct` | ace_ | 爆款商品库 | name, sourcePriceCny, localPriceIdr, arbitrageGapPct, patentStatus |
| `AceSupplier` | ace_ | 供应商评分 | avgLeadTime, defectRate, status |
| `AceOrderChat` | ace_ | AI 聊天存证 | orderId, role, contentOriginal, contentTranslated |
| `AceHolidayConfig` | ace_ | 节日引擎 | stationId, festivalName, reminderDays |
| `AcePaymentConfig` | ace_ | 收款配置 | regionCode, providerName, bankName, accountNumber |

### 3.2 当前问题
- ⚠️ `DATABASE_URL` 未配置 → 数据库未连接
- ⚠️ 无 seed 数据 → 商品列表为空
- ⚠️ Prisma schema 声明 PostgreSQL 但实际开发用 SQLite（需统一）

---

## 4. API 设计

### 4.1 端点清单

```
Base URL: /api/v1

POST   /auth/register          # 注册
POST   /auth/login             # 登录
GET    /auth/me                # 获取当前用户

GET    /station/jakarta/home   # 雅加达首页数据
GET    /station/products/:id   # 商品详情
GET    /station/profit-pulse   # 利润概览

POST   /chat/steward           # AI 管家对话 [JWT]
POST   /chat/webhook/whatsapp  # WhatsApp Webhook
POST   /chat/supplier-reply    # 供应商回复模拟 [JWT]

POST   /trade/order            # 创建订单 [JWT]
POST   /trade/calculate-fees   # 计算费用
GET    /trade/cart             # 获取购物车 [JWT]

POST   /payment/create-invoice # 创建 Xendit 发票 [JWT]
POST   /payment/upload-proof   # 上传支付凭证 [JWT]
POST   /payment/confirm        # 确认支付 [JWT]

GET    /health                 # 健康检查 [公开]
```

### 4.2 统一响应格式

```json
// 成功
{ "code": 200, "data": { ... }, "message": "OK" }

// 错误
{ "code": 4xx/5xx, "message": "...", "error": "..." }
```

### 4.3 AI 聊天接口详细

```typescript
POST /api/v1/chat/steward
Headers: Authorization: Bearer <jwt_token>
Body: {
  "message": "Cari baju koko murah",  // 用户消息
  "history": [                          // 可选：对话历史
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response: {
  "reply": "Saya menemukan 3 baju koko...",  // AI 自然语言回复
  "toolUsed": "searchProducts",              // 使用的工具函数名
  "toolData": [...]                          // 工具返回的数据
}
```

---

## 5. AI 架构

```
┌──────────────┐     POST /api/chat     ┌──────────────┐
│  ChatService │ ──────────────────────→ │    Ollama    │
│  (NestJS)    │ ←────────────────────── │  qwen3:4b    │
└──────┬───────┘   {message, tool_calls} └──────────────┘
       │
       │ tool_calls detected?
       │
       ├── YES → executeToolCall()
       │         ├── searchProducts() → Prisma 查询
       │         └── searchByPrice()  → Prisma 查询
       │         └── Feed result back to Ollama
       │
       └── NO  → Return reply directly

System Prompt 关键规则:
- ❌ 禁止提及 1688/Taobao/Shopee 等货源平台
- ❌ 禁止透露成本价/利润率
- ❌ 禁止承诺退款退货
- ✅ 推荐 AceProxy 官方商品
- ✅ 引导到 Resale Hub 处理售后
- ✅ 三语回复 (ID/EN/CN)
```

### 5.1 关键参数
| 参数 | 值 | 说明 |
|------|-----|------|
| 模型 | `qwen3:4b` | 4B 参数，支持 Function Calling |
| 上下文窗口 | 4096 tokens | 约 10-15 轮对话 |
| Temperature | 0.7 | 平衡创意与准确性 |
| 超时 | 60s | 单次 API 调用最大等待 |
| Ollama URL | `http://localhost:11434` | 本地运行 |

---

## 6. 部署架构

```yaml
# docker-compose.yml
services:
  db:       # PostgreSQL 14
  server:   # NestJS on port 3000
  # ollama: # 本地 GPU 机器独立运行

生产环境推荐:
- 后端: Railway / Fly.io / VPS (2 vCPU, 4GB RAM)
- 数据库: Supabase / Neon (managed PostgreSQL)
- AI: 独立 GPU 实例 (RTX 3060+ / Apple M2+)
- CDN: Cloudflare (静态资源 + API 缓存)
```

---

## 7. 前后端对接清单

| # | 移动端 Screen | 后端 API | 当前状态 |
|---|-------------|----------|----------|
| 1 | HomeScreen | `GET /station/jakarta/home` | ❌ Mock |
| 2 | ProductDetail | `GET /station/products/:id` | ❌ Mock |
| 3 | StewardChat | `POST /chat/steward` | ✅ 刚修 |
| 4 | CartScreen | `GET /trade/cart` | ❌ Mock |
| 5 | CheckoutScreen | `POST /trade/order` | ❌ Mock |
| 6 | PaymentScreen | `POST /payment/create-invoice` | ❌ Mock |
| 7 | OrderListScreen | `GET /trade/orders` | ❌ 未实现 |
| 8 | ProfileScreen | `GET /auth/me` | ⚠️ 部分连接 |

> **修复策略**：逐文件替换 Mock 数据为 `api.xxx()` 调用，添加 loading/error/empty 三态。

---

## 8. 安全设计

| 措施 | 状态 | 说明 |
|------|:--:|------|
| JWT 认证 | ✅ | 7 天过期, bcrypt(10) |
| RBAC 中间件 | ✅ | vault/station/holiday 路由已保护 |
| DTO 校验 | ✅ | class-validator, whitelist mode |
| CORS 白名单 | ✅ | 仅允许配置的 origin |
| 密码强度 | ✅ | 至少 8 位 + 大小写 + 数字 |
| 限流保护 | ❌ | 待安装 @nestjs/throttler |
| CSRF 令牌 | ❌ | SPA + JWT 模式下可选 |
| 输入清洗 | ⚠️ | invoiceId 已校验，chat message 未做 |
| 速率限制 (AI) | ❌ | AI API 无限流，可能被滥用 |
