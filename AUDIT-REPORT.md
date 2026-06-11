# AceProxy 代码审计报告

**审计日期**: 2026-06-05  
**项目**: AceProxy — 跨境代购平台 (NestJS + React Native + Next.js)  
**严重等级**: CRITICAL > HIGH > MEDIUM > LOW > INFO

---

## 一、安全漏洞 (Security)

### [CRITICAL] S-01: 硬编码数据库凭证提交到代码仓库

**文件**: `apps/server/.env:2`, `docker-compose.yml:9,24`

```env
DATABASE_URL=postgresql://aceproxy_admin:AceProxy2026!@localhost:5432/aceproxy_vault
POSTGRES_PASSWORD: ${DB_PASSWORD:-AceProxy2026!}
```

`.env` 文件包含真实数据库用户名/密码且被提交到 Git（`.gitignore` 中未排除 `.env`）。`docker-compose.yml` 中硬编码了默认密码 `AceProxy2026!`。任何人 clone 仓库即可获取生产凭证。

---

### [CRITICAL] S-02: 硬编码 JWT Secret 且多处回退到同一弱密钥

**文件**: `apps/server/.env:5`, `apps/server/src/modules/auth/auth.module.ts:15`, `apps/server/src/modules/auth/jwt.strategy.ts:11`

```typescript
// auth.module.ts:15
secret: config.get<string>('JWT_SECRET') || 'AceProxySecret2026',

// jwt.strategy.ts:11
secretOrKey: process.env.JWT_SECRET || 'AceProxySecret2026',
```

三处独立引用了同一个硬编码弱密钥 `AceProxySecret2026`。如果环境变量未设置，所有 JWT 将使用此密钥签发，攻击者可伪造任意身份。此外 `auth.module.ts` 使用 ConfigService 而 `jwt.strategy.ts` 直接读 `process.env`，两者可能取到不同的值。

---

### [CRITICAL] S-03: Xendit Webhook Guard 硬编码测试 Token

**文件**: `apps/server/src/modules/vault/XenditWebhookGuard.ts:9`

```typescript
private readonly XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || 'aceproxy_test_token_2026';
```

当环境变量未设置时回退到硬编码测试 token，攻击者可伪造 Xendit 回调，触发支付成功或退款逻辑，造成直接经济损失。

---

### [HIGH] S-04: CORS 完全开放，无任何限制

**文件**: `apps/server/src/main.ts:8`

```typescript
app.enableCors(); // 无参数 = 允许所有来源
```

任何网站都可以向 API 发起跨域请求。结合 Cookie/Token 认证，可导致 CSRF 攻击。

---

### [HIGH] S-05: RBAC 中间件从请求头直接读取角色

**文件**: `apps/server/src/common/middlewares/RBACMiddleware.ts:14`

```typescript
const userRole = req.headers['x-ace-role'] as UserRole;
```

角色权限来自客户端可控的 HTTP Header，攻击者只需设置 `x-ace-role: GOD_MODE` 即可绕过所有权限控制。且此中间件未在 `AppModule` 中注册（`app.module.ts` 中没有 `consumer.apply(RBACMiddleware).forRoutes(...)` 的调用），实际上完全未生效。

---

### [HIGH] S-06: 多个 API 端点缺少认证保护

**文件**: 多个控制器

| 端点 | 文件:行号 | 问题 |
|------|-----------|------|
| `POST /vault/ledger/:orderId` | `VaultController.ts:16-22` | 无认证，任何人可写入财务账本 |
| `GET /vault/audit/:regionId` | `VaultController.ts:46-54` | 无认证，泄露区域资损数据 |
| `POST /chat/supplier-reply` | `ChatController.ts:40-43` | 无认证，可伪造供应商消息 |
| `POST /chat/webhook/whatsapp` | `ChatController.ts:27-35` | 无认证，无签名验证 |
| `POST /arbibot/analyze` | `ArbiBotController.ts:11-14` | 无认证，无速率限制 |
| `POST /holiday/update-config` | `HolidayController.ts:21-24` | 无认证，任何人可修改节日配置 |
| `POST /holiday/toggle` | `HolidayController.ts:30-33` | 无认证，任何人可启停节日引擎 |
| `GET /station/jakarta/home` | `StationController.ts:16-19` | 无认证（低风险，读操作） |

金融端点 `POST /vault/ledger/:orderId` 和管理端点 `POST /holiday/update-config` 完全裸露，是最严重的安全问题。

---

### [HIGH] S-07: 所有控制器使用 `@Body() body: any` — 无输入验证

**文件**: 几乎所有控制器

- `VaultController.ts:19` — `@Body() data: any`
- `VaultController.ts:30` — `@Body() payload: any`
- `TradeController.ts:22-27` — `@Body() body: { items: any[]; amounts: any; ... }`
- `ChatController.ts:28` — `@Body() payload: any`
- `HolidayController.ts:22` — `@Body() config: Partial<HolidayConfig>`

项目已安装 `class-validator` 和 `class-transformer`（见 `package.json`），但从未创建任何 DTO 类，也从未在 `main.ts` 中启用全局 ValidationPipe。任何字段、任何类型都可提交。

---

### [MEDIUM] S-08: 认证接口无速率限制

**文件**: `apps/server/src/modules/auth/auth.controller.ts:9-16`

`/auth/register` 和 `/auth/login` 无任何速率限制，可被暴力破解或用于邮箱轰炸注册。

---

### [MEDIUM] S-09: 支付服务在 API Key 为空时静默返回 Mock 数据

**文件**: `apps/server/src/modules/payment/PaymentService.ts:30-38`

```typescript
if (!this.apiKey) {
  this.logger.warn('[Payment] XENDIT_API_KEY not configured. Using mock mode.');
  return {
    id: `mock-inv-${Date.now()}`,
    invoiceUrl: `https://checkout-staging.xendit.co/mock/${params.orderId}`,
    status: 'PENDING',
  };
}
```

如果配置错误导致 API Key 为空，支付系统会静默返回 mock 响应。用户以为支付已创建，实际上没有真实发票。应抛出异常而非返回假数据。

---

### [MEDIUM] S-10: 密码无强度要求

**文件**: `apps/server/src/modules/auth/auth.service.ts:13`

注册接口无密码复杂度验证，用户可设置 `1` 这样的弱密码。

---

### [LOW] S-11: Prisma Schema 使用 SQLite 而 Docker 使用 PostgreSQL

**文件**: `apps/server/prisma/schema.prisma:6-8` vs `docker-compose.yml:5`

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Prisma 配置的是 SQLite，而 `docker-compose.yml` 和 `.env` 配置的是 PostgreSQL。开发环境用 SQLite、生产用 PostgreSQL 会导致数据类型行为差异（如 `DECIMAL` 精度、`JSONB` 支持等），且 Prisma Client 生成的类型基于 SQLite schema，与生产数据库不匹配。

---

## 二、类型安全 (Type Safety)

### [HIGH] T-01: `strictNullChecks: false` 导致运行时空引用崩溃

**文件**: `apps/server/tsconfig.json:15`

```json
"strictNullChecks": false,
"noImplicitAny": false,
```

具体导致的 bug：

1. **`TradeService.ts:145`** — `const order = await this.prisma.aceOrder.findUnique(...)` 后直接 `order?.totalAmount`，但如果 order 为 null，后续 `order?.totalAmount || 0` 虽然不会崩溃但 rebate 计算会基于 0 金额。
2. **`ChatService.ts:258`** — `rating: (4.5 + Math.round(Math.random() * 5) / 10).toFixed(1)` 在产品搜索结果中生成假评分，TypeScript 不会警告这是业务逻辑错误。
3. **`StationService.ts:60-62`** — `setProductStatus` 和 `updateTrendingProducts` 标记为 `@deprecated` 但返回硬编码 `{ success: true }`，调用方不会收到类型警告。

---

### [MEDIUM] T-02: 大量 `any` 类型绕过所有编译检查

**文件**: 遍布所有模块

| 文件:行号 | 示例 |
|-----------|------|
| `TradeService.ts:42` | `async createOrder(orderData: any, ...)` |
| `TradeService.ts:98` | `async handlePaymentSuccess(orderId: string, payload: any)` |
| `VaultController.ts:19` | `@Body() data: any` |
| `VaultController.ts:30` | `@Body() payload: any` |
| `ChatController.ts:28` | `@Body() payload: any` |
| `ChatService.ts:37` | `products: any[] \| null = null` |
| `ChatService.ts:218` | `private async executeToolCall(toolCall: any)` |
| `ChatService.ts:49` | `const messages: any[] = [...]` |
| `StationService.ts:54` | `async updateTrendingProducts(products: any[])` |
| `RegionService.ts:21` | `async updateSettings(regionId: string, patch: any)` |
| `IntelligenceService.ts:40` | `async monitorHeroProducts(products: any[])` |
| `SmartSplitterService.ts:22` | `async splitOrder(items: any[], ...)` |

`noImplicitAny: false` 使得这些全部通过编译，没有任何类型安全保障。

---

## 三、错误处理 (Error Handling)

### [HIGH] E-01: VaultService 财务操作无事务保护

**文件**: `apps/server/src/modules/vault/VaultService.ts:53-63`

```typescript
for (const entry of entries) {
  await this.prisma.aceVaultLedger.create({ data: { ... } });
}
```

7 条账本分录逐条插入，无事务包裹。如果第 4 条失败，前 3 条已提交，账本将不完整且不可恢复。对于金融系统这是致命的——零和校验通过但实际写入不完整。

---

### [HIGH] E-02: VaultService.finalizeSettlement 只写日志不写数据库

**文件**: `apps/server/src/modules/vault/VaultService.ts:112-121`

```typescript
async finalizeSettlement(orderId: string, partnerId: string, amount: number) {
  this.logger.log(`[Vault] Finalizing payout...`);
  const entries = [...];  // 构建了条目但从未写入
  return { success: true, settled_at: new Date().toISOString() };
}
```

函数返回 `success: true` 但实际上没有任何数据库操作。调用方认为结算已完成，但数据未持久化。

---

### [HIGH] E-03: VaultService.handleChargeback 只写日志不执行任何逻辑

**文件**: `apps/server/src/modules/vault/VaultService.ts:90-94`

```typescript
async handleChargeback(regionId: string, amount: number) {
  this.logger.warn(`[Vault] CRITICAL: Chargeback detected...`);
  return { success: true, status: 'FUNDS_LOCKED' };  // 假返回
}
```

声称 "FUNDS_LOCKED" 但实际上没有任何资金锁定逻辑。拒付已发生但系统未做任何防护。

---

### [MEDIUM] E-04: TradeService 使用 `throw new Error()` 而非 NestJS 异常

**文件**: `TradeService.ts:44`, `TradeService.ts:168`

```typescript
throw new Error('LEGAL_ERROR: 用户必须接受跨境代购不退货协议才能下单。');
throw new Error('INVALID_SALVAGE_ACTION');
```

NestJS 框架不会将 `Error` 转换为适当的 HTTP 响应，会导致 500 Internal Server Error 而非有意义的业务错误码。应使用 `BadRequestException` / `ForbiddenException` 等。

---

### [MEDIUM] E-05: PaymentService.getInvoiceStatus 无 try-catch

**文件**: `apps/server/src/modules/payment/PaymentService.ts:71-81`

```typescript
async getInvoiceStatus(invoiceId: string) {
  const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
  const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {...});
  return response.json();
}
```

无错误处理：1) 无 try-catch，fetch 失败直接抛出未处理异常；2) 不检查 `response.ok`；3) 不验证 `invoiceId` 格式（可注入路径）。

---

### [MEDIUM] E-06: ChatService.executeToolCall 中 JSON.parse 无保护

**文件**: `apps/server/src/modules/chat/ChatService.ts:222-223`

```typescript
const params =
  typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments || {};
```

AI 返回的 `arguments` 可能是畸形 JSON，`JSON.parse` 会抛出未处理异常，导致整个聊天请求失败。

---

### [LOW] E-07: CouponService 抛出原生 Error 而非 NestJS 异常

**文件**: `apps/server/src/modules/marketing/CouponService.ts:43-45`

```typescript
if (!coupon) throw new Error('COUPON_NOT_FOUND');
if (new Date() > coupon.expiresAt) throw new Error('COUPON_EXPIRED');
```

同 E-04，客户端收到 500 而非 400 级别错误。

---

## 四、架构问题 (Architecture)

### [HIGH] A-01: AppModule 是上帝模块 — 所有 20+ 服务直接注册在根模块

**文件**: `apps/server/src/app.module.ts:54-95`

```typescript
@Module({
  controllers: [StationController, VaultController, ChatController, ArbiBotController, HolidayController, TradeController],
  providers: [IntelligenceService, PatentRiskChecker, ArbiBotService, ChatService, HolidayService, SentinelScraper,
    StationService, HolidayPredictorService, IPFirewallService, VaultService, RiskSentryService,
    SmartSplitterService, VisionQCService, ReferralService, RegionService, CouponService,
    ResaleHubService, NotificationService, TradeService, CMSService, UserLevelService, SupplierScoreService],
})
```

所有服务扁平注册在根模块中，没有按业务领域拆分为子模块。只有 `AuthModule` 和 `PaymentModule` 做了封装。这导致：
- 所有服务对其他所有服务可见，无法控制依赖边界
- 任何服务都可以注入任何其他服务，形成隐式依赖网
- 无法独立测试或部署

---

### [MEDIUM] A-02: 大量"模拟"代码混入生产源码

以下服务的主要方法返回硬编码假数据，而非真实实现：

| 文件 | 问题 |
|------|------|
| `HolidayService.ts` | 整个服务用内存变量模拟，不读写数据库 |
| `RegionService.ts` | 用内存 Map 模拟区域设置，重启丢失 |
| `CouponService.ts` | 优惠券存储在内存 Map，重启丢失 |
| `IntelligenceService.ts:65-68` | `scrapeAMZ123()`, `scrapeTikTok()` 返回硬编码数组 |
| `ArbiBotService.ts:34-35` | 用 `Math.random()` 模拟价格分析 |
| `VisionQCService.ts:29-36` | 质检结果全部硬编码 |
| `IPFirewallService.ts:35-43` | Logo 检测和相似度比较返回硬编码值 |
| `NotificationService.ts` | 所有发送方法只打印日志，实际不发送 |

这些不是 TODO 或 stub——它们是"假装工作"的假实现，会在生产中静默返回错误数据。

---

### [MEDIUM] A-03: RiskSentryService 硬编码区域列表

**文件**: `apps/server/src/modules/vault/RiskSentryService.ts:17`

```typescript
const regions = ['JKT', 'LDN']; // 实际应从数据库查询活跃区域
```

注释承认应从数据库查询，但硬编码了两个区域。新增区域不会被监控。

---

### [MEDIUM] A-04: StationService 废弃方法仍被调用

**文件**: `StationService.ts:53-62`, `SentinelScraper.ts:47`, `IntelligenceService.ts:50`

`setProductStatus` 和 `updateTrendingProducts` 标记为 `@deprecated` 但仍被 `SentinelScraper` 和 `IntelligenceService` 调用，且这些方法返回硬编码 `{ success: true }` 而不执行任何操作。调用方以为操作成功，实际无效果。

---

### [LOW] A-05: Prisma Schema 与 SQL Schema 不同步

**文件**: `ace_proxy_schema.sql` vs `apps/server/prisma/schema.prisma`

- SQL schema 中 `ace_users` 没有 `password_hash` 列，Prisma schema 中有
- SQL schema 中 `ace_orders` 有 `commission_amount` 和 `risk_pool_amount` 列，但 `partner_id` 的外键在 Prisma schema 中关联到 `ace_partners`，SQL schema 中也是
- `sql-init.sql` 使用不同表名（`users` vs `ace_users`，`orders` vs `ace_orders`），完全与主 schema 不兼容

存在两套不一致的 SQL schema 文件，加上 Prisma schema，共三套不同的数据模型定义。

---

## 五、数据库问题 (Database)

### [HIGH] D-01: 关键查询缺少索引

**文件**: `apps/server/prisma/schema.prisma`, `ace_proxy_schema.sql`

以下高频查询字段无索引：

| 表 | 字段 | 查询场景 |
|----|------|----------|
| `ace_orders` | `user_id` | 按用户查订单（最频繁） |
| `ace_orders` | `status` | 按状态筛选订单 |
| `ace_orders` | `partner_id` | 按团长查订单 |
| `ace_hero_products` | `status` | 每次首页加载都查 |
| `ace_hero_products` | `category` | AI 工具按类目搜索 |
| `ace_holiday_config` | `station_id` | 按站点查节日配置 |
| `ace_vault_ledger` | `account` | 按账户汇总查询 |

SQL schema 只有 2 个索引（`ace_order_chat.order_id` 和 `ace_vault_ledger.order_id`），Prisma schema 完全没有显式索引定义。

---

### [MEDIUM] D-02: 金额字段使用 Float 类型

**文件**: `apps/server/prisma/schema.prisma:16-17` 等

```prisma
totalSpend  Float  @default(0)
credits     Float  @default(0)
totalAmount Float
sourceCost  Float?
amount      Float
```

金融系统使用 `Float` 会导致浮点精度丢失。例如 `0.1 + 0.2 !== 0.3`。应使用 `Decimal` 类型。SQL schema 中正确使用了 `DECIMAL`，但 Prisma schema 使用了 `Float`。

---

### [MEDIUM] D-03: 缺少 Prisma Migrations

**文件**: 项目中无 `prisma/migrations/` 目录

数据库 schema 只能通过 `prisma db push`（开发模式）或手动 SQL 脚本同步，没有正式的 migration 历史。生产环境无法追踪 schema 变更。

---

### [LOW] D-04: ChatService 在内存中过滤而非数据库层

**文件**: `apps/server/src/modules/chat/ChatService.ts:240-249`

```typescript
// Apply keyword filter in memory (Prisma SQLite doesn't support ILIKE)
let results = rawProducts;
if (params.keyword) {
  const kw = params.keyword.toLowerCase();
  results = rawProducts.filter(p =>
    p.name.toLowerCase().includes(kw) || (p.category || '').toLowerCase().includes(kw),
  );
}
```

先从数据库取全量产品，再在 Node.js 内存中过滤。当产品数量增长时，这是 N+1 的变体——每次都全表扫描。

---

## 六、API 问题

### [HIGH] API-01: 无全局 ValidationPipe — 所有端点接受任意输入

**文件**: `apps/server/src/main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  // 缺少: app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
}
```

项目安装了 `class-validator` 和 `class-transformer` 但从未启用。没有 DTO 类，没有验证管道。

---

### [MEDIUM] API-02: API 响应格式不一致

| 端点 | 返回格式 |
|------|----------|
| `POST /auth/register` | `{ user: {...}, accessToken, expiresIn }` |
| `POST /vault/ledger/:orderId` | `{ success: true, orderId, entries }` |
| `POST /vault/webhooks/xendit` | `{ status: 'SUCCESS' }` |
| `GET /vault/audit/:regionId` | `{ regionId, status, lastAudit }` (硬编码) |
| `POST /trade/salvage/:orderId` | `{ success: true, status, rebateAmount? }` |
| `GET /station/jakarta/home` | 大对象，无标准包装 |

没有统一的响应包装器（如 `{ code, data, message }`），客户端需要为每个端点写不同的解析逻辑。

---

### [MEDIUM] API-03: TradeController.calculateFees 传递硬编码 0 作为 totalSpend

**文件**: `apps/server/src/modules/trade/TradeController.ts:43-48`

```typescript
async calculateFees(@Req() req: any, @Body() body: { baseAmount: number }) {
  return this.tradeService.calculateFinalFees(
    req.user.userId,
    body.baseAmount,
    0, // placeholder for totalSpend, will be fetched from DB
  );
}
```

注释说"应从数据库获取"但实际传了 0，导致所有用户始终按最低等级 (EXPLORER) 计算费率，VIP 用户的折扣永远不生效。

---

## 七、前端问题 (Frontend)

### [HIGH] F-01: CartScreen 使用硬编码 MOCK 数据

**文件**: `apps/mobile/src/screens/CartScreen.tsx:15-18`

```typescript
const MOCK_CART = [
  { id: '1', name: 'Premium Silk Abaya', size: 'XL', price: 1250000, qty: 1 },
  { id: '2', name: 'Smart Prayer Mat V2', size: 'Default', price: 450000, qty: 2 },
];
```

购物车使用硬编码数据而非从后端获取或本地状态管理。数量增减按钮没有绑定事件处理函数（`CartScreen.tsx:55-57`），点击无效。

---

### [HIGH] F-02: ProductDetailScreen 全部硬编码

**文件**: `apps/mobile/src/screens/ProductDetailScreen.tsx`

整个页面是硬编码的 "Premium Silk Abaya" 产品，没有接收任何 productId 参数，没有从 API 获取数据。加购按钮没有实际逻辑。

---

### [HIGH] F-03: PaymentScreen 金额硬编码，上传凭证是假的

**文件**: `apps/mobile/src/screens/PaymentScreen.tsx:22`

```typescript
export const PaymentScreen = ({ orderTotal = '2,450,000' }) => {
```

- 金额默认值硬编码
- "上传凭证"按钮只是设置 `proofUploaded = true`（`PaymentScreen.tsx:74`），没有实际文件上传
- 提交后只是 Alert 弹窗，没有调用后端 API

---

### [HIGH] F-04: HomeScreen 利润数据硬编码

**文件**: `apps/mobile/src/screens/HomeScreen.tsx:229`

```typescript
<Text style={styles.pulseAmount}>Rp 12,450,000</Text>
<Text style={styles.trendText}>▲ 12.4% vs last week</Text>
```

"利润脉搏"卡片展示的金额和趋势是硬编码的，与真实数据无关。

---

### [HIGH] F-05: Web 管理后台全部硬编码假数据

**文件**: `apps/web/src/pages/index.tsx`

整个 Web 管理后台是纯静态假数据：
- AI Sourcing 页面（行 33-36）：3 个硬编码的套利商品
- Hot Products 页面（行 74-79）：6 个硬编码产品
- VisionQC 页面（行 135-136）：2 个硬编码质检记录
- Orders 页面（行 217-219）：3 个硬编码订单
- Membership 页面（行 303-306）：4 个硬编码等级
- Vault 页面（行 339-351）：**存在但永远不会执行** — 代码被 `membership` case 的 `return` 语句短路

---

### [MEDIUM] F-06: APIService BASE_URL 硬编码开发环境地址

**文件**: `apps/mobile/src/services/APIService.ts:3`

```typescript
const BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Android emulator -> host machine
```

生产 APK 会指向 `10.0.2.2`（Android 模拟器专用地址），在真机上无法连接。没有环境区分逻辑。

---

### [MEDIUM] F-07: 前端 TradeService.executeArbitrage 硬编码金额

**文件**: `apps/mobile/src/services/TradeService.ts:78-83`

```typescript
const result = await api.createOrder({
  items: [{ productId, quantity: 1 }],
  amounts: { total: 100000, cost: 70000, shipping: 20000, serviceFee: 10000 },
  destination: 'JKT',
  terms_accepted: true,
});
```

无论用户买什么产品，订单金额永远是 Rp 100,000。

---

### [MEDIUM] F-08: Landing 页面通过 JS 注入全局 CSS

**文件**: `apps/web/src/pages/landing.tsx:312-322`

```typescript
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes scan { ... }`;
  document.head.appendChild(styleSheet);
}
```

在 Next.js SSR 环境中通过 JS 操作 DOM 注入样式，会导致 hydration mismatch 和闪烁。

---

## 八、DevOps 问题

### [HIGH] DEV-01: Docker 镜像缺少 Prisma 生成步骤

**文件**: `apps/server/Dockerfile:6-7`

```dockerfile
RUN npm install
COPY . .
RUN npm run build
```

没有 `RUN npx prisma generate` 步骤。`prisma` 在 `dependencies` 中，但 Prisma Client 需要在构建时生成。镜像可能无法启动。

---

### [MEDIUM] DEV-02: Docker 无健康检查

**文件**: `apps/server/Dockerfile`, `docker-compose.yml`

Dockerfile 和 docker-compose 均无 `HEALTHCHECK` 指令。容器崩溃时无法被自动检测和重启。

---

### [MEDIUM] DEV-03: PostgreSQL 端口暴露到宿主机

**文件**: `docker-compose.yml:11`

```yaml
ports:
  - "5432:5432"
```

数据库端口对公网开放，应仅对 server 容器可见（删除 `ports` 映射，使用 Docker 内部网络）。

---

### [MEDIUM] DEV-04: `.env` 未加入 `.gitignore`

**文件**: `apps/server/.gitignore`

`.gitignore` 内容只有 `node_modules`，`.env` 文件会被提交到仓库。

---

### [LOW] DEV-05: `@types/bcrypt` 和 `@types/passport-jwt` 错误放在 dependencies

**文件**: `apps/server/package.json:21-22`

```json
"@types/bcrypt": "^6.0.0",
"@types/passport-jwt": "^4.0.1",
```

类型定义包应在 `devDependencies` 中，放在 `dependencies` 会增加生产镜像体积。

---

### [LOW] DEV-06: `prisma` CLI 不应在 dependencies 中

**文件**: `apps/server/package.json:28`

```json
"prisma": "^5.22.0",
```

`prisma` CLI 是开发工具，应在 `devDependencies` 中。生产环境只需要 `@prisma/client`。

---

## 九、测试问题

### [HIGH] TEST-01: 零测试覆盖

项目中没有任何测试文件。无 `*.spec.ts`、`*.test.ts`、`__tests__/` 目录，无 Jest/Vitest 配置。

对于涉及金融交易的系统，这是不可接受的风险。特别是：
- VaultService 的零和账本逻辑
- TradeService 的费用计算
- AuthService 的密码验证
- CouponService 的折扣计算

这些核心逻辑没有任何自动化测试保护。

---

## 十、依赖问题

### [MEDIUM] DEP-01: NestJS v10 和 v4 包混用

**文件**: `apps/server/package.json`

```json
"@nestjs/common": "^10.0.0",
"@nestjs/config": "^4.0.4",    // v4
"@nestjs/jwt": "^11.0.2",      // v11
"@nestjs/passport": "^11.0.5",  // v11
"@nestjs/schedule": "^4.0.0",   // v4
```

NestJS 核心包是 v10，但 `@nestjs/config`、`@nestjs/jwt`、`@nestjs/passport`、`@nestjs/schedule` 使用了 v4/v11 版本。这些独立包的版本号与 NestJS 主版本不是同一体系，可能导致运行时兼容性问题。

---

### [LOW] DEP-02: `pg` 包安装但从未使用

**文件**: `apps/server/package.json:27`

```json
"pg": "^8.11.0",
```

项目使用 Prisma 作为 ORM，不需要直接使用 `pg` 驱动。Prisma 自带数据库驱动。

---

## 问题汇总

| 等级 | 数量 | 关键问题 |
|------|------|----------|
| CRITICAL | 3 | 硬编码数据库凭证、JWT 弱密钥、Webhook 硬编码 Token |
| HIGH | 14 | CORS 开放、RBAC 伪造、无认证端点、无输入验证、无事务、假实现、零测试 |
| MEDIUM | 15 | Float 金额、无索引、假数据前端、Docker 问题、类型安全 |
| LOW | 6 | 类型包位置、未用依赖、Schema 不同步 |
| INFO | — | — |

### 最优先修复的 5 个问题

1. **S-01 + S-02**: 立即从代码中移除所有硬编码密钥，将 `.env` 加入 `.gitignore`，轮换所有已泄露的凭证
2. **S-05 + S-06**: 修复 RBAC 中间件从 JWT token 而非 Header 读取角色，为所有金融/管理端点添加认证
3. **E-01**: 为 VaultService 的账本写入添加 `$transaction` 包裹
4. **API-01**: 创建 DTO 类并启用全局 ValidationPipe
5. **TEST-01**: 至少为 VaultService、TradeService、AuthService 添加单元测试
