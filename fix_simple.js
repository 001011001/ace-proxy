const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Simple approach: find and replace each exact broken pattern
// Pattern 1: EN object - double comma + double colon
let count = 0;

// Replace ,,"sc-title"::  with ,"sc-title":  in L object
while (h.includes(',"sc-title"::')) {
  h = h.replace(',"sc-title"::', ',"sc-title":"');
  count++;
}
console.log('Fixed sc-title :: x', count);

count = 0;
while (h.includes(',"sc-sub"::')) {
  h = h.replace(',"sc-sub"::', ',"sc-sub":"');
  count++;
}
console.log('Fixed sc-sub :: x', count);

count = 0;
while (h.includes(',"sc-btn"::')) {
  h = h.replace(',"sc-btn"::', ',"sc-btn":"');
  count++;
}
console.log('Fixed sc-btn :: x', count);

count = 0;
while (h.includes(',"sc-logistics-title"::')) {
  h = h.replace(',"sc-logistics-title"::', ',"sc-logistics-title":"');
  count++;
}
console.log('Fixed sc-logistics-title :: x', count);

count = 0;
while (h.includes(',"sc-logistics-body"::')) {
  h = h.replace(',"sc-logistics-body"::', ',"sc-logistics-body":"');
  count++;
}
console.log('Fixed sc-logistics-body :: x', count);

count = 0;
while (h.includes(',"sc-results-title"::')) {
  h = h.replace(',"sc-results-title"::', ',"sc-results-title":"');
  count++;
}
console.log('Fixed sc-results-title :: x', count);

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
}
