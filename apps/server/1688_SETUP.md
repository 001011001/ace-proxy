# ═══════════════════════════════════════════
# 1688 API Key 配置指南
# ═══════════════════════════════════════════
#
# 完整流程（15-30 分钟）：
#
# 1️⃣ 注册 1688 开放平台
#    https://open.1688.com
#    → 企业实名认证（需营业执照，个人认证不支持 API）
#    → 创建应用（选择 "自用型应用"）
#    → 获取 AppKey + AppSecret
#
# 2️⃣ 配置环境变量
#    在 apps/server/.env 中设置：
#    ALIBABA_APP_KEY=你的AppKey
#    ALIBABA_APP_SECRET=你的AppSecret
#    ALIBABA_ACCESS_TOKEN=（先用脚本获取，见下方）
#
# 3️⃣ 获取 OAuth Token（首次需要）
#    cd apps/server
#    npx ts-node scripts/get-1688-token.ts
#    → 浏览器打开打印的 URL → 授权
#    → 复制授权码 → 粘贴回车
#    → 获得 access_token → 填到 .env
#
# 4️⃣ 测试
#    POST /arbibot/analyze
#    Body: { "url": "https://shopee.co.id/product-name-i.xxx.xxx" }
#
# ⚠️ 注意事项：
# - Token 有效期约 7 天（需要定期刷新）
# - 每个应用每天调用上限 5000 次（基础版）
# - 沙箱模式：设置 ALIBABA_API_IS_SANDBOX=true 跳过真实调用
# - 开发模式：设置 ACE_PROXY_DEV_MOCK=true 使用模拟数据
