#!/usr/bin/env node
/**
 * AceProxy 前端回归验证脚本
 * 每次修改 deploy/index.html 后运行: node scripts/verify-frontend.js
 *
 * 检查项:
 * ① JS 语法 (acorn)
 * ② HTML div 嵌套平衡
 * ③ 产品卡片 onclick → Modal.open 链路
 * ④ Modal DOM 元素存在性
 * ⑤ z-index 冲突
 * ⑥ P 数组数据安全 (fetchProducts 不误清空)
 * ⑦ SmartCollect z-index 遮罩安全
 */

const fs = require('fs');
const path = require('path');

const TARGET = path.resolve(__dirname, '..', 'deploy', 'index.html');

let passed = 0;
let failed = 0;
let warnings = 0;

function check(name, ok, msg) {
  if (ok) { passed++; console.log('  ✅ ' + name); }
  else     { failed++; console.error('  ❌ ' + name + ' — ' + (msg || 'FAILED')); }
}

function warn(name, msg) {
  warnings++; console.warn('  ⚠️  ' + name + ' — ' + msg);
}

function title(t) {
  console.log('\n' + '═'.repeat(60));
  console.log('  ' + t);
  console.log('═'.repeat(60));
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

console.log('🔍 AceProxy Frontend Regression Check');
console.log('   Target:', TARGET);
console.log('   Time:  ', new Date().toISOString());

if (!fs.existsSync(TARGET)) {
  console.error('❌ File not found:', TARGET);
  process.exit(1);
}

const html = fs.readFileSync(TARGET, 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const js = scriptMatch ? scriptMatch[1] : '';
const jsLines = js.split('\n');

// ═══════════════════════════════════
// ① JS 语法检查
// ═══════════════════════════════════
title('① JavaScript 语法');
try {
  require('acorn').parse(js, { ecmaVersion: 2020 });
  check('acorn 语法解析', true);
  console.log('     JS 大小: ' + js.length + ' chars, ' + jsLines.length + ' lines');
} catch (e) {
  check('acorn 语法解析', false, 'Line ' + e.loc.line + ': ' + e.message);
  const ctx = 3;
  for (let i = Math.max(0, e.loc.line - ctx - 1); i < Math.min(jsLines.length, e.loc.line + ctx); i++) {
    const marker = i === e.loc.line - 1 ? '>>>' : '   ';
    console.error(marker + ' ' + (i + 1) + ': ' + jsLines[i].substring(0, 120));
  }
}

// ═══════════════════════════════════
// ② HTML div 嵌套平衡
// ═══════════════════════════════════
title('② HTML div 嵌套平衡');

let depth = 0;
let minDepth = 0;
const lines = html.split('\n');
lines.forEach(l => {
  const o = (l.match(/<div[^>]*>/g) || []).length;
  const c = (l.match(/<\/div>/g) || []).length;
  depth += (o - c);
  if (depth < minDepth) minDepth = depth;
  if (depth < 0) {
    // Track but don't fail — browsers self-heal minor nesting issues
  }
});
check('div 标签数量平衡 (<div> vs </div>)', depth === 0,
  '差值=' + depth + ' (可能是覆盖层 / 条件渲染)');
if (minDepth < 0) {
  warn('存在负深度（过早关闭的 </div>）', '最小深度=' + minDepth + '，浏览器会自愈但可能改变 DOM 结构');
}

// 各页面区域检查
const sections = ['page-home', 'page-discovery', 'page-wallet', 'page-resale', 'page-profile'];
sections.forEach(sec => {
  const startIdx = html.indexOf('id="' + sec + '"');
  if (startIdx < 0) return;
  let endIdx = html.length;
  for (const s of sections) {
    if (s === sec) continue;
    const idx = html.indexOf('id="' + s + '"', startIdx + 1);
    if (idx > startIdx && idx < endIdx) endIdx = idx;
  }
  // Also stop at <script> tags
  const scriptIdx = html.indexOf('<script>', startIdx);
  if (scriptIdx > startIdx && scriptIdx < endIdx) endIdx = scriptIdx;

  const secHtml = html.substring(startIdx, endIdx);
  const sO = (secHtml.match(/<div[^>]*>/g) || []).length;
  const sC = (secHtml.match(/<\/div>/g) || []).length;
  if (sO !== sC) {
    warn(sec + ' 区域不平衡', 'opens=' + sO + ' closes=' + sC + ' diff=' + (sO - sC));
  }
});

// ═══════════════════════════════════
// ③ 产品卡片 onclick 链路
// ═══════════════════════════════════
title('③ 产品卡片 onclick → 详情链路');

// 3a. Home page — check P data + Modal.open pattern
check('P 数组初始化 (硬编码数据)', js.includes('let P=[{id:"EID-JKT-001"') || js.includes('let P=[{id:"EID-JKT-001"'));

const modalCalls = (js.match(/onclick="Modal\.open\(/g) || []).length;
check('Home.render 包含 Modal.open onclick', modalCalls >= 2, '找到 ' + modalCalls + ' 处调用');

// 3b. fetchProducts 数据安全
const pClearIdx = js.indexOf('P.length=0');
const fetchFnIdx = js.indexOf('async function fetchProducts');
const tryIdx = js.indexOf('try{', fetchFnIdx);
const catchIdx = js.indexOf('}catch', fetchFnIdx);

const clearsBeforeApi = pClearIdx > fetchFnIdx && pClearIdx < tryIdx;
if (clearsBeforeApi) {
  check('P.length=0 在 API 调用之前 (数据竞争风险)', false,
    'P.length=0 在 try 块之前执行 → API 失败时 P 为空 → Modal.open 失效');
} else {
  // Check if P is cleared inside try block (correct)
  const inTry = pClearIdx > fetchFnIdx && pClearIdx > tryIdx && (catchIdx < 0 || pClearIdx < catchIdx);
  check('P.length=0 在 API 成功后才执行 (安全)', inTry || pClearIdx < 0,
    inTry ? '在 try 块内，API 成功后清除' : '未找到 P.length=0 或已通过 newProducts 模式保护');
}

// 3c. Modal.open silent failure
const silentReturn = js.match(/if\(!p\)\{console\.warn[^}]*return[^}]*\}/);
check('Modal.open P.find 失败时有用户反馈 (toast)', !!silentReturn && silentReturn[0].includes('showToast'),
  silentReturn ? '存在处理但无 toast 提示' : '缺少 return 安全网');

// 3d. Discovery page onclick
const discOnclick = (js.match(/onclick="Modal\.open\('/g) || []).length;
check('Discovery 产品卡片有 onclick', discOnclick >= 1, '找到 ' + discOnclick + ' 处');

// 3e. Favorites onclick
const favOnclick = js.includes('onclick="Modal.open(\'') && js.includes('Fav.toggle');
check('收藏夹产品卡片有 onclick', favOnclick);

// 3f. SmartCollect onclick
const scOnclick = js.includes('onclick="SmartCollect.showDetail');
check('SmartCollect 结果卡片有 onclick → showDetail', scOnclick);

// 3g. Resale onclick — check for hardcoded ID
const resaleMatch = js.match(/onclick="Modal\.open\('EID-JKT-001'\)"/g);
if (resaleMatch && resaleMatch.length >= 2) {
  warn('Resale 转卖页全部硬编码同一产品 ID', resaleMatch.length + ' 处使用 EID-JKT-001');
}

// ═══════════════════════════════════
// ④ Modal DOM 元素
// ═══════════════════════════════════
title('④ Modal DOM 元素存在性');

check('div#prodModal 存在', html.includes('id="prodModal"'));
check('div#prodModalContent 存在', html.includes('id="prodModalContent"'));
check('.modal-overlay CSS 类', html.includes('.modal-overlay{'));
check('.modal-overlay.open → display:flex', html.includes('.modal-overlay.open{display:flex') ||
  (html.includes('.modal-overlay.open') && html.includes('display:flex') && html.indexOf('.modal-overlay.open') < html.indexOf('display:flex', html.indexOf('.modal-overlay.open') + 100)));

// ═══════════════════════════════════
// ⑤ z-index 冲突检测
// ═══════════════════════════════════
title('⑤ z-index 冲突检测');

const zIndexes = [];
lines.forEach((l, i) => {
  const ziMatch = l.match(/z-index:\s*(\d+)/);
  if (!ziMatch) return;
  const ziVal = parseInt(ziMatch[1]);
  // Get context — previous line for selector
  const prev = i > 0 ? lines[i - 1].trim() : '';
  const isModal = prev.includes('.modal-overlay') || prev.includes('/* MODAL */');
  const isSCOverlay = prev.includes('sc-results-overlay') || l.includes('sc-results-overlay');
  const isOtherOverlay = l.includes('position:fixed') && (l.includes('overlay') || prev.includes('overlay'));

  zIndexes.push({ line: i + 1, zi: ziVal, prev, isModal, isSCOverlay, isOtherOverlay });
});

// Check modal z-index vs SC overlay z-index
const modalZI = zIndexes.find(z => z.isModal);
const scZI = zIndexes.find(z => z.isSCOverlay);

if (modalZI && scZI) {
  check('Modal z-index (' + modalZI.zi + ') >= SC 遮罩 z-index (' + scZI.zi + ')',
    modalZI.zi >= scZI.zi,
    'SC 遮罩会挡住 Modal → SmartCollect.showDetail 内容不可见');
} else if (modalZI) {
  check('Modal z-index 已配置', true, 'z-index: ' + modalZI.zi);
}

// Check SmartCollect showDetail closes SC overlay
const closeInShowDetail = js.includes('showDetail') &&
  js.substring(js.indexOf('showDetail')).includes('scResultsOverlay');
check('SmartCollect.showDetail 关闭 SC 遮罩 (防 z-index 遮挡)',
  closeInShowDetail,
  'showDetail 未关闭 scResultsOverlay → modal 被遮');

// ═══════════════════════════════════
// ⑥ 关键函数存在性
// ═══════════════════════════════════
title('⑥ 关键函数/变量检查');

check('全局 showToast 函数', js.includes('function showToast('));
check('Modal.open 函数', js.includes('const Modal={') && js.includes('open(id){'));
check('Home.render 函数', js.includes('Home={render(){'));
check('SmartCollect 对象', js.includes('var SmartCollect={') || js.includes('const SmartCollect={'));
check('SmartCollect.showDetail', js.includes('showDetail(idx){') && js.includes('this.lastResults'));
check('SmartCollect.quickList 加入 P 数组', js.includes('P.unshift(') || (js.includes('P.push(') && js.indexOf('quickList') < js.lastIndexOf('P.push(')));
check('API_BASE 定义', js.includes('const API_BASE') || js.includes('var API_BASE'));

// ═══════════════════════════════════
// ⑦ 已知坑位检查
// ═══════════════════════════════════
title('⑦ 已知陷阱回归检查');

// product-grid (kebab) vs productGrid (camel)
const hasKebab = js.includes("'product-grid'") || js.includes('"product-grid"');
check('未使用 product-grid (错误的 kebab ID)', !hasKebab, '找到 product-grid，应为 productGrid');

// Fav.showToast correct
const favToastBroken = js.includes('setTimeout\n/* ===== HEADER SEARCH ===== */');
check('Fav.showToast 未断裂', !favToastBroken);

// 多余的 };
const doubleBrace = js.includes('};\nvar HeaderSearch') && !js.includes('};\n};\nvar HeaderSearch');
// Actually check around the HeaderSearch definition area
const headerSearchIdx = js.indexOf('var HeaderSearch={');
if (headerSearchIdx > 0) {
  const context = js.substring(Math.max(0, headerSearchIdx - 30), headerSearchIdx + 60);
  check('Fav 对象附近无多余 };', !context.includes('};\n};\nvar HeaderSearch'), 'Fav 对象闭合后有多余 };');
}

// ═══════════════════════════════════
// SUMMARY
// ═══════════════════════════════════

console.log('\n' + '▀'.repeat(60));
console.log('  结果:  ' + passed + ' passed  |  ' + failed + ' failed  |  ' + warnings + ' warnings');
console.log('▀'.repeat(60));

if (failed > 0) {
  console.log('\n🔴 存在 ' + failed + ' 个阻断问题，请修复后重试。\n');
  process.exit(1);
}

if (warnings > 0) {
  console.log('\n🟡 ' + warnings + ' 个警告，建议检查但非阻断。\n');
}

console.log('🟢 全部检查通过！\n');
process.exit(0);
