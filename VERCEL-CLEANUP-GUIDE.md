# AceProxy Vercel 项目清理指南

> 生成时间：2026-06-01 15:43
> 目的：删除重复项目，只保留 server + web 两个核心入口

---

## 当前状态（8 个项目，7 个指向同一 repo）

| # | 项目名 | Vercel URL | 建议 |
|---|--------|-----------|------|
| 1 | **ace-proxy** | ace-proxy-eight.vercel.app | ❌ 删除 |
| 2 | **ace-proxy-web** | ace-proxy-web.vercel.app | ✅ **保留（前端）** |
| 3 | ace-proxy-web2 | ace-proxy-web2.vercel.app | ❌ 删除 |
| 4 | ace-proxy-web1 | ace-proxy-web1.vercel.app | ❌ 删除 |
| 5 | dai_应用 (daigouapp) | daigouapp.vercel.app | ❌ 删除 |
| 6 | ace-proxy-web-1 | ace-proxy-web-1.vercel.app | ❌ 删除 |
| 7 | **ace-proxy-server** | ace-proxy-server.vercel.app | ✅ **保留（后端）** |
| 8 | xua__ing (xuanzenge) | xuanzenge-landing.vercel.app | ⚪ 不动（独立项目） |

---

## 清理步骤（预计 5 分钟）

### Step 1：等构建完成
刷新 Vercel Dashboard，确认所有项目的最新部署状态：
- ✅ Ready = 成功
- ❌ Error / Cancelled = 失败
- ⏳ Building = 还在跑

### Step 2：确认保留的两个项目配置

进入每个保留项目 → **Settings → General**：

**ace-proxy-web（前端）：**
- Framework Preset：Next.js
- Root Directory：`apps/web`
- Build Command：`next build`
- Output Directory：`.next`

**ace-proxy-server（后端）：**
- Framework Preset：NestJS
- Root Directory：`apps/server`
- Build Command：`npm run build` 或 `nest build`
- Output Directory：`dist`

### Step 3：删除 5 个重复项目

对每个要删的项目：
1. 点击项目卡片右上角 `...` 菜单
2. 选择 **Settings**（设置）
3. 滚动到最底部 → **Delete Project**（删除项目）
4. 输入项目名称确认删除

**删除顺序（无特殊要求）：**
1. ~~ace-proxy~~
2. ~~ace-proxy-web1~~
3. ~~ace-proxy-web2~~
4. ~~ace-proxy-web-1~~
5. ~~dai_应用~~

### Step 4：配置环境变量（关键！）

对 **ace-proxy-server** 项目：
1. Settings → Environment Variables
2. 添加以下变量：

```
DATABASE_URL = postgres://[user]:[password]@db.djakyexhqywzlxhhwbpz.supabase.co:5432/postgres
SUPABASE_URL = https://djakyexhqywzlxhhwbpz.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY = [service_role key from Supabase Dashboard]
JWT_SECRET = [generate a random string]
NODE_ENV = production
```

对 **ace-proxy-web** 项目：
```
NEXT_PUBLIC_API_URL = https://ace-proxy-server.vercel.app/api
NEXT_PUBLIC_SUPABASE_URL = https://djakyexhqywzlxhhwbpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [same anon key]
```

### Step 5：重新触发构建

配置完环境变量后：
1. 进入每个项目的 **Deployments** 页面
2. 点击最新部署右边的 `...` → **Redeploy**
3. 等待构建完成

### Step 6：验证上线

打开浏览器测试：
- 前端：https://ace-proxy-web.vercel.app
- 后端 API：https://ace-proxy-server.vercel.app/api/health（或对应路由）

---

## 清理后的最终架构

```
GitHub: 001011001/ace-proxy (monorepo)
├── apps/web     → ace-proxy-web.vercel.app      (Next.js 前端)
├── apps/server  → ace-proxy-server.vercel.app   (NestJS 后端)
└── apps/mobile  → (暂不部署)
```

---

## 注意事项

⚠️ 删除前确认：该项目没有自定义域名绑定
⚠️ 删除前确认：该项目没有生产流量在用
⚠️ 如果某个 "废弃" 项目反而构建成功了而保留的失败了，可以先交换
⚠️ Supabase 数据库建表需要老板在有外网的环境下执行 SQL（见 sql-init.sql）
