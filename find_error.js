const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

try {
  const acorn = require('acorn');
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    try { acorn.parse(m[1], { ecmaVersion: 2022 }); } catch(e) {
      const lines = e.message.match(/\((\d+):(\d+)\)/);
      if (lines) {
        const ln = parseInt(lines[1]);
        const col = parseInt(lines[2]);
        const jsLines = m[1].split('\n');
        console.log('--- Line', ln, ', col', col, ' ---');
        console.log(jsLines[ln-1]?.substring(Math.max(0,col-30), col+60));
        console.log(' '.repeat(col-1) + '^');
        // Also show surrounding context
        console.log('\n--- Context (lines', Math.max(1,ln-2), '-', ln+2, ') ---');
        for (let i = Math.max(0,ln-3); i <= Math.min(jsLines.length-1, ln+2); i++) {
          console.log((i+1) + ': ' + jsLines[i]?.substring(0,150));
        }
      }
    }
  }
} catch(e) {
  console.log('Error:', e.message);
}
