# AceProxy Figma 完整设计规范 v2.0

> **用途**：本文件可直接导入 Figma 作为设计系统的唯一真相来源（Single Source of Truth）。
> **覆盖范围**：消费者商城（Track 1）+ 管理后台指挥中心（Track 2），共 22 个核心页面。
> **设计风格**：温暖可靠的赤陶土色品牌 + 数据密集的暗色管理后台。

---

## 一、设计系统基础 (Design Tokens)

### 1.1 色彩系统 (Color System)

#### 品牌色 (Brand Colors)
| Token | HEX | OKLCH | 用途 |
|-------|-----|-------|------|
| `primary` | `#d45d3a` | `oklch(60% 0.16 38)` | 主 CTA、价格高亮、活跃状态 |
| `primary-press` | `#b8492a` | `oklch(52% 0.16 38)` | 按下态、hover |
| `primary-soft` | `#fce8e2` | `oklch(94% 0.03 38)` | 卡片 hover 边框、KPI 高亮背景 |
| `ocean` | `#0f7b8c` | `oklch(52% 0.08 210)` | 物流/追踪/信任信号 |
| `ocean-soft` | `#e0f4f7` | `oklch(94% 0.03 210)` | 信任卡片背景 |
| `ink` | `#1a1a2e` | `oklch(18% 0.02 270)` | 正文、深色导航背景 |
| `ink-secondary` | `#3d3d5c` | `oklch(32% 0.02 270)` | 次要文本、描述 |
| `ink-mute` | `#6b6b80` | `oklch(52% 0.01 270)` | 辅助文本、placeholder |

#### 语义色 (Semantic Colors)
| Token | HEX | 用途 |
|-------|-----|------|
| `success` | `#1ea366` | 订单完成、QC 通过、toast 成功 |
| `success-soft` | `#e6f7ee` | 成功态标签背景 |
| `warning` | `#e8a020` | 待处理、延迟预警 |
| `warning-soft` | `#fef7e6` | 价格对比卡片背景 |
| `error` | `#d14343` | 支付失败、QC 拒收 |
| `error-soft` | `#fde8e8` | 错误态标签背景 |
| `price-red` | `#e53935` | **仅用于**最终折扣价格 |
| `badge-yellow` | `#f5a623` | "New"、"Hot" 促销标签 |

#### 表面色 (Surface Colors)
| Token | HEX | 用途 |
|-------|-----|------|
| `canvas` | `#ffffff` | 管理后台背景、产品详情页 |
| `canvas-warm` | `#fefaf7` | **消费者商城默认背景** |
| `canvas-gray` | `#f5f5f8` | 区块背景、搜索栏、表头 |
| `hairline` | `#e8e8ef` | 卡片边框、表格分割线 |
| `hairline-input` | `#c4c4d0` | 表单输入框边框 |

#### 国家标识色 (Country Accents)
| Token | HEX | 国家 |
|-------|-----|------|
| `id-flag` | `#ce1126` | 🇮🇩 印尼 |
| `th-flag` | `#2d2a4a` | 🇹🇭 泰国 |
| `ph-flag` | `#0038a8` | 🇵🇭 菲律宾 |
| `br-flag` | `#009b3a` | 🇧🇷 巴西 |

---

### 1.2 字体系统 (Typography System)

**字体范式**：Plus Jakarta Sans（展示/标题） + Inter（正文）
- Plus Jakarta Sans → DM Sans → Noto Sans → system-ui
- Inter Variable → Inter → system-ui
- 价格数字 **必须** 启用 `tnum`（等宽数字）

| 层级 | Token | 字号 | 字重 | 行高 | 字间距 | Figma 设置 |
|------|-------|------|------|------|--------|-----------|
| Hero | `display-xl` | 48px | 700 | 1.1 | -0.96px | Line height: 52.8 |
| 大标题 | `display-lg` | 36px | 700 | 1.15 | -0.72px | Line height: 41.4 |
| 中标题 | `display-md` | 28px | 700 | 1.2 | -0.56px | Line height: 33.6 |
| 页面标题 | `heading-xl` | 24px | 600 | 1.25 | -0.24px | Line height: 30 |
| 卡片标题 | `heading-lg` | 20px | 600 | 1.3 | -0.1px | Line height: 26 |
| 子标题 | `heading-md` | 18px | 600 | 1.35 | 0 | Line height: 24.3 |
| 小节标题 | `heading-sm` | 16px | 600 | 1.4 | 0 | Line height: 22.4 |
| 导语正文 | `body-lg` | 17px | 400 | 1.55 | 0 | Line height: 26.4 |
| 默认正文 | `body-md` | 15px | 400 | 1.5 | 0 | Line height: 22.5 |
| 次要信息 | `body-sm` | 13px | 400 | 1.45 | 0 | Line height: 18.9 |
| 表格数字 | `body-tabular` | 15px | 450 | 1.5 | 0 | 启用 tnum |
| 主价格 | `price-xxl` | 28px | 700 | 1.2 | -0.56px | 启用 tnum |
| 卡片价格 | `price-lg` | 22px | 700 | 1.25 | -0.22px | 启用 tnum |
| 摘要价格 | `price-md` | 18px | 600 | 1.3 | 0 | 启用 tnum |
| 大按钮 | `button-lg` | 16px | 600 | 1.0 | 0 | - |
| 中按钮 | `button-md` | 14px | 600 | 1.0 | 0 | - |
| 小按钮 | `button-sm` | 12px | 600 | 1.0 | 0.24px | - |
| 说明文字 | `caption` | 12px | 450 | 1.4 | 0.12px | - |
| 极小字 | `micro` | 11px | 400 | 1.35 | 0 | - |
| 标签 | `badge` | 11px | 700 | 1.0 | 0.44px | Letter spacing: 5% |

---

### 1.3 间距系统 (Spacing System)

基准：4px。在 Figma 中使用 Auto Layout 的 Gap 属性。

| Token | px | 用途 |
|-------|-----|------|
| `xxs` | 2px | 图标-文字间距 |
| `xs` | 4px | 标签内边距 |
| `sm` | 8px | 卡片内容间距、表单行间距 |
| `md` | 12px | 产品网格间距、表格单元格 |
| `lg` | 16px | 区块内边距（移动端） |
| `xl` | 24px | 卡片内边距、区块间距 |
| `xxl` | 32px | 页面级区块分隔 |
| `huge` | 48px | 主区块分隔 |
| `massive` | 64px | Hero 底部间距 |

---

### 1.4 圆角系统 (Border Radius)

**核心规则（Pill Mandate）**：所有可交互元素使用 `pill (9999px)`。

| Token | px | 用途 |
|-------|-----|------|
| `none` | 0px | 管理后台表格单元格、图表容器 |
| `xs` | 3px | 表头圆角 |
| `sm` | 6px | 表单输入框 |
| `md` | 10px | 信任卡片、Toast |
| `lg` | 16px | 产品卡片、功能卡片、KPI 卡片 |
| `xl` | 24px | Hero 图片容器、专题横幅 |
| `pill` | 9999px | **所有按钮、标签、搜索栏、国家选择器** |

---

### 1.5 阴影/层级系统 (Elevation)

| 层级 | CSS Shadow | 用途 | Figma Effect |
|------|-----------|------|-------------|
| L0 | 无 | 默认表面 | - |
| L1 | `0 1px 0 0 #e8e8ef` | 卡片边框 | Inner shadow bottom |
| L2 | `0 2px 8px rgba(26,26,46,0.06)` | 下拉菜单、Tooltip | Drop shadow Y:2 Blur:8 |
| L3 | `0 4px 20px rgba(212,93,58,0.08)` | **仅**产品卡片 hover | Drop shadow Y:4 Blur:20 |
| L4 | `0 8px 32px rgba(26,26,46,0.12)` | 弹窗、底部面板 | Drop shadow Y:8 Blur:32 |

---

## 二、组件库规范 (Component Library)

> 所有组件在 Figma 中必须使用 **Auto Layout** 构建，支持 `hug contents` / `fill container` 自适应。

### 2.1 按钮系统 (Buttons)

#### Primary Pill（主按钮）
```
[Figma Auto Layout]
- 填充：primary #d45d3a
- 文字：on-primary #ffffff
- 字体：button-lg (16px/600)
- 圆角：pill 9999px
- 内边距：12px 28px
- Hover: primary-press #b8492a
- 最小触控目标：44×44px
```

#### Outline Pill（描边按钮）
```
- 填充：透明
- 描边：1.5px primary #d45d3a
- 文字：primary #d45d3a
- 字体：button-lg
- 圆角：pill
- 内边距：11px 27px
```

#### Ocean Pill（海洋按钮 - 物流/追踪用）
```
- 填充：ocean #0f7b8c
- 文字：on-ocean #ffffff
- 字体：button-md (14px/600)
- 圆角：pill
- 内边距：8px 20px
```

#### Ghost Button（幽灵按钮）
```
- 填充：透明
- 文字：ink-secondary #3d3d5c
- 字体：button-md
- 圆角：pill
- 内边距：8px 16px
- Hover: canvas-gray #f5f5f8
```

#### Danger Button（危险按钮）
```
- 填充：error #d14343
- 文字：on-primary #ffffff
- 字体：button-md
- 圆角：pill
- 内边距：8px 20px
- 必须配合确认步骤
```

---

### 2.2 卡片系统 (Cards)

#### Product Card（产品卡片）— 核心组件
```
[Figma Auto Layout - Vertical]
┌──────────────────────────┐
│  Product Image (1:1)     │ ← rounded-lg 顶部，object-fit: cover
│  [Save XX% Badge]        │ ← 绝对定位右上角
├──────────────────────────┤
│  Brand Name · caption    │ ← ink-mute
│  Product Name · heading-xl│ ← ink，最多2行截断
│  ~~Rp 450,000~~ · body-sm│ ← ink-mute 删除线
│  Rp 180,000 · price-lg   │ ← ink bold
│  Rp 100,000 (CNY ≈ ¥45) │ ← body-sm + ink-mute
│  [🇮🇩 Indonesia] · pill   │ ← pill-tag-country
└──────────────────────────┘
- 背景：canvas #ffffff
- 圆角：lg 16px
- 边框：1px hairline #e8e8ef
- Hover：边框 → primary-soft，阴影 L3
- 宽度：自适应（min 280px）
```

#### Trust Card（信任卡片）
```
- 背景：ocean-soft #e0f4f7
- 圆角：md 10px
- 内边距：16px
- 文字：body-sm
- 包含：1个信任信号（源头直采·仓库实拍·破损包赔）
```

#### Pricing Compare Card（价格对比卡片）
```
- 背景：warning-soft #fef7e6
- 圆角：md 10px
- 内边距：12px 16px
- 左侧：平台价格（price-md）
- 中间：节省百分比（badge-save）
- 右侧：AceProxy 价格（price-md）
```

#### KPI Card（管理后台指标卡片）
```
- 背景：canvas #ffffff
- 圆角：lg 16px
- 内边距：20px
- 边框：1px hairline
- 标签：caption + ink-mute
- 数值：price-lg
- 变化指示器：pill-tag-success / pill-tag-error
- 高亮版：背景 primary-soft + 边框 primary
```

---

### 2.3 输入与表单 (Inputs & Forms)

#### Text Input（文本输入框）
```
- 背景：canvas #ffffff
- 圆角：sm 6px
- 内边距：10px 14px
- 边框：1px hairline-input #c4c4d0
- 字体：body-md
- Focus：边框 1.5px primary #d45d3a
- Placeholder：ink-mute (对比度 ≥ 4.5:1)
```

#### Search Bar（搜索栏）
```
- 背景：canvas-gray #f5f5f8
- 圆角：pill 9999px
- 内边距：10px 20px
- 字体：body-md
- 左侧图标：🔍 (lucide search)
- Placeholder：ink-mute
- 移动端聚焦时：全宽 + 返回按钮
```

---

### 2.4 导航系统 (Navigation)

#### Nav Bar - Consumer（消费者顶部导航）
```
- 背景：canvas #ffffff
- 内边距：12px 24px
- 左侧：Logo
- 中间：搜索栏（桌面端）
- 右侧：通知铃铛 + 购物车图标
- 移动端：搜索栏隐藏，底部 Tab 导航替代
```

#### Nav Bar - Admin（管理后台侧边栏）
```
- 背景：ink #1a1a2e
- 宽度：240px（固定）
- 全高度
- 顶部：Logo
- 中部：导航分组
  - 活跃态：primary #d45d3a
  - 非活跃态：on-primary 50% 透明度
- 底部：用户头像 + 退出
- 压缩态（<1200px）：64px 仅图标
```

#### Bottom Nav - Mobile（移动端底部标签）
```
- 背景：canvas #ffffff
- 5 个图标：Home / Discover / Cart / Orders / Profile
- 活跃态：primary #d45d3a
- 非活跃态：ink-mute #6b6b80
- 内边距：8px 0 20px 0（safe-area 感知）
- 图标尺寸：24×24px
- 标签：micro 11px
```

---

### 2.5 标签与徽章 (Tags & Badges)

所有标签统一使用 `pill (9999px)` + `badge (11px/700/0.44px)` 字体。

| 组件 | 背景色 | 文字色 | 示例 |
|------|--------|--------|------|
| `pill-tag-primary` | primary-soft | primary | "代购服务"、"已验证" |
| `pill-tag-ocean` | ocean-soft | ocean | "包邮"、"已追踪" |
| `pill-tag-success` | success-soft | success | "现货"、"QC 通过" |
| `pill-tag-warning` | warning-soft | warning | "集运中"、"待处理" |
| `pill-tag-error` | error-soft | error | "QC 拒收"、"售罄" |
| `pill-tag-country` | canvas-gray | ink-secondary | "🇮🇩 印尼"、"🇹🇭 泰国" |
| `badge-save` | error | on-primary | "-67% vs Shopee" |

---

### 2.6 管理后台专用组件 (Admin Components)

#### 数据表格 (Data Table)
```
表头：
- 背景：canvas-gray #f5f5f8
- 字体：caption
- 文字色：ink-mute
- 底部边框：1px hairline

数据行：
- 背景：canvas（默认）/ canvas-gray（hover）
- 字体：body-sm 或 body-tabular（数字列）
- 底部边框：1px hairline
- 行高：48px
```

#### 物流时间线 (Logistics Timeline)
```
垂直连线 + 彩色节点：
- 活跃节点：primary fill + canvas 描边环
- 已完成节点：success fill
- 待处理节点：hairline 描边

每个节点显示：状态文字·时间戳·位置
活跃节点添加微妙的脉冲动画
```

#### Toast 通知
```
- 圆角：md 10px
- 内边距：12px 16px
- 白色文字
- 成功：success 背景
- 错误：error 背景
- 动画：从顶部（移动端）/ 右上角（桌面端）滑入
```

---

### 2.7 标志性组件 (Signature Components)

#### Price Stack（价格栈）— 最高优先级组件
```
产品卡片中的价格展示：
1. 原价删除线：ink-mute / body-sm（~~Rp 450,000~~）
2. 当前价格：price-lg / ink（Rp 180,000）
3. CNY 参考价：body-sm / ink-mute（CNY ≈ ¥45）
4. 节省标签：badge-save（-67% vs Shopee）
```

#### Comparison Bar（比价条）
```
pricing-compare-card：
[Shopee 价格] — [节省 XX% 标签] — [AceProxy 价格]
这是核心转化驱动组件，必须在每个产品详情页出现
```

#### Consolidation Status（集运状态）
```
水平进度条：
"10 件中 7 件已到仓 · 3.2kg · 已省 ¥58 运费
再加 ¥12 解锁 ¥9/kg 费率"
```

---

## 三、信息架构与页面层级 (Information Architecture)

### 3.1 完整站点地图

```
AceProxy Platform
│
├── Track 1：消费者商城 (Consumer Marketplace)
│   ├── / (首页·产品发现)
│   │   ├── Hero Banner（促销+节日横幅）
│   │   ├── 分类导航 Pills
│   │   ├── 搜索栏
│   │   ├── 限时秒杀区 (Flash Sale)
│   │   ├── Hero Products 精选
│   │   └── 产品网格（无限滚动）
│   │
│   ├── /products/[id] (产品详情)
│   │   ├── 图片轮播 (3:4 比例)
│   │   ├── Price Stack（价格栈）
│   │   ├── Comparison Bar（比价条）
│   │   ├── SKU 选择器（颜色/尺码）
│   │   ├── AI 尺码建议
│   │   ├── Trust Cards（4项保障）
│   │   ├── 物流时间线预览
│   │   └── CTA：加入购物车 / 立即购买
│   │
│   ├── /cart (购物车)
│   │   ├── 商品列表 + 数量调整
│   │   ├── 价格汇总（含运费预估）
│   │   ├── 集运合并提示
│   │   └── 结算按钮
│   │
│   ├── /checkout (结账)
│   │   ├── 收货地址
│   │   ├── 物流线路选择
│   │   ├── 支付方式（Xendit/PayPal/Stripe）
│   │   ├── 订单摘要
│   │   └── 支付确认
│   │
│   ├── /orders (我的订单)
│   │   ├── 订单列表（状态筛选）
│   │   ├── 物流追踪（15节点时间线）
│   │   ├── 集运状态（Consolidation Status）
│   │   └── POD 签收照片
│   │
│   ├── /profile (个人中心)
│   │   ├── 钱包余额 (Vault)
│   │   ├── 订单历史
│   │   ├── 反馈与评价
│   │   └── 设置
│   │
│   ├── /partner (团长工作台)
│   │   ├── 母包签收扫码
│   │   ├── 子单分拨列表
│   │   ├── 核销验证
│   │   ├── 收益面板
│   │   └── 车队管理（V2+）
│   │
│   ├── /resale (本地转让市场)
│   │   ├── 可转卖商品列表
│   │   ├── 发布转卖
│   │   └── 撮合交易
│   │
│   └── /onboarding (新手引导)
│       ├── 功能介绍（3步引导）
│       ├── AI 套利助手演示
│       └── 首单优惠
│
├── Track 2：管理后台指挥中心 (Admin Command Center)
│   ├── /admin/dashboard (BI 指挥看板)
│   │   ├── 全球实时订单数
│   │   ├── 物流载荷指标
│   │   ├── 毛利走势图
│   │   ├── 风险熔断预警灯
│   │   └── 资金回流进度
│   │
│   ├── /admin/products (商品管理 CMS)
│   │   ├── 产品列表（上架/下架/售罄）
│   │   ├── AI 自动推品队列（一键发布）
│   │   ├── 手动录入表单
│   │   ├── 移动端预览模拟
│   │   └── 价格动态调整
│   │
│   ├── /admin/orders (订单管理)
│   │   ├── 订单列表（全状态筛选）
│   │   ├── 拆单管理 (SmartSplitter)
│   │   ├── 物流线路分配
│   │   └── 异常订单处理
│   │
│   ├── /admin/suppliers (供应商管理)
│   │   ├── 评分卡 (LTC/QC/Resale)
│   │   ├── 黑名单管理
│   │   └── 1688 货源绑定
│   │
│   ├── /admin/warehouse (仓库管理)
│   │   ├── 入库扫码
│   │   ├── VisionQC 质检墙
│   │   ├── 真空压缩工作台
│   │   ├── 集运合并看板
│   │   └── 3-Photo POD 证据链
│   │
│   ├── /admin/finance (财务管理)
│   │   ├── 复式记账总览
│   │   ├── 5% 资损熔断器
│   │   ├── 离岸账户追踪
│   │   ├── 团长佣金结算
│   │   └── 汇率保护垫配置
│   │
│   ├── /admin/holiday (节日管理)
│   │   ├── 节日 UI 方案预览
│   │   ├── 方案确认/切换
│   │   └── 备货提醒阈值设置
│   │
│   ├── /admin/partners (团长管理)
│   │   ├── 团长列表（等级筛选）
│   │   ├── 保证金管理
│   │   ├── 违规处罚矩阵
│   │   └── 神秘顾客分配
│   │
│   ├── /admin/ai-sentinel (AI 哨兵)
│   │   ├── DTC 爆款截流面板
│   │   ├── 专利风险审计
│   │   ├── 1688 价格监控
│   │   └── AIGC 内容生成队列
│   │
│   └── /admin/settings (系统设置)
│       ├── 全球动态调价配置
│       ├── 语言/地区设置
│       ├── 物流线路管理
│       └── HS Code 合规字典
│
└── 全局组件
    ├── Toast 通知系统
    ├── AI 客服聊天窗口
    ├── 国家/语言切换器
    └── 加载骨架屏
```

### 3.2 页面导航层级

```
消费者导航流 (Consumer):
Home → Search/Category → Product Detail → Cart → Checkout → Orders → Profile
Home → Partner Dashboard (团长模式切换)
Profile → Resale Hub → C2C 撮合
Orders → Logistics Timeline → POD 签收

管理后台导航流 (Admin):
Dashboard → Products/Orders/Suppliers/Warehouse/Finance/Holiday/Partners/AI-Sentinel/Settings
Dashboard → BI 预警 → 订单详情（下钻）
Products → AI Push Queue → 预览 → 一键发布
Orders → 拆单 → 物流分配
Warehouse → VisionQC → 真空压缩 → 3-Photo POD
```

---

## 四、页面高层级设计 (High-Fidelity Page Specs)

### 4.1 消费者商城首页 `\`

**布局**：
```
┌──────────────────────────────────────┐
│  [Nav Bar: Logo | Search | 🔔 🛒]   │ ← 固定顶部 56px
├──────────────────────────────────────┤
│  Hero Banner (节日促销)              │ ← 全宽 320px，渐变底 + 大标题
│  [CTA: Shop Eid Collection →]        │
├──────────────────────────────────────┤
│  Category Pills (水平滚动)          │ ← 10个分类 pill
│  [All] [Muslim Fashion] [Home] ...  │
├──────────────────────────────────────┤
│  Flash Sale Section                 │
│  ⏰ 限时秒杀 · 剩余 02:14:35        │
│  [Product×5 横向滚动卡片]           │
├──────────────────────────────────────┤
│  Hero Products Grid (3-4列)         │
│  [Product Card]×N                   │ ← 无限滚动加载
│  (每卡包含 Price Stack)             │
└──────────────────────────────────────┘
│  [Bottom Nav: Home Discover Cart..] │ ← 仅移动端
└──────────────────────────────────────┘
```

**响应式**：
- 移动端 (<768px)：1列产品、搜索栏隐藏、底部导航
- 平板 (768-1023px)：2列产品
- 桌面 (1024-1440px)：3-4列产品、顶部搜索栏展开
- 宽屏 (≥1440px)：4-5列产品、最大宽度 1400px 居中

---

### 4.2 产品详情页 `/products/[id]`

**布局**：
```
┌──────────────────────────────────────┐
│  ← Back | Product Detail | 🛒 Cart  │
├──────────────────────────────────────┤
│  ┌────────────┐                      │
│  │ 图片轮播   │  Product Name       │
│  │ (3:4比例)  │  Brand · caption    │
│  │            │                      │
│  │ ● ○ ○ ○   │  Price Stack        │
│  │ 缩略图导航 │  ~~Rp 450,000~~     │
│  └────────────┘  Rp 180,000         │
│                  CNY ≈ ¥45          │
│                  [-67% vs Shopee]    │
│                                     │
│  Comparison Bar                     │
│  [Shopee Rp 450K] → [Save 60%] → [AceProxy Rp 180K] │
│                                     │
│  SKU Selector                       │
│  Color: [Red] [Blue] [Black]       │
│  Size:  [S] [M] [L] [XL]          │
│  📏 AI 建议：此款偏小，选大一码     │
│                                     │
│  Trust Cards (4列)                  │
│  [源头直采] [仓库实拍] [破损包赔] [物流追踪] │
│                                     │
│  Quantity: [-] 1 [+]               │
│  [Add to Cart] [Buy Now →]         │ ← 底部固定（移动端）
└──────────────────────────────────────┘
```

---

### 4.3 购物车 `/cart`

**布局**：
```
┌──────────────────────────────────────┐
│  ← Back | Shopping Cart (3 items)   │
├──────────────────────────────────────┤
│  Cart Items:                        │
│  ┌──────────────────────────────┐   │
│  │ [IMG] Product Name           │   │
│  │       Color: Red, Size: M    │   │
│  │       [-] 1 [+]  ·  Rp 180K  │   │
│  │       Remove                  │   │
│  └──────────────────────────────┘   │
│  ... (repeat for each item)         │
│                                     │
│  Consolidation Tip:                 │
│  "加 ¥12 运费即可解锁 ¥9/kg 优惠"   │
│                                     │
│  Order Summary:                     │
│  Subtotal:          Rp 540,000      │
│  Est. Shipping:     Rp  85,000      │
│  Service Fee:       Rp  18,000      │
│  ─────────────────────────────      │
│  Total:             Rp 643,000      │
│  Save vs Shopee:    Rp 710,000      │
│                                     │
│  [Proceed to Checkout →]            │
└──────────────────────────────────────┘
```

---

### 4.4 管理后台 BI 看板 `/admin/dashboard`

**布局**：
```
┌──────┬───────────────────────────────────────┐
│ Logo │ Dashboard / Admin Command Center     │
│      ├───────────────────────────────────────┤
│ 导航  │ KPI Row (3-4 cards):                 │
│      │ [今日订单 847] [物流载荷 2.3t]        │
│      │ [毛利 ¥12,450] [在途资金 ¥89K]       │
│      ├───────────────────────────────────────┤
│ 📊   │ 毛利走势图 (7天)        │ 区域分布饼图│
│ Dash │                         │              │
│      ├───────────────────────────────────────┤
│ 📦   │ 风险熔断预警灯:                       │
│ Prod │ ● 拒付率 0.3% (安全)                  │
│      │ ● 报关异常 1例 (关注)                 │
│ 📋   ├───────────────────────────────────────┤
│ Ord  │ 最近订单表格:                         │
│      │ ID | 用户 | 金额 | 状态 | 操作        │
│ 🏭   │ ... (20 rows per page)               │
│ Supp │                                         │
│      ├───────────────────────────────────────┤
│ 📬   │ 资金回流进度:                         │
│ WH   │ 离岸 ¥32K → 结汇中 ¥45K → 已结算 ¥12K│
│      │ [████████░░░░░░░░] 62%               │
│ 💰   │                                       │
│ Fin  │                                       │
│      │                                       │
│ 🎉   │                                       │
│ Holi │                                       │
│      │                                       │
│ 👥   │                                       │
│ Part │                                       │
│      │                                       │
│ 🤖   │                                       │
│ AI   │                                       │
│      │                                       │
│ ⚙️   │                                       │
│ Set  │                                       │
└──────┴───────────────────────────────────────┘
```

---

## 五、用户交互流程 (User Flows)

### 5.1 核心购买流程（Happy Path）

```
[首页] → 搜索/浏览 → [产品详情] → 选择SKU → [加入购物车]
    → [购物车] → 合并提示 → [结账]
    → 填写地址 → 选择物流 → [支付]
    → 支付确认 → [订单确认页]
    → [我的订单] → 追踪物流 → [POD签收]
```

### 5.2 团长协作流程

```
[用户下单] → [仓库收货·QC] → [真空压缩]
    → [集运合并] → [国际运输]
    → [团长签收母包] → [扫码入库]
    → [子单分拨] → [通知用户自提]
    → [用户到站·核销] → [POD拍照]
    → [订单完成·佣金结算]
```

### 5.3 AI 套利助手流程

```
[用户粘贴 1688/Shopee 链接]
    → AI 指纹识别 → 1688 同款匹配
    → 生成比价页 → 显示节省金额
    → 用户下单 → AI 自动翻译 SKU
    → AI 自动议价 → 提交采购
```

### 5.4 异常处理流程

```
[VisionQC 发现瑕疵]
    → AI 判定严重度
    → 轻微：发送"瑕疵告知"给用户 → 用户确认接受/拒收
    → 严重：自动拦截 → 触发 1688 售后 → 通知用户
    → < $5 纠纷：AI 自动秒赔 → Vault 余额返还
    → > $5 纠纷：人工介入
```

---

## 六、Figma 文件结构建议

### 建议的 Figma 页面结构

```
📄 Cover Page（封面）
📄 Design Tokens（设计令牌）
   ├── Colors
   ├── Typography
   ├── Spacing
   ├── Elevation
   └── Border Radius

📄 Component Library（组件库）
   ├── Buttons (5 variants × 8 states)
   ├── Cards (5 variants)
   ├── Inputs & Forms
   ├── Navigation (3 variants)
   ├── Tags & Badges (8 variants)
   ├── Tables (admin)
   ├── Timeline (logistics)
   ├── Toast
   ├── Price Stack
   └── Comparison Bar

📄 Consumer Pages（消费者页面 - 高保真）
   ├── 01-Home (Desktop / Tablet / Mobile)
   ├── 02-Product-Detail (Desktop / Mobile)
   ├── 03-Cart (Desktop / Mobile)
   ├── 04-Checkout
   ├── 05-Orders & Tracking
   ├── 06-Profile
   ├── 07-Partner-Dashboard
   ├── 08-Resale-Hub
   └── 09-Onboarding

📄 Admin Pages（管理后台页面）
   ├── 01-Dashboard-BI
   ├── 02-Product-CMS
   ├── 03-Order-Management
   ├── 04-Supplier-Scorecard
   ├── 05-Warehouse-WMS
   ├── 06-Finance-Ledger
   ├── 07-Holiday-Admin
   ├── 08-Partner-Management
   ├── 09-AI-Sentinel
   └── 10-Settings

📄 User Flows（交互流程）
   ├── Flow-01-Purchase-Happy-Path
   ├── Flow-02-Partner-Collaboration
   ├── Flow-03-AI-ArbiBot
   ├── Flow-04-Exception-Handling
   └── Flow-05-Onboarding

📄 Prototypes（交互原型连线）
   ├── Consumer-Prototype (所有消费者页面连线)
   └── Admin-Prototype (所有管理后台页面连线)

📄 Handoff Notes（开发交付说明）
   ├── Component API
   ├── Animation Specs
   ├── Responsive Breakpoints
   └── Accessibility Checklist
```

---

## 七、响应式策略速查

| 断点 | 宽度 | 产品列数 | 导航 | 特殊行为 |
|------|------|---------|------|---------|
| Mobile | <768px | 1列 | 底部 Tab | 搜索全屏展开、购物车底部面板 |
| Tablet | 768-1023px | 2列 | 顶部导航 | 侧边栏 64px 仅图标 |
| Desktop | 1024-1440px | 3-4列 | 顶部导航 | 完整侧边栏 240px |
| Wide | ≥1440px | 4-5列 | 顶部导航 | 内容最大宽度 1400px |

---

## 八、动效规范 (Motion Specs)

| 场景 | 时长 | 缓动 | 说明 |
|------|------|------|------|
| 按钮点击 | 100ms | ease-out-expo | 颜色/缩放反馈 |
| 卡片 hover | 200ms | ease-out-quart | 边框变色 + 阴影浮现 |
| 菜单展开 | 250ms | ease-out-quart | 下拉菜单/侧边栏 |
| 弹窗出现 | 300ms | ease-out-quart | Modal/Dialog |
| 页面入场 | 400ms | ease-out-expo | 路由切换 |
| Hero 揭示 | 600ms | ease-out-quart | 首页加载动画 |
| Toast 滑入 | 300ms | ease-out-expo | 通知出现 |
| Toast 消失 | 200ms | ease-in | 通知退出（更短） |
| 骨架屏 | 1.5s | ease-in-out | 脉冲动画循环 |

**必须遵守**：
- 所有动画使用 `transform` 和 `opacity`，不动 `width/height`
- 支持 `prefers-reduced-motion`：降级为淡入淡出
- 不使用 bounce/elastic 缓动
- 物流时间线活跃节点：微妙脉冲（scale 1→1.05→1）

---

## 九、可访问性清单 (Accessibility)

- [ ] 所有文本对比度 ≥ 4.5:1（正文）/ 3:1（大标题）
- [ ] 所有交互元素触控目标 ≥ 44×44px
- [ ] 焦点指示器可见（`:focus-visible` 2px 环）
- [ ] 表单输入框有可见 `<label>`
- [ ] Placeholder 对比度 ≥ 4.5:1
- [ ] 图片有 `alt` 文本
- [ ] 支持 200% 缩放不破坏布局
- [ ] 颜色不单独传达信息（配合图标/文字）
- [ ] 支持 `prefers-reduced-motion`
- [ ] 支持键盘导航（Tab/Enter/Escape/Arrow Keys）
- [ ] 弹窗实现焦点陷阱

---

> **最后更新**：2026-06-26
> **版本**：v2.0 — Figma 就绪
> **作者**：AceProxy 设计系统团队
