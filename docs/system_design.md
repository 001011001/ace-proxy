# AceProxy — System Design & Task Decomposition (MVP Sprint for Indonesia Launch)

> **Architect**: Bob (高见远)  
> **Date**: 2026-06-18  
> **Scope**: 印尼上线 MVP 冲刺 — 从 45% → 85%

---

## Part A: System Design

### 1. Implementation Approach

#### 1.1 Core Technical Challenges

| # | Challenge | Resolution |
|---|-----------|------------|
| 1 | 5 个 Service 用内存 Map/变量存储，AceCoupon/AceHolidayConfig 表已有但未用 | 全部改为 Prisma ORM 读写，复用已有 Schema |
| 2 | 4 个 Service 返回硬编码假数据（爬虫/AI分析/质检/视觉防火墙） | 保留代码骨架 + `@todo` 标记 + `logger.warn` 降级，不阻塞上线 |
| 3 | 前端 PWA (258KB 单文件) 使用大量硬编码 mock 数据 | 逐步替换为 `fetch(API_BASE + ...)` 真实调用，保留 fallback |
| 4 | 后端异常不规范（`throw new Error`） | 统一替换为 NestJS 标准异常类 |
| 5 | 汇率硬编码散落各处 | 迁移到 `countries/id/config.ts` 集中管理 |
| 6 | 缺少 Dashboard/Order/Logistics/Vault 管理端点 | 基于已有 Prisma 数据补全查询端点 |

#### 1.2 Architecture Principles

- **渐进式改造**: 不重构，不改表结构，所有改动在现有文件内完成
- **后端优先**: 先让数据真实流动，前端再接入
- **降级兼容**: 前端 API 调用失败时回退到现有 mock 数据（不影响 UI 展示）
- **NestJS 原生**: 所有持久化用 PrismaService（已全局可用），不改 NestJS 架构

#### 1.3 Framework & Library Decisions

| 决策点 | 选择 | 理由 |
|--------|------|------|
| ORM | Prisma（已有） | `AceCoupon`, `AceHolidayConfig` 等表已在 Schema 中定义 |
| 通知 | 站内通知 Prisma + 邮件骨架 | 印尼 MVP 不需要 FCM/APNs 真实集成 |
| 爬虫/AI | `@todo` + `logger.warn` | 避免引入 Puppeteer/OpenAI 依赖，延迟到下一阶段 |
| API 文档 | `@nestjs/swagger` | NestJS 原生 Swagger 集成，加装饰器即可 |
| 前端 API | `fetch()` + 已有 `API_BASE` | 前端已有 `apiCall()` 封装和 JWT 鉴权链路 |

---

### 2. File List

#### 2.1 Files to MODIFY (all existing — no new files for services)

```
# ── Round 1 / T01: Infrastructure ──
apps/server/package.json                          # 移除 pg, 移动 @types 到 devDeps
apps/server/src/countries/id/config.ts            # 添加 exchangeRate + shipping markup 集中常量
apps/server/Dockerfile                            # 添加 HEALTHCHECK
apps/server/.env.production                       # DATABASE_URL → PostgreSQL

# ── Round 1 / T02: Mock → Real DB (8 services + fixes) ──
apps/server/src/modules/marketing/CouponService.ts       # 内存 Map → Prisma CRUD
apps/server/src/modules/holiday/HolidayService.ts        # 内存变量 → Prisma CRUD
apps/server/src/modules/region/RegionService.ts          # 内存 Map → Prisma 查询
apps/server/src/modules/notification/NotificationService.ts  # 站内通知 Prisma + 邮件骨架
apps/server/src/modules/intelligence/IntelligenceService.ts  # @todo + warn 替代硬编码
apps/server/src/modules/intelligence/ArbiBotService.ts   # @todo + warn 替代 Math.random()
apps/server/src/modules/wms/VisionQCService.ts           # @todo + warn 替代硬编码
apps/server/src/modules/sentinel/IPFirewallService.ts    # @todo + warn 替代硬编码
apps/server/src/modules/trade/TradeService.ts            # throw new Error → NestJS exceptions
apps/server/src/modules/chat/ChatService.ts              # JSON.parse try-catch + fallback
apps/server/src/app.module.ts                             # 注册 Notification 依赖(如需)

# ── Round 1 / T03: API Completeness + Hardcoded Rates ──
apps/server/src/modules/payment/PaymentService.ts        # getInvoiceStatus try-catch加固
apps/server/src/modules/shipping/ShippingService.ts      # 汇率从 config 引用
apps/server/src/modules/dashboard/DashboardService.ts    # 补全 /dashboard/kpi 等端点
apps/server/src/modules/order/OrderController.ts         # 补全 /order/list 端点
apps/server/src/modules/logistics-tracking/LogisticsTrackingService.ts  # 补全 stats
apps/server/src/modules/vault/VaultService.ts            # 补全 /vault/summary 端点

# ── Round 2 / T04: Frontend API Integration ──
deploy/index.html                             # 7 处 mock → 真实 API
deploy/admin.html                             # 4 处 mock → 真实 API
deploy/api-client.js                          # [NEW] 共享 API 客户端（可选抽取）

# ── Round 3 / T05: Testing + Docs + Deploy ──
apps/server/src/modules/vault/__tests__/VaultService.spec.ts      # [NEW]
apps/server/src/modules/trade/__tests__/TradeService.spec.ts      # [NEW]
apps/server/src/modules/auth/__tests__/AuthService.spec.ts        # [NEW]
apps/server/src/modules/marketing/__tests__/CouponService.spec.ts # [NEW]
apps/server/src/modules/cart/__tests__/CartService.spec.ts        # [NEW]
apps/server/src/modules/shipping/__tests__/ShippingService.spec.ts # [NEW]
apps/server/src/modules/order/__tests__/OrderController.spec.ts   # [NEW]
apps/server/src/modules/payment/__tests__/PaymentService.spec.ts  # [NEW] — 已有 PaymentFulfillmentService.spec.ts
apps/server/src/main.ts                          # 添加 Swagger bootstrap
docs/ARCHITECTURE.md                             # [NEW]
docs/DEPLOYMENT.md                               # [NEW]
apps/server/.env.production                      # 最终确认 DATABASE_URL
apps/server/Dockerfile                           # HEALTHCHECK 最终确认
```

---

### 3. Data Structures and Interfaces

#### 3.1 Key Prisma Models (already in schema.prisma — shown for reference)

```mermaid
classDiagram
    class AceCoupon {
        +String id
        +String code
        +String type
        +Decimal value
        +Decimal minSpend
        +Decimal maxDiscount
        +String country
        +DateTime startDate
        +DateTime endDate
        +Int usageLimit
        +Int usedCount
        +String status
        +DateTime claimedAt
        +DateTime usedAt
    }

    class AceHolidayConfig {
        +Int id
        +String stationId
        +String festivalName
        +String themeId
        +Int reminderDays
        +String reminderMessage
        +Boolean isActive
        +DateTime updatedAt
    }

    class AceOrder {
        +String id
        +String userId
        +String status
        +Decimal totalAmount
        +String country
        +DateTime createdAt
    }

    class AceVaultLedger {
        +String id
        +String orderId
        +String account
        +Decimal amount
        +String entryType
        +DateTime createdAt
    }

    class AceProduct {
        +String id
        +String name
        +String category
        +Decimal priceIdr
        +String status
        +Decimal ratingAvg
    }

    class AceCartItem {
        +String id
        +String userId
        +String productId
        +Int quantity
        +Boolean selected
    }

    class AceLogisticsNode {
        +String id
        +String orderId
        +String node
        +DateTime timestamp
        +String location
        +String note
    }
```

#### 3.2 Service Class Interfaces (post-refactor)

```mermaid
classDiagram
    class CouponService {
        -PrismaService prisma
        +createCoupon(data) Promise~AceCoupon~
        +applyCoupon(code, orderAmount) Promise~DiscountResult~
        +listCoupons(country?) Promise~AceCoupon[]~
        +validateCoupon(code) Promise~AceCoupon~
    }

    class HolidayService {
        -PrismaService prisma
        +getConfig(stationId) Promise~AceHolidayConfig~
        +updateConfig(patch) Promise~AceHolidayConfig~
        +toggleActivation(active) Promise~AceHolidayConfig~
        +listConfigs() Promise~AceHolidayConfig[]~
    }

    class RegionService {
        -PrismaService prisma
        +getSettings(regionId) Promise~RegionSettings~
        +updateSettings(regionId, patch) Promise~void~
        +getChargebackRate(regionId) Promise~number~
    }

    class NotificationService {
        -PrismaService prisma
        +sendLogisticUpdate(userId, status, trackingId) Promise~void~
        +sendMarketingBlast(userIds, content) Promise~void~
        +sendWhatsAppMessage(phone, text) Promise~void~
        +createInAppNotification(userId, type, body) Promise~void~
        +getNotifications(userId) Promise~Notification[]~
    }

    class DashboardService {
        -PrismaService prisma
        +getKpi() Promise~KpiResult~
        +getTrend(days) Promise~TrendPoint[]~
        +getCategoryBreakdown() Promise~CategoryBreak[]~
    }

    class TradeService {
        -PrismaService prisma
        -VaultService vault
        +createOrder(data, compliance) Promise~AceOrder~
        +calculateFinalFees(userId, amount) Promise~FeeResult~
        +handlePaymentSuccess(orderId, payload) Promise~void~
        +handleSalvageAction(userId, orderId, action) Promise~void~
    }

    class ChatService {
        -PrismaService prisma
        -LocalLlmService localLlm
        +stewardChat(userId, msg, history, products, sessionId) Promise~ChatResult~
        -parseAction(text) Action | null~
        -executeToolCall(call) Promise~any~
        -fallbackReply(sessionId, intent) ChatResult~
    }

    class PaymentService {
        -ConfigService config
        -PrismaService prisma
        +createInvoice(params) Promise~XenditInvoice~
        +getInvoiceStatus(invoiceId) Promise~XenditInvoice~
        +handleWebhook(payload) Promise~void~
        +getCollectionReconciliation(params) Promise~Reconciliation~
    }

    class ShippingService {
        -YuntuShippingProvider yuntu
        +getUserQuote(params) Promise~UserQuote~
        +getConsolidatedUserQuote(params) Promise~ConsolidatedQuote~
        -getDefaultCurrency(country) string~
    }

    CouponService --> PrismaService : uses
    HolidayService --> PrismaService : uses
    RegionService --> PrismaService : uses
    NotificationService --> PrismaService : uses
    DashboardService --> PrismaService : uses
    TradeService --> PrismaService : uses
    ChatService --> PrismaService : uses
    PaymentService --> PrismaService : uses
```

---

### 4. Program Call Flow

#### 4.1 Coupon Apply Flow (Mock → Real DB)

```mermaid
sequenceDiagram
    participant Client
    participant CartController
    participant CouponService
    participant PrismaService
    participant DB[(PostgreSQL)]

    Client->>CartController: POST /cart/apply-coupon {code, amount}
    CartController->>CouponService: applyCoupon(code, amount)
    CouponService->>PrismaService: aceCoupon.findUnique({code})
    PrismaService->>DB: SELECT * FROM ace_coupons WHERE code=$1
    DB-->>PrismaService: coupon row
    PrismaService-->>CouponService: AceCoupon | null
    
    alt coupon not found
        CouponService-->>CartController: NotFoundException
    else coupon expired
        CouponService-->>CartController: BadRequestException
    else minSpend not met
        CouponService-->>CartController: BadRequestException
    else valid
        CouponService->>CouponService: calculate discount
        CouponService->>PrismaService: aceCoupon.update({usedCount: +1})
        CouponService-->>CartController: {discount, finalAmount}
    end
    CartController-->>Client: Response
```

#### 4.2 Product List → Order Creation (Frontend API Integration)

```mermaid
sequenceDiagram
    participant PWA as PWA (index.html)
    participant API as NestJS API
    participant DB as PostgreSQL

    Note over PWA: Home Screen Load
    PWA->>API: GET /product/list?limit=200
    API->>DB: SELECT * FROM ace_products WHERE status='ACTIVE'
    DB-->>API: products[]
    API-->>PWA: {code:0, data:{items:[...]}}
    
    Note over PWA: User adds to cart
    PWA->>API: POST /cart/add {productId, quantity}
    API->>DB: INSERT INTO ace_cart_items
    API-->>PWA: {code:0, data:{cartItem}}

    Note over PWA: User checks out
    PWA->>API: POST /trade/order {items, shippingAddress, paymentMethod}
    API->>DB: INSERT INTO ace_orders + ace_order_items
    API-->>PWA: {code:0, data:{orderId, status}}

    Note over PWA: Redirect to payment
    PWA->>API: POST /payment/create {orderId, amount, ...}
    API-->>PWA: {code:0, data:{invoice_url, payment_methods}}
```

#### 4.3 Dashboard KPI Loading (Admin)

```mermaid
sequenceDiagram
    participant Admin as Admin (admin.html)
    participant API as NestJS API
    participant DB as PostgreSQL

    Admin->>API: GET /dashboard/kpi
    API->>DB: Aggregate ace_orders (monthGmv, todayGmv, totalOrders, activeUsers)
    API->>DB: Aggregate ace_vault_ledger (totalProfit, totalCost, totalShipping)
    API->>DB: Count ace_products WHERE status='ACTIVE'
    DB-->>API: aggregated results
    API-->>Admin: {code:0, data:{monthGmv, todayGmv, totalProfit, activeUsers, ...}}

    Admin->>API: GET /dashboard/trend
    API->>DB: GROUP BY date last 7 days
    DB-->>API: daily points[]
    API-->>Admin: {code:0, data:[{date, gmv, orders},...]}

    Admin->>API: GET /dashboard/category-breakdown
    API->>DB: GROUP BY category
    DB-->>API: category breakdown[]
    API-->>Admin: {code:0, data:[{category, revenue, orderCount},...]}
```

---

### 5. Anything UNCLEAR

| # | Topic | Assumption / Question |
|---|-------|----------------------|
| 1 | RegionService 的 DB 表 | Schema 中无专门的 region 表。**假设**: 用 `ace_payment_configs` 表按 `regionCode` 查询，或保持内存方案 + 加 `@todo` 标记等待建表 |
| 2 | Notification 站内通知表 | Schema 中无 `ace_notifications` 表。**假设**: 复用 `ChatLog` 表或创建轻量通知记录。MVP 阶段可用 `logger.log` + 预留表结构注释 |
| 3 | Admin 财务金库 `/vault/summary` | 已确认 VaultService 有 recordOrderLedger，但无 summary 聚合端点。**假设**: 基于 `ace_vault_ledger` 表按 account 聚合 |
| 4 | 前端优惠券 API `/api/v1/coupon` | 当前只有 `CouponService.applyCoupon`。**假设**: 补全 `GET /coupon/list` 端点 |
| 5 | 前端支付硬编码 Rp 2,450,000 | 实际是 `RenderCheckout()` 中基于 cart 动态计算。**假设**: 主要改为调用 `POST /trade/calculate` 获取真实费用明细 |
| 6 | Swagger 接入范围 | **假设**: 仅对 `@Controller` 加 `@ApiTags` + DTO 加 `@ApiProperty`，不要求全覆盖 |

---

## Part B: Task Decomposition

### 6. Required Packages

```
- @nestjs/swagger@^11.0.0           # Swagger API 文档 (T05)
- swagger-ui-express@^5.0.0         # Swagger UI 服务 (T05)
```

> **无需新增其他包**: Prisma 已在用，前端纯 vanilla JS (fetch)，通知/爬虫/AI 均暂不接入外部服务。

### 7. Task List (ordered by dependency)

| Task ID | Task Name | Source Files | Dependencies | Priority |
|---------|-----------|-------------|--------------|----------|
| **T01** | 项目基础设施：依赖清理 + 汇率配置 + Docker + Prisma 初始化 | `apps/server/package.json`, `apps/server/src/countries/id/config.ts`, `apps/server/Dockerfile`, `apps/server/.env.production`, `apps/server/prisma/schema.prisma` (migration) | 无 | **P0** |
| **T02** | 后端 Mock→DB 真实化：8 个 Service 改造 + 异常修复 | `CouponService.ts`, `HolidayService.ts`, `RegionService.ts`, `NotificationService.ts`, `IntelligenceService.ts`, `ArbiBotService.ts`, `VisionQCService.ts`, `IPFirewallService.ts`, `TradeService.ts`, `ChatService.ts`, `app.module.ts` | T01 | **P0** |
| **T03** | 后端 API 补全 + 汇率去硬编码：Dashboard/Order/Logistics/Vault 端点 | `DashboardService.ts`, `OrderController.ts`, `LogisticsTrackingService.ts`, `VaultService.ts`, `ShippingService.ts`, `PaymentService.ts` | T01, T02 | **P1** |
| **T04** | 前端真实 API 接入：PWA 7 处 + Admin 4 处 | `deploy/index.html`, `deploy/admin.html`, `deploy/api-client.js` [NEW] | T03 | **P1** |
| **T05** | 测试 + Swagger 文档 + 部署文档：42+ 测试 + API 文档 + 运维手册 | 8 个 spec 文件 [NEW], `main.ts`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, `.env.production`, `Dockerfile` | T03, T04 | **P2** |

#### Task Details

---

##### T01: 项目基础设施 (P0)

**验收标准**:

1. `package.json`: `pg` 从 dependencies 移除；`@types/*` 全部在 devDependencies 中（当前已部分在 devDeps，确认无遗漏）
2. `countries/id/config.ts`: 新增 `exchangeRate` 集中导出常量 `EXCHANGE_RATE_CNY_TO_IDR = 2200`、`EXCHANGE_MARKUP = 1.03`，以及 `shipping.markup` 已在其中（确认 40/10）
3. `Dockerfile`: 添加 `HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3001/health || exit 1`
4. `.env.production`: `DATABASE_URL=postgresql://user:pass@host:5432/aceproxy`（替换 SQLite）
5. Prisma migration: `npx prisma migrate dev --name init` 生成初始迁移文件

**涉及文件**: 5 个

---

##### T02: 后端 Mock→DB 真实化 (P0)

**验收标准**:

1. **CouponService**: 注入 `PrismaService`，`createCoupon` → `prisma.aceCoupon.create`，`applyCoupon` → `prisma.aceCoupon.findUnique({where:{code}})`，删除内存 `Map`
2. **HolidayService**: 注入 `PrismaService`，`getConfig` → `prisma.aceHolidayConfig.findFirst({where:{stationId}})`，`updateConfig` → `prisma.aceHolidayConfig.upsert`，删除内存变量
3. **RegionService**: 注入 `PrismaService`，从 `ace_payment_configs` 表按 `regionCode` 查询；若无匹配行则返回默认值
4. **NotificationService**: 新增 `createInAppNotification` 方法写入 ChatLog 表；`sendLogisticUpdate`/`sendMarketingBlast` 调用站内通知 + 保留日志；邮件骨架 `@todo` 注释
5. **IntelligenceService**: `scrapeAMZ123()` / `scrapeTikTok()` 返回空数组 + `@todo REAL_SCRAPER` + `logger.warn`
6. **ArbiBotService**: `analyze` 中 `Math.random()` 分支改为 `@todo REAL_AI_ANALYSIS` + `logger.warn` + 返回降级结果
7. **VisionQCService**: `performQC` 中硬编码 `aiAnalysis` 改为 `@todo REAL_GPT4V` + `logger.warn` + 返回 `MANUAL_REVIEW` 状态
8. **IPFirewallService**: `detectBrandLogo` / `calculateVisualSimilarity` 改为 `@todo REAL_VISION_API` + `logger.warn` + 返回 `PASS`
9. **TradeService**: 所有 `throw new Error(...)` 改为 `throw new ForbiddenException(...)` 或 `BadRequestException(...)`
10. **ChatService**: `parseAction()` 中的 `JSON.parse(match[2])` 包裹 try-catch，失败返回 `{action: match[1], params: {}}`
11. `app.module.ts`: 确认所有改造后的 Service 的依赖注入完整（NotificationService 若新增 Prisma 依赖需确认）

**涉及文件**: 11 个

---

##### T03: 后端 API 补全 + 汇率去硬编码 (P1)

**验收标准**:

1. **PaymentService**: `getInvoiceStatus()` 已有 try-catch（复核确认）；`getInvoicesByOrderId()` 已有错误处理（复核）
2. **ShippingService**: `exchangeRates` 和 `exchangeMarkup` 改为从 `countries/id/config.ts` 导入（`ID_CONFIG.currency.exchangeRateToCny`, `ID_CONFIG.pricing.exchangeRateMarkup`），移除类内硬编码
3. **DashboardService**: 补全方法：
   - `getKpi()`: 聚合 ace_orders (monthGmv, todayGmv, totalOrders)、ace_products (totalProducts)、ace_users (activeUsers)、ace_vault_ledger (totalProfit, totalCost, totalShipping)、计算 netMargin
   - `getTrend(days=7)`: GROUP BY date 近 N 天 GMV + 订单数
   - `getCategoryBreakdown()`: GROUP BY category 营收
4. **DashboardController**: 确认已有 `/dashboard/kpi`、`/dashboard/trend`、`/dashboard/category-breakdown` 端点路由
5. **OrderController**: 补全 `GET /order/list` 端点（分页 + 状态筛选 + 国家筛选），基于 `ace_orders` 表
6. **LogisticsTrackingService**: 补全 `getStats()` 方法（按状态统计包裹数：IN_TRANSIT / AT_WAREHOUSE / DELIVERED）
7. **LogisticsTrackingController**: 确认已有 `GET /logistics-tracking/stats` 端点
8. **VaultService**: 补全 `getSummary()` 方法（聚合 ace_vault_ledger 按 account 汇总）
9. **VaultController**: 确认已有 `GET /vault/summary` 端点

**涉及文件**: 6 个

---

##### T04: 前端真实 API 接入 (P1)

**验收标准**（所有原有 mock 数据保留为 fallback，API 调用失败不阻塞 UI）:

**deploy/index.html (PWA):**

1. **首页产品列表**: `fetchProducts()` 已调用 `GET /product/list` ✅（复核确认工作正常）
2. **产品详情弹窗**: 点击产品卡片 → `GET /product/:id` → 渲染详情（当前用 `P.find()` → 改为 API 调用）
3. **购物车**: `Cart.add()` → `POST /cart/add`；`Cart.remove()` → `DELETE /cart/:productId`；页面加载 → `GET /cart/list`
4. **下单结算**: `RenderCheckout()` → 先调 `POST /trade/calculate` 获取费用明细（serviceFee/shipping/discount），替换硬编码 `disc=subtotal*0.05; ship=65000`
5. **支付页**: `PlaceOrder()` 成功后 → 调 `POST /payment/create` 获取 `invoice_url` 和支付方式，替换跳转逻辑
6. **物流追踪**: `GET /logistics-tracking/:orderId` → 渲染真实 timeline 节点
7. **优惠券**: `GET /coupon/list` 替换 Coupons.list 硬编码数组；`POST /cart/apply-coupon` 接入真实校验

**deploy/admin.html (Admin):**

8. **仪表盘 KPI**: `rDashboard()` 中 `api('/dashboard/kpi')` 已接入 ✅（复核确认 chart 数据也走 API）
9. **订单管理**: `rOrders()` 中 `api('/order/list')` 已接入 ✅（复核确认分页/筛选工作正常）
10. **物流管理**: 补全物流 Tab 的 `api('/logistics-tracking/stats')` 调用
11. **财务金库**: 补全财务 Tab 的 `api('/vault/summary')` 调用

**涉及文件**: 3 个（2 个已存在修改 + 1 个新建）

---

##### T05: 测试 + Swagger + 部署文档 (P2)

**验收标准**:

1. **42+ 单元测试**: 每个 spec 文件至少 5 个测试用例，覆盖正常路径 + 异常路径 + 边界条件
   - `VaultService.spec.ts`: recordOrderLedger / recordSalvageRebate / getSummary (5+ tests)
   - `TradeService.spec.ts`: createOrder / calculateFinalFees / handlePaymentSuccess (6+ tests)
   - `AuthService.spec.ts`: login / register / validateUser / token refresh (5+ tests)
   - `CouponService.spec.ts`: createCoupon / applyCoupon / listCoupons / expire check / minSpend check (6+ tests)
   - `CartService.spec.ts`: addToCart / removeFromCart / listCart / consolidate (5+ tests)
   - `ShippingService.spec.ts`: getUserQuote / getConsolidatedQuote / validateAddress (5+ tests)
   - `PaymentService.spec.ts`: createInvoice / getInvoiceStatus / handleWebhook / refundInvoice (6+ tests)
   - `OrderController.spec.ts`: list orders / filter by status / pagination (5+ tests)
2. **Swagger 文档**: `main.ts` 添加 `SwaggerModule.setup('api/docs', app, document)`；各 Controller 添加 `@ApiTags`；关键 DTO 添加 `@ApiProperty`
3. **docs/ARCHITECTURE.md**: 包含项目结构图、模块依赖关系、数据流图、技术栈说明（≤500 行）
4. **docs/DEPLOYMENT.md**: 包含环境变量清单、Docker 部署步骤、数据库迁移步骤、健康检查、回滚方案
5. **.env.production**: 最终确认 `DATABASE_URL` 为 PostgreSQL 连接串
6. **Dockerfile**: 确认 HEALTHCHECK 已添加

**涉及文件**: 13 个（8 个新建 spec + 1 修改 main.ts + 2 新建 docs + 2 修改配置）

---

### 8. Shared Knowledge

```
─ 所有 API 响应格式: { code: 0, data: {...}, message?: string }
  (已有 ApiResponseInterceptor 全局拦截器确保此格式)

─ 认证方式: JWT Bearer Token
  (前端 Auth.getHeaders() → { Authorization: 'Bearer ' + jwt })

─ 汇率约定:
  1 CNY = 2200 IDR (基准, 在 countries/id/config.ts 中维护)
  用户端汇率 = 基准 × 1.03 (3% 加价)
  所有运费计算: costCny → userPriceCny → userPriceIdr

─ 数据库: PostgreSQL (Prisma ORM)
  PrismaService 已全局可用, 通过依赖注入使用

─ @todo 标记规范:
  // @todo REAL_SCRAPER: 接入 Puppeteer 爬取 AMZ123 (ETA 2026-Q3)
  // @todo REAL_AI_ANALYSIS: 接入 OpenAI GPT-4o 套利分析 (ETA 2026-Q3)
  // @todo REAL_GPT4V: 接入 GPT-4o-vision 质检 (ETA 2026-Q3)
  // @todo REAL_VISION_API: 接入 Google Vision API Logo检测 (ETA 2026-Q3)

─ 异常规范:
  ✅ throw new BadRequestException('CODE')
  ✅ throw new NotFoundException('CODE')
  ✅ throw new ForbiddenException('CODE')
  ✅ throw new InternalServerErrorException('CODE')
  ✅ throw new ServiceUnavailableException('CODE')
  ❌ throw new Error('plain string')  // 禁止

─ 日志规范:
  this.logger.log('[ModuleName] Normal operation')
  this.logger.warn('[ModuleName] Degraded: ...reason')
  this.logger.error('[ModuleName] Failed: ...error')

─ 前端 fallback 约定:
  try { const res = await fetch(API_BASE + '/...'); if(res.ok) { /* use data */ return; } } catch(e) {}
  // 继续使用现有 mock 数据, 不阻塞 UI
  console.warn('[AceProxy] API unavailable, using local fallback')
```

---

### 9. Task Dependency Graph

```mermaid
graph TD
    T01["T01 项目基础设施<br/>依赖清理+Docker+Prisma"]
    T02["T02 Mock→DB真实化<br/>8个Service改造+异常修复"]
    T03["T03 API补全<br/>Dashboard+Order+Logistics+Vault"]
    T04["T04 前端API接入<br/>PWA 7处+Admin 4处"]
    T05["T05 测试+文档+部署<br/>42+specs+Swagger+Docs"]

    T01 --> T02
    T01 --> T03
    T02 --> T03
    T03 --> T04
    T03 --> T05
    T04 --> T05
```

**并行机会**:
- T02 和 T03 可部分并行（T03 中 PaymentService/ShippingService 不依赖 T02 结果）
- T04 开发可与 T03 交叉进行（前端先按 API 契约开发，后端补全端点后联调）
- T05 依赖 T03 补全的端点（用于测试），可与 T04 并行
