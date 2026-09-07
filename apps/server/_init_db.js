// 初始化 SQLite 数据库 — 清理旧数据 + 建表
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverDir = __dirname;

console.log('📦 清理旧数据库...');
const dbFiles = ['prisma/ace_proxy.db', 'prisma/dev.db', 'prisma/ace_proxy.db-journal', 'prisma/dev.db-journal'];
dbFiles.forEach(f => {
  const p = path.join(serverDir, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`  ✅ 已删除 ${f}`); }
});

console.log('\n🔨 推送 schema 到 SQLite...');
try {
  const result = execSync('npx prisma db push --accept-data-loss', {
    cwd: serverDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60000,
    env: { ...process.env, CI: 'true' }
  });
  console.log(result);
  console.log('\n✅ 数据库初始化成功！');
} catch (error) {
  console.error('❌ db push 失败:', error.stderr || error.message);
  process.exit(1);
}
