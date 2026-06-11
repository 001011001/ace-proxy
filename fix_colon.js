const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Fix :: to ":"
const before = h;
h = h.replace(/\"\:\"/g, '\":\"');
const count = before.length - h.length;
console.log('Fixed :: to \":\" count:', count / 2);

fs.writeFileSync(p, h, 'utf8');

// Validate
try {
  const acorn = require('acorn');
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    acorn.parse(m[1], { ecmaVersion: 2022 });
    console.log('JS syntax: OK');
  }
} catch(e) {
  console.log('JS syntax error:', e.message);
  // Try to show context
  const lines = e.message.match(/\((\d+):(\d+)\)/);
  if (lines) {
    const l = parseInt(lines[1]);
    const jsMatch = h.match(/<script>([\s\S]*?)<\/script>/);
    if (jsMatch) {
      const jsLines = jsMatch[1].split('\n');
      console.log('Line', l, ':', jsLines[l-1]?.substring(0, 150));
    }
  }
}
