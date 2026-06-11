const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Remove orphaned Sourcing code from line 593 onwards
// Find: // Backward compatibility\nvar Sourcing=SmartCollect;\n\n  parseUrl(url){ ... };
// This entire block needs to be removed

const startMarker = '// Backward compatibility\nvar Sourcing=SmartCollect;';
const startIdx = h.indexOf(startMarker);
if (startIdx < 0) {
  console.log('Cannot find orphaned code marker');
  process.exit(1);
}

// Find the end of orphaned code - it's a standalone }; followed by newlines
// Look for the pattern: \n};\n\n after the orphaned code
// The orphaned code ends with line 694's "};\n\n"
const searchFrom = startIdx + startMarker.length;
const endPattern = '\n};\n';
let endIdx = h.indexOf(endPattern, searchFrom);
if (endIdx < 0) {
  console.log('Cannot find end of orphaned code');
  // Try alternative
  endIdx = h.indexOf('\n};', searchFrom);
}

// We need to remove everything from startIdx to endIdx + length of endPattern
const removeEnd = endIdx + (endPattern.length || 3);

console.log('Removing orphaned code:', startIdx, 'to', removeEnd);
console.log('Length to remove:', removeEnd - startIdx);

h = h.substring(0, startIdx) + h.substring(removeEnd);

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
