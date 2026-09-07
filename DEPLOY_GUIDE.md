# AceProxy 部署上线指南 🚀

## 目录

1. [前置准备：Supabase 数据库](#1-前置准备supabase-数据库)
2. [后端部署：Railway / Render](#2-后端部署railway--render)
3. [前端部署：Vercel](#3-前端部署vercel)
4. [移动端：Expo EAS](#4-移动端expo-eas)
5. [环境变量清单](#5-环境变量清单)
6. [投产检查清单](#6-投产检查清单)

---

## 1. 前置准备：Supabase 数据库

### 1.1 注册 Supabase
1. 访问 [supabase.com](https://supabase.com) 注册（免费额度 500MB）
2. 创建新项目 **aceproxy-prod**
3. 选择 Region：**Southeast Asia (Singapore)** — 目标用户印尼

### 1.2 获取连接字符串
进入项目 → Settings → Database → Connection string

```
# Connection Pooler（应用使用）
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres

# Direct Connection（Prisma 迁移使用）
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### 1.3 更新后端配置
编辑 `apps/server/.env`（或生产环境变量）：

```env
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 1.4 执行数据库迁移
```bash
cd apps/server
npx prisma migrate dev --name init_supabase
npx prisma db seed  # 载入100条商品种子数据
```

---

## 2. 后端部署：Railway / Render

### 方案 A: Railway（推荐，免费额度好）

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化
cd apps/server
railway init

# 设置环境变量（通过 Railway Dashboard 或 CLI）
railway variables set DB_PROVIDER=postgresql
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret"
# ... 其他变量见下方清单

# 部署
railway up
```

### 方案 B: Render (已有配置)

```bash
# 在 Render Dashboard 创建 Web Service
# Build Command: npm install && npx prisma generate && npm run build
# Start Command:  npx prisma migrate deploy && node dist/main.js
# 或使用已有的 Dockerfile 一键部署
```

---

## 3. 前端部署：Vercel

已有 `vercel.json` 配置：

```json
{
  "buildCommand": "cd apps/server && npm install && npx prisma generate && npm run build",
  "outputDirectory": "deploy",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://aceproxy-api.onrender.com/api/:path*" }
  ]
}
```

### 部署步骤

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署 Web Storefront
cd apps/web
vercel --prod
```

### 添加环境变量（Vercel Dashboard）
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 4. 移动端：Expo EAS

```bash
cd apps/mobile
npx eas build --platform all --profile production
```

---

## 5. 环境变量清单

### 后端必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DB_PROVIDER` | 数据库类型 | `postgresql` |
| `DATABASE_URL` | 数据库连接字符串 | Supabase connection pooler URL |
| `DIRECT_URL` | Prisma 迁移直连 URL | Supabase direct URL |
| `JWT_SECRET` | JWT 签名密钥 | 32位随机字符串 |
| `CORS_ORIGINS` | 允许的前端域名 | `https://aceproxy.id` |
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 环境 | `production` |

### 支付集成

| 变量 | 说明 |
|------|------|
| `XENDIT_API_KEY` | Xendit Secret Key |
| `XENDIT_CALLBACK_TOKEN` | Xendit回调验证 |
| `XENDIT_ENV` | `sandbox` 或 `production` |

### 1688 API（可选但推荐）

| 变量 | 说明 |
|------|------|
| `ALIBABA_APP_KEY` | 1688 开放平台 App Key |
| `ALIBABA_APP_SECRET` | 1688 开放平台 App Secret |
| `ALIBABA_ACCESS_TOKEN` | 1688 OAuth Token |

### AI（可选）

| 变量 | 说明 |
|------|------|
| `OLLAMA_URL` | Ollama 本地 AI 地址 |
| `LLM_API_KEY` | 云端 LLM API Key |

---

## 6. 投产检查清单

### 数据库 ✅
- [ ] Supabase 项目已创建
- [ ] 数据库迁移已执行
- [ ] 种子数据已加载
- [ ] RLS 策略已配置（可选）

### 后端 ✅
- [ ] 依赖安装完成
- [ ] Prisma Client 已生成
- [ ] 环境变量全部配置
- [ ] Health Check 端点正常 (`GET /api/v1/health`)
- [ ] CORS 配置正确

### 前端 ✅
- [ ] Next.js build 成功
- [ ] 环境变量已设置
- [ ] API 代理正确指向后端
- [ ] Google OAuth Client ID 已配置
- [ ] 测试 ArbiBot 搜索能正常返回

### 移动端 ✅
- [ ] Expo build 成功
- [ ] API URL 指向生产后端
- [ ] Deep linking 已配置

### 功能验证 ✅
- [ ] 首页加载商品列表
- [ ] 产品详情页正常展示
- [ ] 购物车添加/删除
- [ ] ArbiBot 粘贴链接搜索
- [ ] AI Chat Widget 右下角悬浮
- [ ] 个性化推荐展示
- [ ] 多语言切换 ID/EN/ZH
- [ ] 移动端响应式布局

---

## 快速命令速查

```bash
# 启动本地开发
cd apps/server && npm run start:dev    # 后端 :3001
cd apps/web && npm run dev              # 前端 :3000

# Prisma 操作
npx prisma studio                       # 数据库可视化
npx prisma migrate dev                  # 创建迁移
npx prisma db seed                      # 种子数据
npx prisma generate                     # 重新生成客户端

# 部署
vercel --prod                            # 前端
railway up                               # 后端
```
