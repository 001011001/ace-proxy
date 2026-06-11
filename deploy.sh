#!/bin/bash
# AceProxy 一键部署脚本
# 用法: bash deploy.sh

set -e
echo "🚀 AceProxy 部署开始..."

# 1. 环境检查
command -v node >/dev/null 2>&1 || { echo "❌ 需要 Node.js 22+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ 需要 npm"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js >= 18 需要, 当前: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci --production=false 2>/dev/null || npm install

# 3. 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate

# 4. 数据库迁移
echo "🗄️ 数据库迁移..."
npx prisma db push --accept-data-loss

# 5. 种子数据
echo "🌱 种子数据..."
npx ts-node prisma/seed.ts 2>/dev/null || echo "⚠️ 种子已存在，跳过"

# 6. 构建
echo "🔨 构建生产版本..."
npm run build

# 7. 启动
echo "✅ 部署完成！启动服务..."
echo ""
echo "  本地访问: http://localhost:3001/api/v1/health"
echo "  运费测试: http://localhost:3001/api/v1/shipping/estimate?country=ID&weightKg=0.5"
echo ""

npm run start:prod
