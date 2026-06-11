// init-db.js - 推送建表 SQL 到 Neon PostgreSQL
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const url = require('url');

const SQL = fs.readFileSync(path.join(__dirname, 'prisma/init-production.sql'), 'utf8');

// 按分号拆分 SQL 语句（跳过注释和空行）
const statements = SQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function main() {
  // 手动解析连接串，避开 pg 在 Windows 上抢系统用户名的 bug
  const dbUrl = new url.URL(process.env.DATABASE_URL);
  const pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: dbUrl.port || 5432,
    database: dbUrl.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
    max: 3,
  });

  console.log(`📦 共 ${statements.length} 条 SQL 语句，开始推送...`);
  console.log(`   数据库: ${dbUrl.hostname}/${dbUrl.pathname.replace(/^\//, '')}`);

  let ok = 0, skip = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      ok++;
      const name = stmt.substring(0, 60).replace(/\n/g, ' ');
      console.log(`  ✅ [${ok}] ${name}...`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        skip++;
        console.log(`  ⏭️  [skip] already exists`);
      } else {
        console.error(`  ❌ ERROR: ${e.message}`);
      }
    }
  }

  await pool.end();
  console.log(`\n✅ 完成！成功: ${ok}, 跳过: ${skip}, 总计: ${statements.length}`);
}

main().catch(console.error);
