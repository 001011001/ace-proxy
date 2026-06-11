const fs = require('fs');
const p = 'D:/工作库/ace-proxy/deploy/index.html';
let h = fs.readFileSync(p, 'utf8');

// Find exact broken area
const broken = h.indexOf('"resale-hero-btn2":"📸 List an Item"');
if (broken < 0) { console.log('Cannot find broken anchor'); process.exit(1); }

// Show surrounding context
console.log('Around error:', JSON.stringify(h.substring(broken-10, broken+100)));

// The broken pattern is: ,"resale-hero-btn2":"📸 List an Item",,"sc-title"::"Smart Collection"
// Fix: replace the broken section from "resale-hero-btn2" through all sc-* keys in each language
// with properly formatted version

// For each language object, find and fix the broken part
const fixes = [
  {
    // EN
    search: '"resale-hero-btn2":"📸 List an Item",,"sc-title"::"Smart Collection","sc-sub"::"Paste ANY product link from any website. We\'ll intelligently find matching products, compare prices, and prepare listing for you.","sc-btn"::"Find Matching Products","sc-logistics-title"::"Logistics Compliance Notice","sc-logistics-body"::"<div><strong>✅ Can Ship:</strong> Clothing, home goods, electronics (no battery), accessories, gifts, prayer items.</div><div><strong>⚠️ Extra Shipping Cost:</strong> Oversized items, fragile goods (glass/ceramic), liquid cosmetics (≤100ml only).</div><div><strong>🚫 Cannot Ship:</strong> Batteries (loose), flammable liquids, drugs, weapons, fresh food, live animals.</div>","sc-results-title"::"Matching Products Found"',
    replace: '"resale-hero-btn2":"📸 List an Item","sc-title":"Smart Collection","sc-sub":"Paste ANY product link from any website. We\\'ll intelligently find matching products, compare prices, and prepare listing for you.","sc-btn":"Find Matching Products","sc-logistics-title":"Logistics Compliance Notice","sc-logistics-body":"<div><strong>✅ Can Ship:</strong> Clothing, home goods, electronics (no battery), accessories, gifts, prayer items.</div><div><strong>⚠️ Extra Shipping Cost:</strong> Oversized items, fragile goods (glass/ceramic), liquid cosmetics (≤100ml only).</div><div><strong>🚫 Cannot Ship:</strong> Batteries (loose), flammable liquids, drugs, weapons, fresh food, live animals.</div>","sc-results-title":"Matching Products Found"'
  },
  {
    // ID
    search: '"resale-hero-btn2":"📸 Jual Barang",,"sc-title"::"Smart Collection","sc-sub"::"Tempel TAUUTA link produk dari website manapun..."',
    replace: '"resale-hero-btn2":"📸 Jual Barang","sc-title":"Smart Collection"'
  },
  {
    // CN
    search: '"resale-hero-btn2":"📸 发布转卖",,"sc-title"::"智能采集"',
    replace: '"resale-hero-btn2":"📸 发布转卖","sc-title":"智能采集"'
  }
];

fixes.forEach(f => {
  if (h.includes(f.search)) {
    h = h.replace(f.search, f.replace);
    console.log('Fixed:', f.search.substring(0,40));
  } else {
    console.log('NOT FOUND:', f.search.substring(0,50));
  }
});

fs.writeFileSync(p, h, 'utf8');

// Validate
try {
  const acorn = require('acorn');
  const m = h.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    acorn.parse(m[1], { ecmaVersion: 2022 });
    console.log('\n✅ JS syntax OK!');
    console.log('JS size:', m[1].length, 'chars');
  }
} catch(e) {
  console.log('\n❌ Still error:', e.message);
  const lines = e.message.match(/\((\d+):(\d+)\)/);
  if (lines) {
    const ln = parseInt(lines[1]);
    const jsMatch = h.match(/<script>([\s\S]*?)<\/script>/);
    if (jsMatch) {
      const jsLines = jsMatch[1].split('\n');
      console.log('Line', ln, ':', jsLines[ln-1]?.substring(0, 200));
    }
  }
}
