# AceProxy 生产就绪性评估报告

**评估日期**: 2026-08-05  
**评估人**: 自动化代码审查 + 实时验证  
**项目**: AceProxy — 跨境代购平台 (NestJS + Next.js + React Native)  

---

## 一、项目全貌

### 1.1 技术栈

| 层级 | 技术 | 版本 | 状态 |
|------|------|------|------|
| 后端框架 | NestJS | 10.x | ✅ 最新 |
| ORM | Prisma | 5.22 | ✅ |
| 数据库 | PostgreSQL | 14 (docker)/Supabase | ✅ |
| 支付 | Xendit | API v2 | ⚠️ sandbox |
| AI/LLM | node-llama-cpp + Ollama | qwen3-4b / qwen2.5:1.5b | ⚠️ 2.5GB模型在仓库 |
| Web前端 | Next.js | 13.4.12 | ⚠️ 过时（当前最新15.x） |
| Mobile | React Native (Expo) | SDK 50 | ⚠️ 过时（当前最新52） |
| 认证 | JWT + Passport | - | ✅ |
| CI/CD | GitHub Actions | - | ⚠️ 有bug |

### 1.2 模块地图

```
ace-proxy/
├── apps/
│   ├── server/  (NestJS — 40+ 业务模块)
│   │   ├── prisma/schema.prisma  (31 个数据模型)
│   │   ├── src/modules/
│   │   │   ├── auth/          ✅ 已修复硬编码JWT
│   │   │   ├── vault/         ✅ 原子事务分账
│   │   │   ├── trade/         ✅ Prisma接入
│   │   │   ├── payment/       ✅ Xendit全功能集成
│   │   │   ├── dashboard/     ✅ 实时KPI
│   │   │   ├── holiday/       ✅ DB持久化（原mock）
│   │   │   ├── coupon/        ⚠️ 缺少user-coupon关联表
│   │   │   ├── notification/  ⚠️ 推送仍为骨架
│   │   │   ├── chat/          ✅ 双模式LLM引擎
│   │   │   ├── customer-service/ ✅ AI客服4层架构
│   │   │   ├── compliance/    ✅ 合规检查
│   │   │   ├── shipping/      ✅ 多物流商
│   │   │   ├── wms/           ✅ 仓库管理
│   │   │   ├── purchase-order/ ✅ 采购单ERP
│   │   │   ├── intelligence/  ✅ ArbiBot/套利/专利
│   │   │   ├── cron/          ✅ 定时任务
│   │   │   ├── station/       ✅ 多站点管理
│   │   │   ├── llm/           ✅ 本地LLM模块
│   │   │   └── ... (~25个其他模块)
│   │   └── ai-models/  ⚠️ 2.5GB GGUF文件
│   ├── web/  (Next.js — 商店前台 + 19 Admin页面)
│   │   └── src/pages/
│   │       ├── index.tsx        ✅ 首页→真实API
│   │       ├── checkout.tsx     ✅ 三语言结账页
│   │       ├── cart.tsx         ✅ 购物车
│   │       ├── products/        ✅ 商品详情/列表
│   │       ├── orders/          ✅ 订单追踪
│   │       ├── login.tsx        ✅ Google OAuth登录
│   │       └── admin/  (19页面)
│   │           ├── dashboard.tsx    ✅ 实时BI看板
│   │           ├── vault.tsx        ⚠️ 类型不匹配
│   │           ├── orders.tsx       ⚠️ 状态枚举不对齐
│   │           ├── customer-service.tsx  ✅ AI客服面板
│   │           ├── finance.tsx / compliance.tsx / ...
│   │           └── warehouse.tsx    ✅ 最大22KB
│   └── mobile/  (React Native Expo)
│       └── src/screens/
│           ├── HomeScreen.tsx       ⚠️ TS类型错误
│           ├── ProductDetailScreen.tsx
│           ├── CartScreen.tsx
│           ├── StewardChatScreen.tsx
│           └── ... (15+ screens)
└── packages/shared/  (HS Code/合规字典)
```

### 1.3 当前进度（对照需求矩阵）

| 需求领域 | 完成度 | 说明 |
|----------|--------|------|
| 用户系统 | 90% | 注册/登录/JWT/角色/会员等级 ✅，社交登录占位 |
| 商品目录 | 85% | 31模型完整，多国本地化 ✅，搜索/分类 ✅ |
| 订单交易 | 85% | 创建→支付→分账→拆单→采购单 ✅，Salvage流 ✅ |
| 支付系统 | 80% | Xendit集成 ✅，Webhook ✅，退款 ✅，Sandbox模式 |
| 物流追踪 | 75% | 15节点状态机 ✅，多物流商运费表 ✅，推送骨架 |
| AI能力 | 70% | ChatService双模式 ✅，AI客服 ✅，ArbiBot ✅，2.5GB本地模型 ⚠️ |
| 财务审计 | 80% | Vault零和账本 ✅，事务 ✅，拒付处理 ✅ |
| 前端(Web) | 75% | 商店+Admin ✅，API接入 ✅，大量TS错误 ⚠️ |
| 前端(Mobile) | 65% | 导航+状态管理 ✅，API接入 ✅，大量TS错误 ⚠️，缺失模块 |
| 工程基础设施 | 55% | CI存在但有bug，无migrations，环境变量泄露历史 |

---

## 二、不足清单

> 严重度：🔴 阻断 > 🟠 高风险 > 🟡 中等 > 🔵 低  
> 标注：【已验证】= 本轮实时验证 / 【历史文档】= 基于AUDIT-REPORT/DELIVERY-SUMMARY

---

### 🔴 阻断项（Pilot前必须修复）

#### B-01: 【已验证】无 Prisma Migrations 目录 — 数据库版本管理缺失
- **文件**: `apps/server/prisma/`（仅 schema.prisma，无 migrations/ 子目录）
- **证据**: `git status` 显示 `D apps/server/prisma/migrations/20260612052006_init/migration.sql` 和 `D apps/server/prisma/migrations/migration_lock.toml`（迁移文件被删除）
- **现状**: CI 使用 `prisma db push` 而非 `prisma migrate deploy`，无法追溯 schema 变更历史
- **影响**: 生产环境数据库变更不可控，无法回滚，多环境同步困难
- **修复**: 执行 `prisma migrate dev --name init` 生成初始迁移并提交

#### B-02: 【已验证】Web 前端 API 无 JWT Token 认证机制
- **文件**: `apps/web/src/services/api.ts:20-44`
- **证据**: `request()` 函数未添加 `Authorization: Bearer <token>` 头，API调用不携带任何认证信息
- **影响**: Admin 面板所有操作实际上依赖后端守卫放行（或后端未强制认证），一旦正确配置JWT守卫，整个管理后台将无法使用
- **修复**: 从 localStorage/sessionStorage 读取 token 并注入到请求头

#### B-03: 【已验证】`.env.production` 已提交到 Git 历史
- **文件**: `apps/server/.env.production`（2次提交：12f06c7, b26e9e3）
- **影响**: 虽然当前版本使用占位符，但历史记录中文件路径已暴露，存在未来误提交真实密钥的风险
- **修复**: `git filter-branch` 或 `BFG Repo-Cleaner` 清理历史；将 `.env.production` 加入 `.gitignore`

#### B-04: 【已验证】CI smoke-test 阶段缺少 build 步骤
- **文件**: `.github/workflows/ci.yml:80`
- **证据**: `node dist/src/main.js` 依赖编译产物，但 `smoke-test` job 只有 `npm ci` + `prisma generate` + `prisma db push`，没有 `nest build`
- **影响**: CI 冒烟测试永远无法通过，后端部署管道形同虚设
- **修复**: 在 `Start server` 步骤前增加 `- name: Build` → `run: npx nest build`

#### B-05: 【已验证】CI 引用根目录 `seed-100-products.js` 但文件在 `apps/server/` 下
- **文件**: `.github/workflows/ci.yml:75` → `node seed-100-products.js`
- **证据**: `seed-100-products.js` 实际在 `apps/server/seed-100-products.js`（19337字节，经确认存在）
- **影响**: CI seed 步骤路径错误，数据无法初始化，后续 smoke test 无数据返回

#### B-06: 【已验证】`ai-models/` 含 2.5GB GGUF 模型文件
- **文件**: `apps/server/ai-models/qwen3-4b-q4_k_m.gguf` (2,497,280,480 字节)
- **影响**: (1) Docker build context 膨胀，构建 >5分钟 (2) `.gitignore` 未排除，可能被提交 (3) Docker 镜像体积 >3GB (4) CI runner 磁盘不足
- **修复**: 加入 `.gitignore` + `.dockerignore`，改为 CI 运行时下载或使用 `docker-compose` volume 挂载

#### B-07: 【已验证】生产环境变量全为占位符
- **文件**: `apps/server/.env.production:8-39`
- **证据**: `JWT_SECRET=CHANGE_ME_TO_RANDOM_32_CHAR_STRING`, `XENDIT_API_KEY=`(空), `ALIBABA_APP_KEY=`(空), `SUPABASE_URL=https://[PROJECT-ID].supabase.co`
- **影响**: 任何"生产"部署实际上无法运行支付、认证、外部API等核心功能
- **修复**: 配置真实的 Supabase / JWT / Xendit 生产凭据（通过环境变量注入，不写入文件）

---

### 🟠 高风险项（Pilot 后尽快修复）

#### H-01: 【已验证】AppModule 为 God Module — 严重违反 NestJS 模块化原则
- **文件**: `apps/server/src/app.module.ts:136-227`
- **证据**: 47 个直接 provider 注册 + 12 个 module import，近 100 行 providers 列表；许多 service 与其 controller 拆散（如 TradeService 在 providers 但 TradeController 在 controllers）
- **影响**: (1) 启动慢，所有依赖全部初始化 (2) 无法 tree-shaking / 懒加载 (3) 单元测试必须 mock 全部依赖链 (4) TradeService/PaymentFulfillmentService 测试失败直接根因
- **修复**: 各模块封装为 NestJS Module（已有 trade.module.ts、cart.module.ts 等但未在 AppModule 中使用）

#### H-02: 【已验证】Web 和 Mobile 大量 TypeScript 错误
- **Web**: ~36 个 TS 错误
  - 核心问题: React 类型版本不兼容（`@types/react@18.2.18` vs 内置 ReactNode 类型），`Skeleton.tsx`、`Toast.tsx`、`_app.tsx` 都受影响
  - Admin 页面属性声明缺失：`vault.tsx` 多处 `.pools`/`.ledger`/`.riskRatio` 等属性在 `{}` 类型上不存在
  - `orders.tsx` 订单状态枚举与后端不对齐（`"processing"` vs `"SHIPPED"`）
  - `products/[id].tsx` 缺 `Bot`、`Alert` 导入
- **Mobile**: ~50+ 个 TS 错误
  - `fontVariant: readonly ["tabular-nums"]` 与 RN 类型不兼容
  - `boxShadow` 不是 RN 标准属性（应为 elevation/shadowOffset 等）
  - `theme.shadows.card` 属性不存在
  - `CommanderDashboardScreen` 模块已删除但 `RootNavigator` 仍引用
  - `RootNavigator` children 属性缺失
- **影响**: CI TypeScript 检查全部失败；生产构建可能功能性受阻

#### H-03: 【已验证】Notification 推送为完整骨架 — 无生产推送能力
- **文件**: `apps/server/src/modules/notification/NotificationService.ts:73-75, 108-125`
- **证据**: FCM/APNs 推送注释 `@todo P2 — 接入 Firebase Admin SDK`；WhatsApp 方法 `sendWhatsAppMessage` 有真实 API 结构但 `isDevMockEnabled()` 为 true 时只输出日志，生产环境 `throw new ConfigurationError`
- **影响**: 核心信任链路"WhatsApp通知"完全不可用；用户支付后无推送确认

#### H-04: 【已验证】CouponService 缺少 user-coupon 关联表
- **文件**: `apps/server/src/modules/marketing/CouponService.ts:50-61`
- **证据**: `listUserCoupons` 通过 `claimedAt` 字段近似查询，代码注释明确承认 "当前无 user-coupon 关联字段"
- **影响**: 无法精确追踪哪个用户领取了哪张优惠券；优惠券核销逻辑存在并发漏洞

#### H-05: 【已验证】测试中存在依赖注入断裂
- **文件**: `TradeService.spec.ts`(5个测试失败), `PaymentFulfillmentService.spec.ts`(3个测试失败)
- **证据**: TradeService 新增了 `PurchaseOrderService` 依赖（构造器第7个参数）但测试 mock 未更新；PaymentFulfillmentService 新增了 `InventoryService` 依赖但测试未注册
- **影响**: 8/58 测试失效，回归保护不足

#### H-06: 【已验证】Web 前端严重依赖后端可用性
- **文件**: `apps/web/src/pages/index.tsx:71-93`
- **证据**: 首页 `fetchData()` 调用 `/api/v1/station/jakarta/home` 和后备 `/api/v1/product/list`，但无 JWT 无认证；后端宕机时整个页面只显示错误信息无静态回退
- **影响**: Bad UX，后端维护期间前端完全不可用

#### H-07: 【已验证】根目录历史副本/遗留文件混乱
- **位置**: `D:\工作库\apps\`、`ace-proxy-git\`、`clone_test\`、`dist\`、`deliverables\` 等多份副本
- **证据**: 根目录 `tsconfig.json`、`server_tsconfig.json`、`web_tsconfig.json` 与 `ace-proxy/` 内主项目并存
- **影响**: 新开发者混淆入口；CI/构建可能引用到错误配置

---

### 🟡 中等优先级

#### M-01: 【已验证】RBAC 中间件仅保护 3 条路由
- **文件**: `apps/server/src/app.module.ts:230`
- **证据**: `consumer.apply(RBACMiddleware).forRoutes('vault', 'station', 'holiday')` 只覆盖 3 个路径前缀；其他管理端点（payment、purchase-order、admin 等）不在 RBAC 保护下
- **状态**: 相比审计报告 S-05（从 Header 读取角色）已大幅改进 → 现从 JWT `req.user.role` 读取，但仍覆盖不足

#### M-02: 【历史文档】前端页面部分仍为 mock 数据
- **来源**: 审计报告 F-05 标记（未逐页验证）
- **现状**: Admin dashboard 和首页已确认接入真实 API（通过 `useApi` hook），但部分边缘页面（如 some admin pages 的某些数据区）可能仍用硬编码数据

#### M-03: 【已验证】Docker 安全性不完善
- **文件**: `docker-compose.yml:10`
- **证据**: `POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}` — 默认值 `changeme`
- **文件**: `docker-compose.yml:20-21` — 服务器端口 `3001:3001` 暴露到宿主机
- **修复**: 移除默认值（强制报错）；生产部署考虑 nginx 反向代理不直接暴露端口

#### M-04: 【已验证】Server TS4053 错误（非阻塞但需修复）
- **文件**: `apps/server/src/modules/customer-service/CustomerServiceController.ts:76`
- **错误**: `Return type of public method from exported class has or is using name 'UserProfile' from external module "...ConversationMemory" but cannot be named.`
- **修复**: 显式导出 `UserProfile` 类型或在方法返回值上使用显式类型注解

#### M-05: 【已验证】PaymentService.ts 金额类型为 number（非 Decimal）
- **文件**: `apps/server/src/modules/payment/PaymentService.ts:60-61`
- **证据**: `amount: number` 参数，JavaScript 浮点运算有精度问题
- **状态**: Schema 层已全部用 Decimal，但 Payment 接口层仍用 number

#### M-06: 【已验证】前端 dashboard admin 语言硬编码
- **文件**: `apps/web/src/pages/admin/dashboard.tsx` (全部 22KB) 和其他 admin 页面
- **证据**: Admin 面板全部为英文界面，无印尼语/泰语/中文支持，与用户端的多语言策略不统一

---

### 🔵 低优先级

#### L-01: Next.js 版本过时
- **当前**: 13.4.12 (2023年)
- **最新**: 15.x
- **风险**: 安全漏洞未修复、App Router 等新特性缺失

#### L-02: Expo SDK 版本过时
- **当前**: SDK 50
- **最新**: SDK 52

#### L-03: 缺少端到端(E2E)测试
- 当前只有 58 个单元/集成测试，无 Playwright/Cypress/Detox E2E 测试

#### L-04: 日志和监控缺失
- 无 APM (Datadog/Sentry/Grafana) 集成
- 无结构化日志（JSON格式）/ 集中式日志收集
- 无告警规则配置

---

## 三、上线距离评估

### 3.1 内部试点 (Internal Pilot) — 可容忍手工操作

**估计工作量: 2-3 周**（2名全栈工程师）

| # | 阻塞项 | 估时 |
|---|--------|------|
| 1 | **Prisma Migration 恢复** — `prisma migrate dev --name init`，提交 migrations 目录 | 0.5天 |
| 2 | **Web JWT Token 认证** — `api.ts` 注入 Authorization header，刷新 token 逻辑 | 1天 |
| 3 | **清理 Git 敏感信息** — `git filter-branch` 移除 `.env.production` 历史 | 0.5天 |
| 4 | **修复 CI** — build步骤 + 路径修正 + 实际跑通一次 | 1天 |
| 5 | **ai-models .gitignore/.dockerignore** — 排除 2.5GB 文件 | 0.5天 |
| 6 | **配置生产环境变量** — Supabase/JWT/Xendit sandbox key | 1天 |
| 7 | **修复 2 个失败测试套件** — TradeService/PaymentFulfillmentService mock 补齐 | 0.5天 |
| 8 | **Web TS 关键错误修复** — React类型 + admin API属性声明（vanlt/orders/products） | 2天 |
| 9 | **端到端流程验证** — 手动走通：注册→浏览→下单→支付(沙箱)→订单状态→管理后台 | 3天 |
| 10 | **试点环境部署** — 一台VPS + Docker Compose 拉起 + nginx | 1天 |
| | **合计** | **11天 ≈ 2.5周** |

> **试点定义**: 5-10 名内部员工/友好用户，沙箱支付（Xendit sandbox），手动运营（WhatsApp人工回复，后台手动建采购单）。**不面向真实支付用户**。

### 3.2 公开 Beta — 真实支付、自动运营

**额外工作量: 3-4 周**（试点完成后）

| # | 高风险项 | 估时 |
|---|---------|------|
| 1 | **AppModule 模块化重构** — Trade/Cart/Product 等模块封装，消除上帝模块 | 5天 |
| 2 | **Web + Mobile TS 错误清零** — ~86个TS错误逐一修复 | 5天 |
| 3 | **Notification 推送接入** — Firebase Admin SDK + WhatsApp Business API | 3天 |
| 4 | **Coupon 关联表扩展** — AceUserCoupon 模型 + 迁移 + 逻辑更新 | 2天 |
| 5 | **Xendit 生产环境切换** — KYC + Live API Key + Webhook 生产URL | 2天 |
| 6 | **真实 1688/Yuntu API 对接** — 替换占位 Token，测试真实采购/物流查询 | 3天 |
| 7 | **Mobile TS 关键修复** — RN类型兼容 + CommanderDashboard移除 + navigation children | 3天 |
| 8 | **补充 E2E 测试** — Playwright 核心流程（注册→下单→支付） | 3天 |
| | **合计** | **26天 ≈ 5周** |

### 3.3 正式上线 — 全功能、多国合规

**额外工作量: 4-6 周**（Beta 完成后）

| # | 必备项 | 估时 |
|---|--------|------|
| 1 | **生产监控/告警** — Sentry + Grafana + 业务关键指标 dashboard | 3天 |
| 2 | **自动化备份/恢复** — PostgreSQL 定时备份 + 恢复演练 | 2天 |
| 3 | **多国合规** — 印尼/泰国/菲律宾 数据本地化 + 税务发票 + 消费者保护 | 5天 |
| 4 | **负载压测** — k6/Artillery 模拟 1000 并发用户 | 2天 |
| 5 | **安全渗透测试** — 第三方安全审计 | 外包 |
| 6 | **文档和培训** — 运营手册 + 客服SOP | 2天 |
| 7 | **Mobile 发布** — App Store + Google Play 审核提交 | 3天 |
| 8 | **灰度发布策略** — 5%→20%→100% 流量切换 | 1天 |
| 9 | **CI/CD 完善** — 自动部署回滚 + 蓝绿部署 | 3天 |
| | **合计** | **21天 ≈ 4周（不含第三方审计）** |

---

## 四、总结结论

```
当前状态:  MVP 代码完成度 ~85%，工程就绪度 ~55%，生产就绪度 ~30%

距离 Pilot:  ████████░░  2-3 周（10个阻塞项）
距离 Beta:   ████████████████░░░░  再加 5 周（8个高风险项）
距离正式上线: ████████████████████████░░  再加 4 周（9个必备项）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总距离正式上线:  ~11-13 周（2-3 名工程师）
```

### 核心判断

1. **后端业务逻辑质量较高**：VaultService 的零和账本、PaymentService 的 Xendit 全功能集成、DashboardService 的 KPI 聚合都是生产级质量。安全审计 P0/P1 大部分已修复。

2. **前端工程健康度堪忧**：Web ≥36 个 TS 错误 + Mobile ≥50 个 TS 错误 + 无 token 认证 = 前端在"demo 可运行，生产不能用" 的状态。

3. **工程基础设施是最大短板**：无数据库迁移、CI 破损、敏感文件在 Git 历史、2.5GB 二进制在仓库。这些不是功能问题但会直接阻断部署。

4. **外部依赖处于"零配置"状态**：Xendit/1688/WhatsApp/Supabase 全部为空/占位符，从沙箱到生产的切换是硬门槛。

### 建议路径

**立即执行（本周）**: B-01~B-07 全部阻断项，争取在 2.5 周内达到 Pilot 标准。  
**Pilot 后**: 按 H-01~H-07 顺序，2周内达到 Beta 标准。  
**正式上线前**: M-01~M-06 + L-01~L-04，预留 4 周缓冲区。

---

*本报告基于 2026-08-05 的 `ace-proxy/` 目录代码实时验证（`tsc --noEmit`、`npx jest`、`npx prisma validate`、`git log/status`）。所有标注【已验证】的条目均为本轮验证结果；标注【历史文档】的条目来自 `AUDIT-REPORT.md` 和 `DELIVERY-SUMMARY.md`，未经逐行当前代码复核。*
