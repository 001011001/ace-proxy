const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

const m = h.match(/<script>([\s\S]*?)<\/script>/);
if (m) {
  const lines = m[1].split('\n');
  for (let i = 590; i < Math.min(700, lines.length); i++) {
    console.log((i+1) + ': ' + lines[i]?.substring(0,160));
  }
}
