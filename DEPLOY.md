# AceProxy 生产部署

## 快速部署（三选一）

### 方案 A：Docker 部署（推荐，任何 VPS）

```bash
cd apps/server

# 复制环境变量模板
cp .env.example .env
# 编辑 .env — 填入 XENDIT_API_KEY 等真实值

# 构建并启动
docker compose up -d --build

# 验证
curl http://localhost:3001/api/v1/health
```

### 方案 B：PM2 部署（已有 Node.js 的 VPS）

```bash
cd apps/server

npm ci
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
npm run seed || npx ts-node prisma/seed.ts

# PM2 启动
npm install -g pm2
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

### 方案 C：Railway / Render 一键部署

Railway：连接 GitHub → 设置 Root Directory 为 `apps/server` → 部署
Render：新建 Web Service → Build: `npm ci && npx prisma generate && npm run build` → Start: `node dist/main.js`

---

## 部署后修改前端 API 地址

编辑 `deploy/index.html`，找到 `API_BASE`：

```javascript
const API_BASE = 'https://你的服务器IP:3001/api/v1'; // 改这里
```

然后重新部署前端到 CloudStudio。

---

## 环境变量清单

| 变量 | 必填 | 说明 |
|------|:--:|------|
| `JWT_SECRET` | ✅ | 随机字符串 |
| `XENDIT_API_KEY` | KYC后填 | Xendit Secret Key |
| `XENDIT_CALLBACK_TOKEN` | KYC后填 | Webhook 验证 Token |
| `ALIBABA_APP_KEY` | 选填 | 1688 API Key |
| `ALIBABA_APP_SECRET` | 选填 | 1688 API Secret |
| `OLLAMA_URL` | 选填 | AI 翻译/客服需要 |

---

## 健康检查

```bash
# 基本
curl http://your-server:3001/api/v1/health

# 运费估算
curl "http://your-server:3001/api/v1/shipping/estimate?country=ID&weightKg=0.5"

# 产品列表
curl "http://your-server:3001/api/v1/product/list"
```
