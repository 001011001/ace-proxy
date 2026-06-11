const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Fix: in L object, keys with hyphens need quotes in JS object literal
// Current (broken): ,sc-title:"Smart Collection"
// Fixed: ,"sc-title":"Smart Collection"

const keys = ['sc-title','sc-sub','sc-btn','sc-logistics-title','sc-logistics-body','sc-results-title'];

keys.forEach(k => {
  // Escape hyphen for regex
  const escaped = k.replace(/-/g, '\\-');
  // Replace ,sc-title:  with ,"sc-title":
  const re = new RegExp(',' + escaped + '(?=:)', 'g');
  h = h.replace(re, ',"' + k + '":');
  // Also handle if there's no leading comma (start of object)
  const re2 = new RegExp('({\\s*)' + escaped + '(?=:)', 'g');
  h = h.replace(re2, '$1"' + k + '":');
});

fs.writeFileSync(p, h, 'utf8');
console.log('Fixed keys:', keys.join(', '));

// Validate
try {
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    require('acorn').parse(m[1], { ecmaVersion: 2022 });
    console.log('JS syntax: OK');
  }
} catch(e) {
  console.log('JS syntax error:', e.message);
}
