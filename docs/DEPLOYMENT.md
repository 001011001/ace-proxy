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
Tests:       58 passed, 58 total
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

---

## 8. 监控告警

### Sentry 错误追踪（推荐）

```bash
# 安装
npm install @sentry/node @sentry/profiling-node

# 在 main.ts 中初始化
# import * as Sentry from '@sentry/node';
# Sentry.init({
#   dsn: process.env.SENTRY_DSN,
#   environment: process.env.NODE_ENV || 'development',
#   tracesSampleRate: 1.0,
#   profilesSampleRate: 0.5,
# });
```

环境变量: `SENTRY_DSN=https://xxx@sentry.io/xxx`

### OpenTelemetry 分布式追踪

```bash
# 安装
npm install @opentelemetry/api @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-otlp-grpc

# 创建 tracing.ts:
# const { NodeSDK } = require('@opentelemetry/sdk-node');
# const sdk = new NodeSDK({
#   traceExporter: new OTLPTraceExporter({ url: 'http://jaeger:4317' }),
#   instrumentations: [getNodeAutoInstrumentations()],
# });
# sdk.start();
```

### 健康检查端点

应用已内置 `/api/v1/health` 端点。生产环境建议使用以下监控配置：

```yaml
# docker-compose.yml — 添加 healthcheck
services:
  server:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

### 关键指标监控清单

| 指标 | 告警阈值 | 说明 |
|------|---------|------|
| API 响应时间 (P95) | > 2000ms | 性能退化 |
| API 错误率 | > 5% | 功能异常 |
| 数据库连接数 | > 80% 池上限 | 连接泄漏 |
| Node.js 内存使用 | > 80% 堆上限 | 内存泄漏 |
| Webhook 处理延迟 | > 30s | 支付确认延迟 |
| 磁盘使用率 | > 85% | 存储告急 |

---

## 9. 日志系统

### 当前实现

AceProxy 使用 NestJS 内置 Logger（`@nestjs/common`）：
- 所有 Service 注入 `private readonly logger = new Logger(ServiceName.name)`
- 日志级别: `log` / `warn` / `error`
- 脱敏: Webhook payload 仅记录 status/external_id/id，不打印敏感字段

### 升级到 Winston（推荐生产环境）

```bash
npm install nest-winston winston
```

```typescript
// logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

// main.ts: const app = await NestFactory.create(AppModule, { logger: winstonConfig });
```

### 日志聚合方案

| 方案 | 适用场景 | 成本 |
|------|---------|------|
| **ELK Stack** (Elasticsearch + Logstash + Kibana) | 自建，完整控制 | 中（服务器成本） |
| **Grafana Loki** + Promtail | 轻量，与 Grafana 统一 | 低 |
| **Datadog / New Relic** | SaaS，开箱即用 | 高（按量付费） |
| **CloudWatch** (AWS) | 已在 AWS 生态 | 低-中 |

**推荐 MVP 方案**: Grafana Loki + Promtail（轻量、免费、与 Prometheus 生态兼容）

---

## 10. 备份策略

### PostgreSQL 定时备份

```bash
#!/bin/bash
# backup.sh — 每日 PostgreSQL 备份脚本
# 添加到 crontab: 0 2 * * * /opt/aceproxy/backup.sh

BACKUP_DIR="/opt/aceproxy/backups"
DB_NAME="aceproxy"
DB_USER="aceproxy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# 全量备份
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: $BACKUP_FILE" >> "${BACKUP_DIR}/backup.log"
```

### 恢复步骤

```bash
# 1. 停止应用
pm2 stop aceproxy

# 2. 恢复数据库
gunzip -c /opt/aceproxy/backups/aceproxy_20260615_020000.sql.gz | \
  psql -U aceproxy aceproxy

# 3. 验证数据
psql -U aceproxy -d aceproxy -c "SELECT count(*) FROM ace_order;"

# 4. 重启应用
pm2 start aceproxy
```

### 备份最佳实践

| 策略 | 频率 | 保留期 |
|------|------|--------|
| 全量备份 (pg_dump) | 每日凌晨 2:00 | 30 天 |
| WAL 归档 (连续) | 实时 | 7 天 |
| 异地备份 (rsync/s3) | 每日备份后 | 90 天 |
| 迁移前快照 | 每次 migrate 前 | 永久 |

---

## 11. 灾备方案

### 数据库高可用

```
主库 (Primary) ←── 同步复制 ──→ 从库 (Standby)
     │                              │
     │ ←── WAL 流复制 ─────────────→│
     │                              │
  写入流量                        只读查询
```

```sql
-- 配置从库 (standby.signal)
-- 1. 在主库配置 pg_hba.conf:
--    host replication replicator 10.0.0.0/8 md5

-- 2. 创建复制用户:
--    CREATE USER replicator REPLICATION LOGIN PASSWORD 'replica_pass';

-- 3. 在从库执行 base backup:
--    pg_basebackup -h primary_host -D /var/lib/postgresql/data -U replicator -P -R

-- 4. 启动从库:
--    pg_ctl start
```

### 异地灾备

| 层级 | 方案 | RPO | RTO |
|------|------|-----|-----|
| 数据库 | 跨区域流复制 + 每日 pg_dump → S3 | < 1 分钟 | < 15 分钟 |
| 应用 | 多区域部署 + DNS failover | 实时 | < 5 分钟 |
| 静态资源 | CDN 多节点缓存 | 实时 | 实时 |

**推荐方案**: 
- MVP 阶段: 每日 pg_dump → AWS S3 / 阿里云 OSS（异地）
- 生产阶段: PostgreSQL Streaming Replication → 跨 AZ Standby

---

## 12. 扩容指南

### 水平扩展架构

```
                    ┌──────────────┐
                    │   Nginx LB   │ (least_conn)
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┼───┼───┼────────────┐
          ▼            ▼   ▼   ▼            ▼
     ┌─────────┐  ┌─────────┐  ┌─────────┐
     │Server 1 │  │Server 2 │  │Server N │
     │PM2 × 4  │  │PM2 × 4  │  │PM2 × 4  │
     └────┬────┘  └────┬────┘  └────┬────┘
          │            │            │
          └────────────┼────────────┘
                       ▼
              ┌────────────────┐
              │  PostgreSQL    │
              │  (主) + Redis  │
              └────────────────┘
```

### Nginx 负载均衡配置

```nginx
upstream aceproxy_backend {
    least_conn;  # 最少连接数算法
    server 10.0.1.1:3001 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.2:3001 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.3:3001 weight=2 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.aceproxy.id;

    # SSL 配置见第 13 节

    location / {
        proxy_pass http://aceproxy_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    # Webhook 端点保持 sticky session（避免 Xendit 重试打到不同节点）
    location /api/v1/payment/webhook {
        proxy_pass http://aceproxy_backend;
        proxy_http_version 1.1;
    }
}
```

### PM2 集群模式

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'aceproxy',
    script: 'dist/main.js',
    instances: 'max',        // CPU 核心数
    exec_mode: 'cluster',
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production', PORT: 3001 },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    merge_logs: true,
  }]
};

# pm2 start ecosystem.config.js
```

---

## 13. SSL 配置

### Let's Encrypt + Certbot

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（自动配置 Nginx）
sudo certbot --nginx -d api.aceproxy.id -d aceproxy.id

# 测试自动续期
sudo certbot renew --dry-run

# 自动续期已由 certbot.timer 管理，无需手动操作
```

### 完整 Nginx SSL 配置

```nginx
server {
    listen 80;
    server_name api.aceproxy.id aceproxy.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.aceproxy.id;

    # SSL 证书
    ssl_certificate     /etc/letsencrypt/live/api.aceproxy.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aceproxy.id/privkey.pem;

    # SSL 安全配置 (Mozilla SSL Configurator — Intermediate)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # 安全 headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 限制请求体大小
    client_max_body_size 10m;
}
```

---

## 14. 性能调优

### Node.js 内存配置

```bash
# PM2 启动参数
pm2 start dist/main.js --name aceproxy \
  --max-memory-restart 512M \
  --node-args="--max-old-space-size=1024 --optimize-for-size"

# 或直接在 .env 中:
# NODE_OPTIONS="--max-old-space-size=1024"
```

### PostgreSQL 连接池

```prisma
// prisma/schema.prisma 或在 DATABASE_URL 中配置
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10"
```

```typescript
// Prisma 连接池建议（prisma.service.ts）:
// 开发环境: connection_limit=5
// 生产环境: connection_limit=20
// 配合 PM2 cluster 模式: connection_limit = 20 / instances
```

### Prisma 查询优化建议

| 优化项 | 方法 | 效果 |
|--------|------|------|
| N+1 查询 | `include` 代替循环 findUnique | 减少 90% 查询次数 |
| 只选需要的字段 | `select: { id, name, priceIdr }` | 减少数据传输量 |
| 批量操作 | `createMany` / `updateMany` | 单次 SQL 代替 N 次 |
| 分页 | `skip` + `take` | 避免全表扫描 |
| 聚合查询 | `_count` / `_sum` / `groupBy` | 在数据库层计算 |
| 索引 | `@@index([status])` / `@@index([createdAt])` | 加速过滤查询 |

### 关键 Prisma 索引建议

```prisma
model AceOrder {
  // ... 字段

  @@index([userId])       // 用户订单查询
  @@index([status])       // 按状态过滤
  @@index([createdAt])    // 时间排序
  @@index([country])      // 按国家统计
}

model AceProduct {
  // ... 字段

  @@index([category])     // 分类浏览
  @@index([status])       // 上下架过滤
  @@index([priceIdr])     // 价格排序
}

model AceCartItem {
  // ... 字段

  @@index([userId])       // 用户购物车
  @@unique([userId, productId])  // 防重复
}
```

### HTTP 性能优化

- **Gzip 压缩**: Nginx `gzip on; gzip_types application/json;`
- **Keep-Alive**: `proxy_set_header Connection "";` + HTTP/1.1
- **HTTP/2**: `listen 443 ssl http2;` — 多路复用减少连接数
- **静态资源缓存**: 前端 HTML/JS 设置 `Cache-Control: public, max-age=3600`
- **API 响应压缩**: 对于 >1KB JSON 响应，开启 brotli/gzip
