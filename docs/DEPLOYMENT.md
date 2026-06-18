# AceProxy — 部署运维手册

> 版本: 1.0 | 最后更新: 2026-06

---

## 1. 环境要求

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 18.x | 20.x LTS | 运行时 |
| PostgreSQL | 14.x | 16.x | 主数据库 |
| Ollama | 0.1.x | latest | AI 推理（可选） |
| Docker | 24.x | latest | 容器化部署（推荐） |
| 内存 | 2 GB | 4 GB+ | 含 Ollama 需 8 GB+ |
| 磁盘 | 5 GB | 20 GB+ | 含 Ollama 模型需额外 10 GB |

---

## 2. 环境变量清单

### 必需配置

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@localhost:5432/aceproxy` |
| `JWT_SECRET` | JWT 签名密钥 | `change-me-in-production-min-32-chars` |
| `PORT` | 服务端口 | `3001` |

### 支付配置（Xendit）

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `XENDIT_API_KEY` | Xendit API Key | `xnd_development_...` |
| `XENDIT_CALLBACK_TOKEN` | Webhook 回调 token | `your-callback-token` |
| `XENDIT_WEBHOOK_SECRET` | Webhook HMAC 密钥 | `whsec_...` |
| `XENDIT_ENV` | 环境 | `sandbox` / `production` |
| `WEBHOOK_BASE_URL` | Webhook 回调地址 | `https://api.aceproxy.id` |

### AI 配置（Ollama）

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `OLLAMA_HOST` | Ollama 地址 | `http://localhost:11434` |
| `OLLAMA_MODEL` | 模型名称 | `qwen2.5:7b` |

### 可选配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `HOST` | 绑定地址 | `0.0.0.0` |
| `DEV_MOCK_ENABLED` | 开发 Mock 模式 | `true` (开发环境) |
| `EXCHANGE_RATE_CNY_IDR` | CNY→IDR 汇率 | `2200` |

---

## 3. 本地开发启动

### 前置条件
```bash
# 1. 安装依赖
cd apps/server
npm install

# 2. 启动 PostgreSQL (Docker)
docker run -d --name pg-aceproxy \
  -e POSTGRES_USER=aceproxy \
  -e POSTGRES_PASSWORD=aceproxy123 \
  -e POSTGRES_DB=aceproxy \
  -p 5432:5432 \
  postgres:16-alpine

# 3. 创建 .env 文件
cp .env.example .env
# 编辑 .env 填入实际配置
```

### 快捷启动
```bash
# Windows
dev.bat

# 或手动
cd apps/server
npx prisma generate   # 生成 Prisma Client
npx prisma migrate dev # 数据库迁移
npx ts-node src/main.ts
```

### 启动后验证
```bash
# API 健康检查
curl http://localhost:3001/api/v1/health

# Swagger 文档
open http://localhost:3001/api/docs

# 产品列表
curl http://localhost:3001/api/v1/product/list?limit=5
```

---

## 4. 生产部署

### 方式一: Docker Compose（推荐）

```bash
# 在项目根目录
docker-compose up -d

# 查看日志
docker-compose logs -f server

# 停止
docker-compose down
```

`docker-compose.yml` 包含:
- PostgreSQL 16 (端口 5432)
- NestJS Server (端口 3001)
- Ollama (端口 11434，可选)

### 方式二: 手动部署

```bash
# 1. 构建
cd apps/server
npm install
npm run build

# 2. 数据库迁移
npx prisma migrate deploy

# 3. 启动 (推荐使用 PM2)
npm install -g pm2
pm2 start dist/main.js --name aceproxy
pm2 save
pm2 startup

# 4. Nginx 反向代理
# 配置 SSL 证书后，将请求代理到 localhost:3001
```

### Nginx 配置示例
```nginx
server {
    listen 443 ssl;
    server_name api.aceproxy.id;

    ssl_certificate /etc/ssl/aceproxy.pem;
    ssl_certificate_key /etc/ssl/aceproxy.key;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. 数据库迁移

```bash
cd apps/server

# 开发环境: 自动迁移
npx prisma migrate dev --name describe_change

# 生产环境: 仅执行迁移
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status

# 重置数据库（⚠️ 会丢失所有数据）
npx prisma migrate reset

# 生成 Prisma Client (schema 变更后)
npx prisma generate

# 浏览数据
npx prisma studio
```

---

## 6. 冒烟测试

```bash
# 运行全部测试
cd apps/server
npx jest --verbose

# 运行特定模块测试
npx jest --verbose -- src/modules/product
npx jest --verbose -- src/modules/payment

# 带覆盖率
npx jest --coverage

# TypeScript 编译检查
npx tsc --noEmit
```

预期输出:
```
Test Suites: 12 passed, 12 total
Tests:       62+ passed, 62+ total
```

---

## 7. 常见故障排查

### 端口占用
```bash
# 检查 3001 端口
netstat -ano | findstr :3001      # Windows
lsof -i :3001                      # macOS/Linux

# 修改端口: .env 中设置 PORT=3002
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 运行状态
docker ps | grep pg-aceproxy

# 测试连接
psql postgresql://aceproxy:aceproxy123@localhost:5432/aceproxy

# 检查 DATABASE_URL 格式
# 正确: postgresql://user:password@host:port/database
```

### Ollama 启动问题
```bash
# 检查 Ollama 服务
curl http://localhost:11434/api/tags

# 拉取模型
ollama pull qwen2.5:7b

# Windows: 确保 Ollama 已安装并运行
# macOS/Linux: ollama serve
```

### Prisma 迁移冲突
```bash
# 重置开发数据库
npx prisma migrate reset

# 强制同步 schema
npx prisma db push

# 手动解决冲突后重新迁移
npx prisma migrate dev --name resolve_conflict
```

### Swagger 不显示
- 确认 `@nestjs/swagger` 已安装: `npm ls @nestjs/swagger`
- 确认 `main.ts` 中 SwaggerModule.setup 在 listen 之前
- 访问: `http://localhost:3001/api/docs` (不是 `/api/v1/docs`)

### 前端 API 调用失败
- 检查 `api-client.js` 中的 `API_BASE` 是否正确
- 开发环境: `http://localhost:3002/api/v1`
- 打开浏览器 DevTools → Network 查看实际请求 URL
- CSP 问题: 确认 CORS 白名单包含前端域名
