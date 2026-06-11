const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Strategy: Find the L object and rebuild only the EN/ID/CN objects with correct syntax

// Find the L object boundaries
const lStart = h.indexOf('const L={');
const lEnd = h.indexOf('};', lStart) + 2;
console.log('L object:', h.substring(lStart, lStart+20), '... end at', lEnd);

if (lStart < 0 || lEnd < 0) {
  console.log('ERROR: Could not find L object');
  process.exit(1);
}

// Extract current EN/ID/CN objects - they're on lines 805-807
const lObjStr = h.substring(lStart, lEnd);

// Fix all three language objects by replacing problematic patterns
let fixedL = lObjStr;

// Pattern 1: ,"key"::"value" -> ,"key":"value"  (double colon)
fixedL = fixedL.replace(/\"\:\"/g, '\":\"');

// Pattern 2: ,sc-title:"value" -> ,"sc-title":"value"  (missing key quote)
// This pattern has keys without quotes that contain hyphens
const unquotedHyphenKeys = ['sc-title','sc-sub','sc-btn','sc-logistics-title','sc-logistics-body','sc-results-title'];
unquotedHyphenKeys.forEach(key => {
  // Match ,key:" or {key:"  and add quotes around key
  const re = new RegExp('([{,])' + key.replace(/-/g, '\\-') + '(?=:)', 'g');
  fixedL = fixedL.replace(re, '$1"' + key + '"');
});

// Replace in main HTML
h = h.substring(0, lStart) + fixedL + h.substring(lEnd);

fs.writeFileSync(p, h, 'utf8');
console.log('Applied fixes');

// Validate
try {
  const acorn = require('acorn');
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    acorn.parse(m[1], { ecmaVersion: 2022 });
    console.log('JS syntax: OK ✅');
    console.log('JS length:', m[1].length, 'chars');
  }
} catch(e) {
  console.log('❌ JS syntax error:', e.message);
  // Show context
  const lines = e.message.match(/\((\d+):(\d+)\)/);
  if (lines) {
    const ln = parseInt(lines[1]);
    const col = parseInt(lines[2]);
    const jsMatch = h.match(/<script>([\s\S]*?)<\/script>/);
    if (jsMatch) {
      const jsLines = jsMatch[1].split('\n');
      console.log('\n--- Line ' + ln + ' ---');
      console.log(jsLines[ln-1]?.substring(0, col+50));
      console.log('^'.padStart(col));
    }
  }
}
