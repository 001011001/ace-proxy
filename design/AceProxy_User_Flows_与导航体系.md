# AceProxy 用户交互流程 & 导航体系

> 本文件定义 AceProxy 双轨制平台的全部用户旅程、页面导航逻辑和交互流程图。
> 可直接导入 Figma 创建交互原型连线 (Prototype Connections)。

---

## 一、全局导航体系 (Global Navigation Architecture)

### 1.1 双轨制设计

```
                    ┌─────────────────────────────────┐
                    │       AceProxy Platform          │
                    └──────────────┬──────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
    ┌─────────▼──────────┐                  ┌──────────▼─────────┐
    │ Track 1: Consumer   │                  │ Track 2: Admin      │
    │ Marketplace         │                  │ Command Center      │
    │ (Mobile-First)      │                  │ (Desktop-First)      │
    │ Language: ID / TH    │                  │ Language: 简体中文    │
    └─────────┬──────────┘                  └──────────┬─────────┘
              │                                         │
    ┌─────────▼──────────┐                  ┌──────────▼─────────┐
    │ Identity Morphing:  │                  │                    │
    │ 用户 ↔ 团长 ↔ 骑手   │                  │ 管理员唯一身份       │
    │ (根据GPS+权限自动切) │                  │                    │
    └────────────────────┘                  └────────────────────┘
```

### 1.2 消费者导航结构

```
Home (首页·产品发现)
├── Search Bar → Search Results
├── Category Pills → Category Page
├── Flash Sale Section → Flash Sale Page
├── Product Card → Product Detail (/products/:id)
│   ├── SKU Selector (Color/Size)
│   ├── AI Size Assistant
│   ├── Comparison Bar
│   ├── Trust Cards
│   └── [Add to Cart] / [Buy Now]
│       ├── Cart (/cart)
│       │   ├── Quantity Adjust
│       │   ├── Consolidation Tip
│       │   └── [Proceed to Checkout]
│       │       └── Checkout (/checkout)
│       │           ├── Address Form
│       │           ├── Shipping Method
│       │           ├── Payment (Xendit/PayPal)
│       │           └── [Confirm Order]
│       │               └── Order Confirmed
│       └── [Buy Now] → Checkout (skip cart)
│
├── Orders (/orders)
│   ├── Order List (All/Processing/Shipping/Delivered)
│   ├── Order Detail
│   │   ├── Logistics Timeline (15 nodes)
│   │   ├── Consolidation Status
│   │   ├── Warehouse Photos (3-POD)
│   │   └── POD Sign-off Photo
│   └── Resale Hub (if QC rejected)
│       └── C2C Listing
│
├── Profile (/profile)
│   ├── Vault Balance
│   ├── Order History
│   ├── Feedback & Reviews
│   └── Settings
│
├── Partner Dashboard (/partner) — 团长模式
│   ├── Master Parcel Scan
│   ├── Sub-Parcel Sort
│   ├── Verification (QR scan)
│   ├── Earnings Panel
│   └── Fleet Management (V2+)
│
├── Resale Hub (/resale)
│   ├── Available Listings
│   ├── Create Listing
│   └── Transaction History
│
├── Onboarding (/onboarding)
│   ├── Step 1: What is AceProxy
│   ├── Step 2: How Sourcing Works
│   └── Step 3: First Order Bonus
│
└── AI Chat (Floating Button)
    └── ArbiBot Assistant
        ├── Paste Link → Price Compare
        ├── Product Inquiry
        └── Order Status Query
```

### 1.3 管理后台导航结构

```
Admin Dashboard (/admin)
├── BI 指挥看板
│   ├── KPI Cards (订单/物流/毛利/资金)
│   ├── 毛利走势图
│   ├── 区域分布饼图
│   ├── 风险熔断预警灯
│   ├── 集运状态进度条
│   ├── 最近订单表格
│   └── 资金回流进度
│
├── 商品管理 CMS
│   ├── 商品列表 (上架/下架/售罄)
│   ├── AI 自动推品队列
│   │   └── [一键发布]
│   ├── 手动录入表单
│   ├── 移动端预览 (Neo-Brutalism 模拟)
│   └── 价格动态调整
│
├── 订单管理
│   ├── 订单列表 (全状态筛选)
│   ├── 订单详情
│   ├── 拆单管理 (SmartSplitter)
│   ├── 物流线路分配
│   └── 异常订单处理
│
├── 供应商管理
│   ├── 供应商列表
│   ├── 评分卡 (LTC/QC Reject/Resale Rate)
│   ├── 黑名单管理
│   └── 1688 货源绑定
│
├── 仓库管理
│   ├── 入库扫码
│   ├── VisionQC 质检墙
│   │   └── AI 比对结果 (通过/拦截)
│   ├── 真空压缩工作台
│   └── 集运合并看板
│
├── 财务管理
│   ├── 复式记账总览
│   ├── 5% 资损熔断器
│   ├── 离岸账户追踪
│   ├── 团长佣金结算
│   └── 汇率保护垫配置
│
├── 节日管理
│   ├── UI 方案预览 (2-3 套)
│   ├── [确认使用] 激活
│   └── 备货提醒阈值
│
├── 团长管理
│   ├── 团长列表 (等级筛选)
│   ├── 保证金管理
│   ├── 违规处罚矩阵
│   └── 神秘顾客分配
│
├── AI 哨兵
│   ├── DTC 爆款截流面板
│   ├── 专利风险审计
│   ├── 1688 价格监控
│   └── AIGC 内容生成队列
│
└── 系统设置
    ├── 全球动态调价配置
    ├── 语言/地区设置
    ├── 物流线路管理
    └── HS Code 合规字典
```

---

## 二、核心用户交互流程 (User Flows)

### 2.1 主购买流程 (Happy Path)

```
START: 用户进入首页
  │
  ├─ [浏览产品网格] ─────────────────────────────────┐
  │   └─ 向下滚动 → 加载更多 (无限滚动)               │
  │                                                    │
  ├─ [搜索关键词]                                      │
  │   └─ 输入 "hijab" → 300ms 防抖 → API 查询          │
  │       └─ 搜索结果页 (带分类筛选)                   │
  │                                                    │
  ├─ [点击分类 Pill]                                   │
  │   └─ "Muslim Fashion" → 分类产品页                 │
  │       └─ 排序：价格/新品/销量                       │
  │                                                    │
  └─ [点击产品卡片] ─────────────────────────────────┘
      │
      ▼
  产品详情页 (/products/:id)
      │
      ├─ [浏览图片轮播] ← 左右滑动 (移动端) / 点击缩略图
      ├─ [查看 Price Stack] → 价格比较信息
      ├─ [查看 Comparison Bar] → Shopee vs AceProxy
      ├─ [选择 SKU]
      │   ├─ Color: Dusty Rose / Sage Green / Ivory
      │   └─ Size: Standard / Plus
      ├─ [阅读 AI Size Tip] → 尺码建议
      ├─ [调整数量] → Qty: 1 → N
      │
      ├─ [Add to Cart] ──────────────────────┐
      │   └─ Toast: "已加入购物车"            │
      │   └─ 继续浏览                        │
      │                                       │
      └─ [Buy Now] ─────────────────────────┐│
          │                                  ││
          ▼                                  ││
      购物车 (/cart) ◄────────────────────────┘│
          │                                    │
          ├─ [修改数量] ±                       │
          ├─ [删除商品] → 确认: Undo (5s)       │
          ├─ [查看集运提示]                     │
          │   └─ "再加 ¥12 解锁 ¥9/kg"         │
          ├─ [查看价格汇总]                     │
          │   ├─ Subtotal                      │
          │   ├─ Est. Shipping                 │
          │   ├─ Service Fee                   │
          │   └─ Total                         │
          │                                    │
          └─ [Proceed to Checkout]            │
              │                                │
              ▼                                │
          结账页 (/checkout)                    │
              │                                │
              ├─ [填写收货地址]                  │
              │   └─ GPS 自动定位 + 手动输入    │
              ├─ [选择物流线路]                  │
              │   ├─ 空运专线 (5-7天)           │
              │   ├─ 海运拼箱 (15-20天)         │
              │   └─ 智能推荐 (默认)            │
              ├─ [选择支付方式]                  │
              │   ├─ Xendit (印尼)              │
              │   ├─ PayPal / Stripe            │
              │   └─ Wallet Balance             │
              ├─ [确认订单摘要]                  │
              │                                │
              └─ [Confirm & Pay]               │
                  │                            │
                  ▼                            │
              支付确认页                        │
                  │                            │
                  ├─ ✅ 支付成功                │
                  │   └─ 显示订单号             │
                  │   └─ 预计到仓时间           │
                  │                            │
                  └─ ❌ 支付失败                │
                      └─ 重试 / 换支付方式      │
                          │                    │
                          ▼                    │
                      我的订单 (/orders)        │
                          │                    │
                          ├─ [查看物流]         │
                          │   └─ 15节点时间线   │
                          │       ├─ 1688 下单  │
                          │       ├─ 卖家发货   │
                          │       ├─ 深圳仓入库 │
                          │       ├─ VisionQC   │
                          │       ├─ 真空压缩   │
                          │       ├─ 集运合并   │
                          │       ├─ 国际运输   │
                          │       ├─ 海关清关   │
                          │       ├─ 团长签收   │
                          │       └─ POD 签收   │
                          │                    │
                          └─ [查看 QC 照片]     │
                              └─ 3-POD 证据链   │

END: 收货确认 + TikTok 晒单返现
```

---

### 2.2 AI 套利助手流程 (ArbiBot)

```
START: 用户点击浮动 AI 按钮
  │
  ▼
ArbiBot 对话界面
  │
  ├─ [粘贴链接模式]
  │   └─ 用户粘贴 Shopee/Amazon/1688 链接
  │       │
  │       ▼
  │   AI 指纹识别 (3s内完成)
  │       │
  │       ├─ [找到匹配] ✅
  │       │   └─ 显示比价卡片
  │       │       ├─ 原平台价格
  │       │       ├─ AceProxy 全包价
  │       │       ├─ 节省金额/百分比
  │       │       └─ [一键下单] → 产品详情页
  │       │
  │       └─ [未找到] ❌
  │           └─ "暂未找到同款，已加入监控队列"
  │           └─ 哨兵后台持续监听
  │
  ├─ [智能议价模式]
  │   └─ AI 根据 1688 阶梯价引导
  │       └─ "买 3 件享批发价 ¥8.5/件 (单买 ¥12)"
  │       └─ 用户确认 → 自动下单
  │
  └─ [客服沟通模式]
      └─ 用户 → AI 翻译 → 1688 卖家
      └─ AI 自动翻译印尼语 ↔ 中文
      └─ 支持语音转文字
```

---

### 2.3 团长协作流程 (Partner Collaboration)

```
START: 母包到达雅加达团长站点
  │
  ▼
团长 App 扫码入库
  │
  └─ [扫描母包面单] → 系统识别 + 加载子包裹列表
      │
      ▼
  子单分拨 (App 指导)
      │
      └─ 按用户名/订单号分类摆放
          │
          ▼
      系统自动推送通知给用户
          │
          ├─ WhatsApp 通知
          ├─ App Push
          └─ 短信 (备选)
              │
              ▼
          用户到站自提
              │
              ├─ 团长扫描用户离线核销码 (JWT)
              │   └─ 系统自动扣减库存
              │
              ├─ [拍照核销] → POD 照片上传
              │   └─ GPS 坐标比对 (>500m = 异常)
              │
              └─ 订单完成
                  │
                  ▼
              佣金自动结算到团长钱包
```

---

### 2.4 异常处理流程 (Exception Handling)

```
START: VisionQC 检测到异常
  │
  ├─ [轻微瑕疵] (色差 ΔE < 5.0)
  │   └─ 系统通知用户 → 附带瑕疵照片
  │       ├─ [用户接受] → 继续发货
  │       └─ [用户拒绝] → 进入 Resale Hub
  │
  ├─ [严重瑕疵] (破损/划痕)
  │   └─ AI 自动拦截
  │       └─ 触发 1688 售后
  │       └─ 通知用户选择:
  │           ├─ [等待换货] → 重新采购
  │           ├─ [退款] → Vault 余额返还
  │           └─ [转卖] → Resale Hub
  │
  ├─ [小额纠纷] (< $5)
  │   └─ AI 自动核对 VisionQC 图片
  │       └─ [匹配] → 自动秒赔
  │       └─ [不匹配] → 升级人工
  │
  └─ [大额纠纷] (> $5)
      └─ 人工介入
          └─ 客服查看 VisionQC 证据链
          └─ 做出裁决
```

---

## 三、Figma 交互原型连线指南

### 3.1 消费者原型连线

在 Figma 中设置以下连线：

```
[Home Page]
  ├─ Product Card tap → [Product Detail]
  ├─ Category Pill tap → [Category Page]
  ├─ Search Bar focus → [Search Overlay]
  ├─ Cart Icon tap → [Cart Page]
  └─ Bottom Nav "Orders" → [Orders Page]

[Product Detail]
  ├─ "Add to Cart" tap → Cart Page + Toast "Added"
  ├─ "Buy Now" tap → Checkout Page
  ├─ Thumbnail tap → Main Image Swap (Smart Animate)
  ├─ SKU Option tap → Active State (Instant)
  └─ "← Back" tap → Previous Page

[Cart Page]
  ├─ "Proceed to Checkout" → Checkout Page
  ├─ Quantity "+" / "−" → Instant Update
  ├─ "Remove" tap → Delete + Undo Toast (5s)
  └─ "← Continue Shopping" → Home Page

[Checkout Page]
  ├─ "Confirm & Pay" → Payment Gateway (External)
  └─ Success → Order Confirmed Page

[Orders Page]
  ├─ Order Row tap → Order Detail (with Timeline)
  └─ Timeline Node → Expand Animation (Smart Animate)
```

### 3.2 管理后台原型连线

```
[BI Dashboard]
  ├─ "商品管理" sidebar → Product CMS
  ├─ "订单管理" sidebar → Order Management
  ├─ Order Row "详情" → Order Detail Modal
  └─ "导出报表" button → Download (Action)

[Product CMS]
  ├─ "一键发布" button → Confirm Modal → Publish
  ├─ "手动录入" button → Product Form Page
  └─ Product Row "编辑" → Edit Form

[VisionQC 质检墙]
  ├─ AI Result Card → Detail Comparison Overlay
  ├─ "通过" button → Mark Passed
  └─ "拦截" button → Trigger 1688 Dispute
```

### 3.3 Smart Animate 推荐场景

| 场景 | 动画类型 | 时长 | 说明 |
|------|---------|------|------|
| 产品卡片 → 详情页 | Push (左滑入) | 300ms | 移动端页面转场 |
| 详情页图片切换 | Smart Animate | 250ms | 缩略图切换主图 |
| 购物车数量变化 | Smart Animate | 200ms | 数字变换 + 价格更新 |
| 物流时间线展开 | Smart Animate | 300ms | 节点详情展开 |
| Toast 弹出 | Move In (顶部) | 300ms | 通知滑入 |
| 弹窗出现 | Smart Animate | 250ms | 缩放 + 淡入 |
| Tab 切换 | Smart Animate | 200ms | 内容区切换 |

---

## 四、Figma 文件组织建议

```
📁 AceProxy_Design_System_v2.0.fig
│
├── 📄 00-Cover（封面 + 更新日志）
│
├── 📄 01-Design-Tokens（设计令牌）
│   ├── Color Palette（含 WCAG 对比度标注）
│   ├── Typography Scale（每个 Token 的 Auto Layout 示例）
│   ├── Spacing Scale（可视化间距标尺）
│   ├── Elevation（阴影层级展示）
│   └── Border Radius（圆角对比展示）
│
├── 📄 02-Components（组件库）
│   ├── Buttons（5种 × 8状态 = 40个变体）
│   ├── Cards（5种 × hover/default）
│   ├── Inputs & Search
│   ├── Navigation（3种 × 响应式）
│   ├── Tags & Badges（8种）
│   ├── Tables（Admin）
│   ├── Timeline（物流）
│   ├── Toast & Modals
│   ├── Price Stack（核心）
│   └── Comparison Bar（核心）
│
├── 📄 03-Consumer-Pages（消费者页面 · 高保真）
│   ├── Home-Desktop (1440px)
│   ├── Home-Tablet (768px)
│   ├── Home-Mobile (375px)
│   ├── Product-Detail-Desktop
│   ├── Product-Detail-Mobile
│   ├── Cart-Desktop
│   ├── Cart-Mobile
│   ├── Checkout
│   ├── Orders & Tracking
│   ├── Profile
│   ├── Partner-Dashboard
│   ├── Resale-Hub
│   └── Onboarding (3 screens)
│
├── 📄 04-Admin-Pages（管理后台 · 高保真）
│   ├── BI-Dashboard
│   ├── Product-CMS
│   ├── Order-Management
│   ├── Supplier-Scorecard
│   ├── Warehouse-WMS
│   ├── Finance-Ledger
│   ├── Holiday-Admin
│   ├── Partner-Management
│   ├── AI-Sentinel
│   └── Settings
│
├── 📄 05-Flows（交互流程）
│   ├── Flow-Purchase-Happy-Path
│   ├── Flow-Partner-Collaboration
│   ├── Flow-Exception-Handling
│   └── Flow-Identity-Morphing（身份变形）
│
├── 📄 06-Prototypes（交互原型连线）
│   ├── Consumer-Prototype
│   └── Admin-Prototype
│
└── 📄 07-Handoff（开发交付）
    ├── CSS Variables Export
    ├── Component API Specs
    ├── Responsive Breakpoints Map
    └── Accessibility Checklist
```

---

> **最后更新**：2026-06-26  
> **版本**：v2.0
