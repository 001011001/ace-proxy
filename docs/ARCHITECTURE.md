# AceProxy — 架构概览

> 版本: 1.0 | 最后更新: 2026-06

---

## 1. 项目概览

**AceProxy** 是一个面向东南亚市场的跨境电商代购平台 MVP。
用户通过 AceProxy 可以从中国工厂（1688）采购商品，享受 AI 质检、真空包装和国际物流一站式服务。

### 定位

- **目标市场**: 印尼 (ID)、泰国 (TH)、菲律宾 (PH)
- **核心用户**: 中产消费者、小批发商、C2C 转卖团长
- **价值主张**: 工厂直供 → AI 质检 → 真空包装 → 7-10 天门到门

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 PWA | HTML5 / CSS3 / Vanilla JS | 移动优先，支持 PWA 离线 |
| 管理后台 | HTML5 / Chart.js | 实时仪表盘，独立部署 |
| 后端框架 | NestJS (Node.js) | 模块化架构，TypeScript |
| ORM | Prisma | PostgreSQL 数据库访问 |
| 数据库 | PostgreSQL 14+ | 主数据存储 |
| AI 引擎 | Ollama (本地) | Qwen2.5 7B，推理服务 |
| 支付 | Xendit | 印尼支付网关 |
| 容器化 | Docker / Docker Compose | 一键部署 |

### 架构图（文字描述）

```
┌──────────────────────────────────────────────────────┐
│                     用户端 (PWA)                      │
│  deploy/index.html + api-client.js                   │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┐              │
│  │Home │Disc │Asst │Wallet│Resale│Profile│            │
│  └──┬──┴──┬──┴──┬──┴──┬──┴──┬───┴───┬──┘            │
└─────┼─────┼─────┼─────┼─────┼───────┼───────────────┘
      │     │     │     │     │       │
      ▼     ▼     ▼     ▼     ▼       ▼
┌──────────────────────────────────────────────────────┐
│              AceProxy API Server (:3001)              │
│              NestJS + Prisma + JWT                    │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐        │
│  │Auth  │Product│Trade │Payment│Vault │Chat  │        │
│  │Register│List  │Create│Invoice│Ledger│Ollama│       │
│  │Login │Detail│Fee   │Webhook│Settle│Steward│       │
│  └──┬───┴──┬───┴──┬───┴──┬───┴──┬───┴──┬───┘        │
└─────┼──────┼──────┼──────┼──────┼──────┼────────────┘
      │      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼      ▼
┌──────────────────────────────────────────────────────┐
│               PostgreSQL 14+                          │
│  ace_user, ace_product, ace_order, ace_vault_ledger   │
│  ace_coupon, ace_holiday_config, ace_cart_item, etc.  │
└──────────────────────────────────────────────────────┘
      │                    │
      ▼                    ▼
┌──────────┐     ┌────────────────┐
│  Xendit  │     │  Ollama (AI)   │
│ (支付)   │     │  Qwen2.5 7B    │
└──────────┘     └────────────────┘

┌──────────────────────────────────────────────────────┐
│              管理后台 (admin.html)                    │
│  Dashboard / Orders / Logistics / Vault / Products    │
└──────────────────────────────────────────────────────┘
```

---

## 2. 目录结构

```
ace-proxy/
├── apps/
│   └── server/                    # NestJS 后端
│       ├── src/
│       │   ├── main.ts            # 入口 + Swagger
│       │   ├── app.module.ts      # 根模块
│       │   ├── common/            # 通用工具
│       │   │   ├── exchange-rate.ts     # 汇率管理
│       │   │   ├── WebhookVerifier.ts   # Webhook 签名
│       │   │   ├── csv-escape.ts        # CSV 安全
│       │   │   ├── interceptors/        # API 响应拦截器
│       │   │   └── guards/              # 限流守卫
│       │   ├── modules/
│       │   │   ├── auth/           # 认证 (JWT)
│       │   │   ├── product/        # 商品管理
│       │   │   ├── trade/          # 交易订单
│       │   │   ├── payment/        # Xendit 支付
│       │   │   ├── vault/          # 财务金库
│       │   │   ├── cart/           # 购物车
│       │   │   ├── shipping/       # 物流运费
│       │   │   ├── chat/           # AI 对话
│       │   │   ├── marketing/      # 优惠券
│       │   │   ├── holiday/        # 节日 UI
│       │   │   ├── notification/   # 推送通知
│       │   │   ├── dashboard/      # 数据仪表盘
│       │   │   ├── logistics-tracking/ # 物流跟踪
│       │   │   ├── order/          # 订单管理
│       │   │   └── region/         # 区域策略
│       │   ├── prisma/             # Prisma 服务
│       │   ├── dto/                # 数据传输对象
│       │   └── countries/          # 多国配置 (id/th/ph)
│       ├── prisma/
│       │   ├── schema.prisma       # 数据模型
│       │   └── migrations/         # 迁移文件
│       ├── jest.config.ts          # 测试配置
│       ├── Dockerfile
│       └── package.json
├── deploy/
│   ├── index.html                  # PWA 主文件
│   ├── admin.html                  # 管理后台
│   ├── api-client.js               # API 客户端
│   └── manifest.json               # PWA manifest
├── docs/
│   ├── ARCHITECTURE.md             # 本文档
│   └── DEPLOYMENT.md               # 部署手册
├── docker-compose.yml              # 容器编排
├── dev.bat / test.bat              # 开发脚本
└── README.md
```

---

## 3. 核心模块职责

### Auth (认证)
- **AuthService**: 注册、登录、JWT 签发
- **JwtStrategy**: Passport JWT 策略验证
- **JwtAuthGuard**: 全局认证守卫

### Product (商品)
- **ProductService**: 商品 CRUD、库存扣减（乐观锁重试）
- **ProductController**: REST API 分页/搜索/分类

### Trade (交易)
- **TradeService**: 创建订单、费用计算、合规检查
- **TradeController**: 代购协议确认、订单创建、Salvage

### Vault (金库)
- **VaultService**: 全链路零和分账、拒付、结算
- **RiskSentryController**: 熔断器监控
- **VaultController**: 三池余额查询

### Payment (支付)
- **PaymentService**: Xendit 发票创建、查询、退款、Webhook
- **PaymentFulfillmentService**: 支付履约（扣库存→入账→佣金）
- **WebhookVerifier**: Xendit HMAC/Callback Token 验证

### Chat (AI 助手)
- **ChatService**: Ollama Steward 调用、本地推理、工具调用
- 支持语音输入（Web Speech API）和 TTS 输出

### Shipping (物流)
- **ShippingService**: 多国运费计算、时效估算
- 集成 exchange-rate 去硬编码汇率

### Marketing (营销)
- **CouponService**: 优惠券 CRUD (Prisma)

### Cart (购物车)
- **CartService**: 购物车增删改查 (Prisma $transaction)

### Dashboard (仪表盘)
- **DashboardService**: KPI、趋势、分类/国家分析

---

## 4. 数据流

### 请求生命周期

```
Client Request
    │
    ▼
[CORS Middleware] → 跨域白名单校验
    │
    ▼
[ThrottlerGuard] → 全局限流
    │
    ▼
[Controller] → 路由分发、参数验证 (ValidationPipe)
    │
    ▼
[Service] → 业务逻辑
    │
    ▼
[PrismaService] → ORM 查询
    │
    ▼
[PostgreSQL] → 数据持久化
    │
    ▼
[ApiResponseInterceptor] → 统一包装响应 { success, data, timestamp }
    │
    ▼
Client Response
```

### 支付 Webhook 流程

```
Xendit Callback
    │
    ▼
PaymentController.handleWebhook()
    │
    ▼
WebhookVerifier.verify() — HMAC/Callback Token
    │
    ├── 失败 → 401 Unauthorized
    │
    ▼ 通过
PaymentService.handleWebhook()
    │
    ├── PAID → PaymentFulfillmentService.fulfill()
    │            ├── 金额校验 (±1%)
    │            ├── 幂等检查
    │            ├── 订单状态 → PAID
    │            ├── 库存扣减
    │            ├── Vault 分账
    │            └── WhatsApp 通知
    │
    ├── EXPIRED → 订单 → EXPIRED
    └── FAILED  → 订单 → PAYMENT_FAILED
```

---

## 5. 安全设计

### JWT 认证
- 算法: HS256 (可升级 RS256)
- 有效期: 7 天
- 自动刷新: 前端检测过期

### Webhook 签名验证
- Xendit Callback Token: 固定 token 比对
- Xendit HMAC-SHA256: 密钥签名验证
- 防重放: 基于时间窗口

### 乐观锁
- 库存扣减: `WHERE stock >= quantity` 条件更新
- 匹配失败重试 3 次（指数退避）
- 支付履约幂等: PAID 状态检查

### 全局限流
- ThrottlerGuard: 默认 100 req/min
- 登录/注册: 5 req/min (TODO)

### CSV 注入防护
- 导出 CSV: escapeCsvField 转义 `=` `+` `-` `@` 前缀
