#!/usr/bin/env node
/**
 * Supabase 数据库迁移工具
 *
 * 使用前：
 * 1. 在 .env 中填好 SUPABASE_URL + DATABASE_URL (postgresql)
 * 2. 运行：npx ts-node scripts/migrate-to-supabase.ts
 *
 * 操作：
 * - 禁用 Prisma SQLite 数据
 * - 切换到 PostgreSQL
 * - 执行 prisma migrate deploy
 * - 执行 prisma db seed
 * - 验证连接
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║   Supabase 数据库迁移工具                          ║');
console.log('╚══════════════════════════════════════════════════╝\n');

// ─── 1. 检查环境变量 ───

const supabaseUrl = process.env.SUPABASE_URL;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL 不是 PostgreSQL 连接字符串');
  console.log('   当前值:', dbUrl);
  console.log('\n   请在 .env 中设置:');
  console.log('   DB_PROVIDER=postgresql');
  console.log('   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres"');
  console.log('   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"');
  process.exit(1);
}

console.log('✅ DATABASE_URL: PostgreSQL 连接字符串已配置\n');

if (supabaseUrl && supabaseUrl.startsWith('https://')) {
  console.log(`✅ SUPABASE_URL: ${supabaseUrl}`);
} else {
  console.warn('⚠️  SUPABASE_URL 未配置（非必需，但建议配置以启用 Auth）');
}

// ─── 2. 确认操作 ───

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('\n⚠️  将执行以下操作：\n' +
  '  1. npx prisma generate\n' +
  '  2. npx prisma migrate deploy\n' +
  '  3. npx prisma db seed (载入100条测试商品)\n\n' +
  '确认继续？(y/N): ', (answer: string) => {

  if (answer.toLowerCase() !== 'y') {
    console.log('已取消。');
    readline.close();
    process.exit(0);
  }

  readline.close();

  console.log('\n🔄 开始迁移...\n');

  try {
    // Step 1: Generate Prisma client
    console.log('📦 [1/3] Generating Prisma client...');
    execSync('npx prisma generate', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DB_PROVIDER: 'postgresql',
      },
    });

    // Step 2: Run migrations
    console.log('\n🗄️  [2/3] Running database migrations...');
    execSync('npx prisma migrate deploy', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DB_PROVIDER: 'postgresql',
      },
    });

    // Step 3: Seed data
    console.log('\n🌱 [3/3] Seeding product data...');
    execSync('npx prisma db seed', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DB_PROVIDER: 'postgresql',
      },
    });

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  ✅ 数据库迁移完成！                               ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║  📋 验证：                                         ║');
    console.log('║  npx prisma studio  → 查看数据                    ║');
    console.log('║  npm run start:dev  → 启动后端                    ║');
    console.log('║  GET /api/v1/health → 检查服务状态               ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

  } catch (err: any) {
    console.error('\n❌ 迁移失败：', err.message);
    console.log('\n常见问题：');
    console.log('  - 密码错误：检查 DATABASE_URL 中的密码是否正确');
    console.log('  - 网络不通：确认能访问 Supabase 数据库');
    console.log('  - IP 限制：Supabase 可能需要添加 IP 白名单\n');
    process.exit(1);
  }
});
