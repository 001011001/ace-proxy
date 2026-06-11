const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Fix the remaining double comma issue
// Pattern: "resale-hero-btn2":"📸 List an Item",,"sc-title"
// Should be: "resale-hero-btn2":"📸 List an Item","sc-title"

let count = 0;
// Fix only in L object area - replace ,"sc-title":: with ,"sc-title":
// But first fix double comma before sc-* keys

const keys = ['sc-title','sc-sub','sc-btn','sc-logistics-title','sc-logistics-body','sc-results-title'];
keys.forEach(k => {
  const pattern = ',,"' + k + '"';
  while (h.includes(pattern)) {
    h = h.replace(pattern, ',"' + k + '"');
    count++;
  }
});

console.log('Fixed double comma x', count);

fs.writeFileSync(p, h, 'utf8');

// Validate
try {
  const acorn = require('acorn');
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    acorn.parse(m[1], { ecmaVersion: 2022 });
    console.log('\n✅ JS syntax OK! Size:', m[1].length);
  }
} catch(e) {
  console.log('\n❌ Error:', e.message);
  // Show exact location
  const lines = e.message.match(/\((\d+):(\d+)\)/);
  if (lines) {
    const ln = parseInt(lines[1]);
    const col = parseInt(lines[2]);
    const jsMatch = h.match(/<script>([\s\S]*?)<\/script>/);
    if (jsMatch) {
      const jsLines = jsMatch[1].split('\n');
      console.log('--- Line', ln, ', col', col, ' ---');
      const line = jsLines[ln-1] || '';
      console.log(line.substring(0, col+60));
      console.log(' '.repeat(col-1) + '^');
    }
  }
}
