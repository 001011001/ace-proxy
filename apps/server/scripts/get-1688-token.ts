#!/usr/bin/env node
/**
 * 1688 OAuth Token 获取工具
 *
 * 使用方法：
 * 1. 确保 .env 中已填写 ALIBABA_APP_KEY 和 ALIBABA_APP_SECRET
 * 2. 运行：npx ts-node scripts/get-1688-token.ts
 * 3. 打开打印的授权 URL → 浏览器授权 → 获取授权码
 * 4. 粘贴授权码 → 自动获取 access_token 和 refresh_token
 * 5. 将 token 填入 .env 的 ALIBABA_ACCESS_TOKEN
 *
 * 文档：https://open.1688.com/doc/openIndex.htm
 */

import * as crypto from 'crypto';
import * as readline from 'readline';

// ─── 配置（从 .env 或命令行参数读取） ───

const APP_KEY = process.env.ALIBABA_APP_KEY || '';
const APP_SECRET = process.env.ALIBABA_APP_SECRET || '';
const REDIRECT_URI = process.env.ALIBABA_REDIRECT_URI || 'https://localhost:3000/callback';

if (!APP_KEY || !APP_SECRET) {
  console.error('\n❌ 请先在 .env 中配置 ALIBABA_APP_KEY 和 ALIBABA_APP_SECRET\n');
  console.log('注册流程：');
  console.log('  1. 访问 https://open.1688.com');
  console.log('  2. 企业实名认证（需营业执照）');
  console.log('  3. 创建应用 → 获取 AppKey 和 AppSecret\n');
  process.exit(1);
}

// ─── 生成授权 URL ───

const STATE = crypto.randomBytes(16).toString('hex');

const authUrl = new URL('https://gw.open.1688.com/auth/authorize');
authUrl.searchParams.set('client_id', APP_KEY);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('state', STATE);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'member base');

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║   1688 OAuth Token 获取工具                        ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║ App Key:    ${APP_KEY.slice(0, 8)}...${APP_KEY.slice(-4)}`);
console.log(`║ Redirect:   ${REDIRECT_URI}`);
console.log('╠══════════════════════════════════════════════════╣');
console.log('║  📋 请复制以下 URL 到浏览器打开：                    ║');
console.log('╚══════════════════════════════════════════════════╝\n');
console.log(authUrl.toString());
console.log('\n─────────────────────────────────────────────────');
console.log('授权后会跳转到 redirect_uri，URL 中包含 ?code=XXXX');
console.log('请复制 code 参数的值（只复制 code= 后面的部分）');
console.log('─────────────────────────────────────────────────\n');

// ─── 读取授权码 ───

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('📝 粘贴授权码 (code): ', async (code: string) => {
  rl.close();

  if (!code.trim()) {
    console.log('\n❌ 未输入授权码，退出。\n');
    process.exit(1);
  }

  console.log('\n🔄 正在换取 access_token...\n');

  try {
    // ─── 用授权码换取 Token ───
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      need_refresh_token: 'true',
      client_id: APP_KEY,
      client_secret: APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code.trim(),
    };

    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const response = await fetch(
      `https://gw.open.1688.com/openapi/http/1/system.oauth2/getToken?${query}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );

    const data: any = await response.json();

    if (data.access_token) {
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║  ✅ Token 获取成功！                               ║');
      console.log('╠══════════════════════════════════════════════════╣');
      console.log(`║  access_token:  ${data.access_token}`);
      console.log('╠══════════════════════════════════════════════════╣');

      if (data.refresh_token) {
        console.log(`║  refresh_token: ${data.refresh_token}`);
        console.log('╠══════════════════════════════════════════════════╣');
      }

      console.log(`║  过期时间:      ${data.expires_in ? Math.round(data.expires_in / 3600) + ' 小时' : '未知'}`);
      console.log('╠══════════════════════════════════════════════════╣');
      console.log('║  📋 下一步：                                       ║');
      console.log(`║  1. 复制上面 access_token                          ║`);
      console.log(`║  2. 粘贴到 .env:                                   ║`);
      console.log(`║     ALIBABA_ACCESS_TOKEN=${data.access_token}`);
      console.log('║  3. 重启后端服务                                   ║');
      console.log('╚══════════════════════════════════════════════════╝\n');

      console.log(`💡 Token 有效期约 7 天，过期后需用 refresh_token 刷新。\n`);
    } else {
      console.log('\n❌ Token 获取失败：');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n常见原因：');
      console.log('  - 授权码已过期（5分钟内有效）');
      console.log('  - AppKey/AppSecret 不匹配');
      console.log('  - 未通过企业实名认证\n');
    }
  } catch (err: any) {
    console.error(`\n❌ 网络请求失败: ${err.message}\n`);
  }

  process.exit(0);
});
