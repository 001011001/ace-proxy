# ═══════════════════════════════════════════
# Supabase 配置指南
# ═══════════════════════════════════════════
#
# 完整流程（10 分钟）：
#
# 1️⃣ 创建 Supabase 项目
#    https://app.supabase.com → New Project
#    Name: aceproxy-prod
#    Region: Southeast Asia (Singapore) ← 印尼用户最近
#    Database Password: 记下来！(至少8位，保存到密码管理器)
#
# 2️⃣ 获取连接信息
#    Project → Settings → Database → Connection string
#    复制 Connection Pooler 和 Direct Connection 两个 URL
#
# 3️⃣ 配置环境变量
#    在 apps/server/.env 中设置：
#
#    # 启用 Supabase
#    DB_PROVIDER=postgresql
#    
#    # 数据库连接
#    DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
#    DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
#    
#    # Auth（Project → Settings → API）
#    SUPABASE_URL=https://[PROJECT-ID].supabase.co
#    SUPABASE_ANON_KEY=eyJh...
#    SUPABASE_SERVICE_ROLE_KEY=eyJh...
#
# 4️⃣ 运行数据库迁移
#    cd apps/server
#    npx prisma migrate dev --name init_supabase
#    npx prisma db seed
#
# 5️⃣ 配置 Supabase Auth（可选，替代 Google OAuth）
#    在 Supabase Dashboard → Authentication → Providers
#    - 启用 Email/Password
#    - 启用 Google（填入 Google Cloud OAuth 凭据）
#
# 6️⃣ 前端配置（apps/web/.env.local）：
#    NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
#
# ⚠️ 注意：
# - 本地开发继续用 SQLite（DB_PROVIDER=sqlite）
# - 生产环境切换到 Supabase PostgreSQL
# - 先用一个月免费额度（500MB DB + 50K 月活用户）
