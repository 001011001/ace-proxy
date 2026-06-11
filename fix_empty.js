const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// The problem: "sc-title":""Smart Collection" 
// Caused by: :: was replaced with ":" but value already has leading "
// Fix: find ""Smart and replace with "Smart (remove empty string)
let count = 0;
const keys = ['sc-title','sc-sub','sc-btn','sc-logistics-title','sc-logistics-body','sc-results-title'];
keys.forEach(k => {
  // Pattern: "key":""Value" -> "key":"Value"
  const bad = '"' + k + '":""';
  const good = '"' + k + '":"';
  while (h.includes(bad)) {
    h = h.replace(bad, good);
    count++;
  }
});

console.log('Fixed empty-string x', count);

fs.writeFileSync(p, h, 'utf8');

// Validate
try {
  const acorn = require('acorn');
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    acorn.parse(m[1], { ecmaVersion: 2022 });
    console.log('\n✅ JS syntax OK! Size:', m[1].length, 'chars');
  }
} catch(e) {
  console.log('\n❌ Error:', e.message);
}
