const fs = require('fs');
const path = 'D:\\工作库\\ace-proxy\\deploy\\index.html';
let html = fs.readFileSync(path, 'utf8');

// ========== 1. 删除首页的 Smart Sourcing 区域 ==========
const sourcingStart = '<!-- SOURCING -->';
const sourcingEnd = '<div class="trust-bar">';
const sIdx = html.indexOf(sourcingStart);
const eIdx = html.indexOf(sourcingEnd, sIdx);
if (sIdx > -1 && eIdx > -1) {
  const removeLen = eIdx - sIdx;
  html = html.substring(0, sIdx) + html.substring(sIdx + removeLen);
  console.log('[1] Removed sourcing section from home page');
}

// ========== 2. 删除首页控件区的搜索框 ==========
const searchWrapOld = '<div class="search-wrap"><input placeholder="Search..." id="searchInput" oninput="Home.render()"><button>🔍</button></div>';
if (html.includes(searchWrapOld)) {
  html = html.replace(searchWrapOld, '');
  console.log('[2] Removed search-wrap from home controls');
}

// ========== 3. 重新设计「发现」页面 ==========
const oldDiscovery = '<!-- DISCOVERY -->\n<div class="page" id="page-discovery"><div class="page-inner">\n<div class="sec">\n  <div class="sec-title" id="disc-title">🔥 Trending Now</div>\n  <div class="sec-sub" id="disc-sub">Hot picks & community favorites in Jakarta</div>\n  <div id="discoveryList"></div>\n  <div class="promo-bar" style="margin:12px 0 0"><div class="promo-title" id="resale-hero-title">🔄 Resale Hub</div><div class="promo-desc" id="resale-hero-desc">Not satisfied? Resell in our community marketplace — earn Ace Credits.</div><button class="resale-hero-btn" onclick="switchTab(\'resale\')" id="resale-hero-btn">Browse Resale →</button></div>\n</div>\n</div></div>';

const newDiscovery = `<!-- DISCOVERY (Smart Collection + Trending) -->
<div class="page" id="page-discovery"><div class="page-inner">
<div class="sec">
  <!-- Smart Collection Section -->
  <div class="smart-collect-section">
    <div class="smart-collect-title" id="sc-title">🔗 Smart Collection</div>
    <div class="smart-collect-sub" id="sc-sub">Paste ANY product link from any website. We'll intelligently find matching products, compare prices, and prepare listing for you.</div>
    <div class="smart-collect-input-wrap">
      <input type="text" class="smart-collect-input" id="scInput" placeholder="Paste product link here... (Amazon, Taobao, 1688, JD, Shopee, TikTok, any URL)" onkeydown="if(event.key==='Enter')SmartCollect.search()">
      <button class="smart-collect-btn" onclick="SmartCollect.search()" id="sc-btn">🔍 Find Matching Products</button>
    </div>
    <div class="smart-collect-notice">
      <div class="sc-notice-icon">📦</div>
      <div class="sc-notice-text">
        <div class="sc-notice-title" id="sc-logistics-title">🚚 Logistics Compliance Notice</div>
        <div class="sc-notice-body" id="sc-logistics-body">
          <div><strong>✅ Can Ship:</strong> Clothing, home goods, electronics (no battery), accessories, gifts, prayer items.</div>
          <div><strong>⚠️ Extra Shipping Cost:</strong> Oversized items, fragile goods (glass/ceramic), liquid cosmetics (≤100ml only).</div>
          <div><strong>🚫 Cannot Ship:</strong> Batteries (loose), flammable liquids, drugs, weapons, fresh food, live animals.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Trending Section -->
  <div style="margin-top:24px">
    <div class="sec-title" id="disc-title">🔥 Trending Now</div>
    <div class="sec-sub" id="disc-sub">Hot picks & community favorites in Jakarta</div>
    <div id="discoveryList"></div>
  </div>
  <div class="promo-bar" style="margin:12px 0 0"><div class="promo-title" id="resale-hero-title">🔄 Resale Hub</div><div class="promo-desc" id="resale-hero-desc">Not satisfied? Resell in our community marketplace — earn Ace Credits.</div><button class="resale-hero-btn" onclick="switchTab('resale')" id="resale-hero-btn">Browse Resale →</button></div>
</div>
</div></div>`;

if (html.includes(oldDiscovery)) {
  html = html.replace(oldDiscovery, newDiscovery);
  console.log('[3] Updated Discovery page with Smart Collection');
} else {
  console.log('[3] WARNING: Could not find old Discovery page, trying alternate match...');
  // Try matching with whitespace variations
  const discIdx = html.indexOf('<!-- DISCOVERY -->');
  if (discIdx > -1) {
    const endIdx = html.indexOf('<!-- ASSISTANT -->', discIdx);
    if (endIdx > -1) {
      html = html.substring(0, discIdx) + newDiscovery + html.substring(endIdx);
      console.log('[3] Replaced Discovery page via index matching');
    }
  }
}

// ========== 4. 添加 CSS 样式 ==========
const cssInsert = `
/* SMART COLLECTION */
.smart-collect-section{background:linear-gradient(135deg,#FFF7ED,#FEF3C7);border-radius:16px;padding:24px;margin-bottom:20px;border:1.5px dashed var(--o)}
.smart-collect-title{font-size:18px;font-weight:800;margin-bottom:4px;color:var(--g900)}
.smart-collect-sub{font-size:12px;color:var(--g500);margin-bottom:16px;line-height:1.5}
.smart-collect-input-wrap{display:flex;gap:8px;flex-wrap:wrap}
.smart-collect-input{flex:1;min-width:200px;padding:12px 16px;border:2px solid var(--g200);border-radius:12px;font-size:13px;outline:none;background:var(--w);font-family:inherit}
.smart-collect-input:focus{border-color:var(--o)}
.smart-collect-btn{padding:12px 24px;background:var(--o);color:var(--w);border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;transition:.15s;white-space:nowrap}
.smart-collect-btn:hover{background:#EA580C;transform:translateY(-1px)}
.smart-collect-notice{margin-top:16px;background:var(--w);border-radius:12px;padding:16px;border:1px solid var(--g200);display:flex;gap:12px;align-items:flex-start}
.smart-collect-notice .sc-notice-icon{font-size:28px;flex-shrink:0}
.smart-collect-notice .sc-notice-text{flex:1}
.smart-collect-notice .sc-notice-title{font-size:13px;font-weight:700;margin-bottom:8px;color:var(--g900)}
.smart-collect-notice .sc-notice-body{font-size:11px;color:var(--g700);line-height:1.7}
.smart-collect-notice .sc-notice-body div{margin-bottom:4px}

/* Smart Collect Results */
.sc-results-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;display:none;align-items:center;justify-content:center;padding:20px}
.sc-results-overlay.active{display:flex}
.sc-results-panel{background:var(--w);border-radius:16px;max-width:900px;width:100%;max-height:90vh;overflow-y:auto;padding:24px;position:relative}
.sc-results-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.sc-results-title{font-size:18px;font-weight:800}
.sc-results-close{background:none;border:none;font-size:24px;cursor:pointer;color:var(--g500)}
.sc-results-info{background:var(--g50);padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:12px}
.sc-match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.sc-match-card{background:var(--w);border-radius:12px;border:1.5px solid var(--g200);overflow:hidden;cursor:pointer;transition:.15s;position:relative}
.sc-match-card:hover{border-color:var(--o);box-shadow:0 4px 12px rgba(249,115,22,.15)}
.sc-match-img{width:100%;aspect-ratio:1;background:var(--g50);display:flex;align-items:center;justify-content:center;font-size:36px}
.sc-match-body{padding:12px}
.sc-match-name{font-size:12px;font-weight:700;margin-bottom:4px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sc-match-price{font-size:15px;font-weight:800;color:var(--r);margin-bottom:2px}
.sc-match-original{font-size:10px;color:var(--g500);text-decoration:line-through}
.sc-match-saving{display:inline-block;background:#F0FDF4;color:var(--g);padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800;margin-top:4px}
.sc-match-btn{width:100%;padding:8px;background:var(--o);color:var(--w);border:none;font-weight:700;font-size:11px;cursor:pointer;margin-top:8px;border-radius:0 0 10px 10px}

/* Logistics Tags */
.logistics-tags{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.logistics-tag{padding:2px 8px;border-radius:8px;font-size:9px;font-weight:600}
.lt-can{background:#F0FDF4;color:var(--g)}
.lt-extra{background:#FEF3C7;color:#B45309}
.lt-cant{background:#FEE2E2;color:var(--r)}
`;

// Insert CSS before </style>
html = html.replace('</style>', cssInsert + '\n</style>');
console.log('[4] Added Smart Collection CSS');

// ========== 5. 修改 Sourcing JS 对象 ==========
// 替换 Sourcing 对象，不显示货源平台
const oldSourcing = `/* ===== SOURCING: Paste Link -> Find Same -> Quick List ===== */
var Sourcing={`;
const newSourcing = `/* ===== SMART COLLECTION: Paste Link -> Find Matching -> List ===== */
var SmartCollect={
  parseUrl(url){
    try{
      var u=new URL(url);
      var host=u.hostname.toLowerCase();
      // Internal use only - do NOT expose to users
      if(host.includes('1688.com'))return{platform:'1688',icon:'🏭'};
      if(host.includes('taobao.com')||host.includes('tmall.com'))return{platform:'Taobao',icon:'🛑'};
      if(host.includes('jd.com')||host.includes('jingdong'))return{platform:'JD',icon:'🐕'};
      if(host.includes('pinduoduo.com')||host.includes('yangkeduo'))return{platform:'Pinduoduo',icon:'🛒'};
      if(host.includes('amazon'))return{platform:'Amazon',icon:'📦'};
      if(host.includes('shopee'))return{platform:'Shopee',icon:'🛍️'};
      if(host.includes('tiktok')||host.includes('douyin'))return{platform:'TikTok',icon:'🎵'};
      if(host.includes('lazada'))return{platform:'Lazada',icon:'🌏'};
      if(host.includes('aliexpress'))return{platform:'AliExpress',icon:'🌐'};
      return{platform:'Generic',icon:'🔗'};
    }catch(e){return{platform:'Generic',icon:'🔗'};}
  },
  checkLogistics(name, desc){
    // Returns logistics info
    var info={canShip:true,extraCost:false,warning:''};
    var lower=(name+' '+desc).toLowerCase();
    // Cannot ship
    if(lower.includes('battery')||lower.includes('baterai')||lower.includes('电池')){info.canShip=false;info.warning='Contains batteries - cannot ship via regular logistics';}
    if(lower.includes('flammable')||lower.includes('mudah terbakar')){info.canShip=false;info.warning='Flammable item - prohibited';}
    if(lower.includes('liquid')&&lower.includes('>100ml')){info.canShip=false;info.warning='Liquid >100ml - aviation restriction';}
    // Extra cost
    if(lower.includes('glass')||lower.includes('keramik')||lower.includes('fragile')){info.extraCost=true;info.warning='Fragile item - extra packaging cost (≈Rp 15,000)';}
    if(lower.includes('oversized')||lower.includes('furniture')||lower.includes('mebel')){info.extraCost=true;info.warning='Oversized - extra shipping cost';}
    return info;
  },
  search(){
    var url=document.getElementById('scInput').value.trim();
    if(!url){this.showToast('Please paste a product link first!','warning');return;}
    showToast('Searching for matching products...','info');
    setTimeout(function(){SmartCollect.showResults(url)},1200);
  },
  showResults(url){
    var info=this.parseUrl(url);
    var overlay=document.getElementById('scResultsOverlay');
    var infoEl=document.getElementById('scResultsInfo');
    var grid=document.getElementById('scMatchGrid');
    // Generate matches (do NOT show source platform to users)
    var matches=this.generateMatches();
    infoEl.innerHTML='<strong>🔗 Link analyzed.</strong> We found <strong>'+matches.length+'</strong> matching/similar products with competitive pricing. All items pass AI quality inspection.';
    grid.innerHTML=matches.map(function(m,i){
      var logistics=SmartCollect.checkLogistics(m.name,m.desc);
      var tags='<div class="logistics-tags">';
      if(!logistics.canShip){tags+='<span class="logistics-tag lt-cant">🚫 Cannot Ship</span>';}
      else if(logistics.extraCost){tags+='<span class="logistics-tag lt-extra">⚠️ Extra Shipping Cost</span>';}
      else{tags+='<span class="logistics-tag lt-can">✅ Can Ship</span>';}
      tags+='</div>';
      if(logistics.warning)tags+='<div style="font-size:10px;color:var(--g500);margin-top:4px">'+logistics.warning+'</div>';
      return '<div class="sc-match-card">'+
        '<div class="sc-match-img">'+m.icon+'</div>'+
        '<div class="sc-match-body">'+
        '<div class="sc-match-name">'+m.name+'</div>'+
        '<div class="sc-match-price">'+m.price+' <span class="sc-match-original">'+m.original+'</span></div>'+
        '<div class="sc-match-saving">▲ Save '+m.saving+'</div>'+
        tags+
        '</div>'+
        '<button class="sc-match-btn" onclick="SmartCollect.startListing('+i+')">Quick List</button>'+
        '</div>';
    }).join('');
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
  },
  generateMatches(){
    return[
      {name:'Premium Quality Match - Factory Direct',price:'Rp 85,000',original:'Rp 150,000',saving:'43%',icon:'🏠',desc:'cotton'},
      {name:'Same Style - Export Quality',price:'Rp 92,000',original:'Rp 160,000',saving:'42%',icon:'🏠',desc:''},
      {name:'OEM Equivalent - Vacuum Packed',price:'Rp 78,000',original:'Rp 145,000',saving:'46%',icon:'🏠',desc:'fragile'},
      {name:'Similar Item - Ready Stock',price:'Rp 95,000',original:'Rp 170,000',saving:'44%',icon:'🏠',desc:''},
      {name:'Alternative Match - Best Value',price:'Rp 88,000',original:'Rp 155,000',saving:'43%',icon:'🏠',desc:''},
      {name:'Comparable Item - Fast Ship',price:'Rp 98,000',original:'Rp 175,000',saving:'44%',icon:'🏠',desc:''}
    ];
  },
  closeResults(){
    document.getElementById('scResultsOverlay').classList.remove('active');
    document.body.style.overflow='';
  },
  startListing(matchIndex){
    this.closeResults();
    var overlay=document.getElementById('listingOverlay');
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
    var steps=[1,2,3,4,5];
    var delays=[800,1800,2800,3800,4800];
    var icons=['📸','📊','📦','🔍','✅'];
    var texts=['Analyzing product info...','Calculating price & margin...','Estimating logistics & delivery...','AI quality inspection...','Finalizing listing...'];
    steps.forEach(function(s,i){
      setTimeout(function(){
        document.querySelectorAll('.listing-step').forEach(function(el){el.classList.remove('active');});
        for(var j=1;j<s;j++){document.getElementById('ls-step-'+j).classList.add('done');}
        var stepEl=document.getElementById('ls-step-'+s);
        stepEl.classList.add('active');
        document.getElementById('listingAnimIcon').textContent=icons[i];
        document.getElementById('listingAnimText').textContent=texts[i];
      },delays[i]);
    });
    setTimeout(function(){
      document.getElementById('listingAnimIcon').textContent='🎉';
      document.getElementById('listingAnimText').textContent='Listing Complete!';
      document.getElementById('listingAnimSub').textContent='Your product is now live on Resale Hub. Buyers can see it immediately.';
      setTimeout(function(){
        overlay.classList.remove('active');
        document.body.style.overflow='';
        switchTab('resale');
        showToast('Product listed successfully!','success');
      },2000);
    },5800);
  },
  showToast(msg,type){var t=document.createElement('div');t.className='toast toast-'+type;t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2300)}
};

// Backward compatibility
var Sourcing=SmartCollect;
`;

html = html.replace(oldSourcing, newSourcing);
console.log('[5] Updated Sourcing JS to SmartCollect (hide platform from users)');

// ========== 6. 添加结果浮层 HTML ==========
const overlayInsert = `</div>
</div></div>

<!-- SMART COLLECTION RESULTS OVERLAY -->
<div class="sc-results-overlay" id="scResultsOverlay">
  <div class="sc-results-panel">
    <div class="sc-results-header">
      <div class="sc-results-title" id="sc-results-title">🔍 Matching Products Found</div>
      <button class="sc-results-close" onclick="SmartCollect.closeResults()">✕</button>
    </div>
    <div class="sc-results-info" id="scResultsInfo"></div>
    <div class="sc-match-grid" id="scMatchGrid"></div>
  </div>
</div>
`;

// Insert before the Notifications panel
html = html.replace('<!-- NOTIFICATION PANEL -->', overlayInsert + '\n<!-- NOTIFICATION PANEL -->');
console.log('[6] Added Smart Collection results overlay HTML');

// ========== 7. 添加翻译键 ==========
// EN
const enAdd = ',sc-title:"Smart Collection",sc-sub:"Paste ANY product link from any website. We\'ll intelligently find matching products, compare prices, and prepare listing for you.",sc-btn:"Find Matching Products",sc-logistics-title:"Logistics Compliance Notice",sc-logistics-body:"<div><strong>✅ Can Ship:</strong> Clothing, home goods, electronics (no battery), accessories, gifts, prayer items.</div><div><strong>⚠️ Extra Shipping Cost:</strong> Oversized items, fragile goods (glass/ceramic), liquid cosmetics (≤100ml only).</div><div><strong>🚫 Cannot Ship:</strong> Batteries (loose), flammable liquids, drugs, weapons, fresh food, live animals.</div>",sc-results-title:"Matching Products Found"';
// Insert into EN object
html = html.replace('"resale-hero-btn2":"📸 List an Item",', '"resale-hero-btn2":"📸 List an Item",' + enAdd + ',');

// ID
const idAdd = ',sc-title:"Smart Collection",sc-sub:"Tempel TAUUTA link produk dari website manapun. Kami akan menemukan produk yang cocok, bandingkan harga, dan siapkan listing untuk Anda.",sc-btn:"Cari Produk Serupa",sc-logistics-title:"Pemberitahuan Kepatuhan Logistik",sc-logistics-body:"<div><strong>✅ Bisa Dikirim:</strong> Pakaian, barang rumah, elektronik (tanpa baterai), aksesoris, hadiah, barang ibadah.</div><div><strong>⚠️ Biaya Tambahan:</strong> Barang berukuran besar, barang rapuh (kaca/keramik), kosmetik cair (≤100ml saja).</div><div><strong>🚫 Tidak Bisa Dikirim:</strong> Baterai (lepas), cairan mudah terbakar, narkoba, senjata, makanan segar, hewan hidup.</div>",sc-results-title:"Produk Serupa Ditemukan"';
html = html.replace('"resale-hero-btn2":"📸 Jual Barang",', '"resale-hero-btn2":"📸 Jual Barang",' + idAdd + ',');

// CN
const cnAdd = ',sc-title:"智能采集",sc-sub:"粘贴任意外网商品链接。我们将智能找货比价，为您准备上架。",sc-btn:"找同款",sc-logistics-title:"物流合规提示",sc-logistics-body:"<div><strong>✅ 可发货：</strong>服装、家居、电子产品（不含电池）、配饰、礼品、宗教用品。</div><div><strong>⚠️ 加钱发货：</strong>超大件、易碎品（玻璃/陶瓷）、液体化妆品（仅≤100ml）。</div><div><strong>🚫 不可发货：</strong>电池（散装）、易燃液体、毒品、武器、生鲜、活体动物。</div>",sc-results-title:"找到匹配商品"';
html = html.replace('"resale-hero-btn2":"📸 发布转卖",', '"resale-hero-btn2":"📸 发布转卖",' + cnAdd + ',');

console.log('[7] Added translation keys');

// Write back
fs.writeFileSync(path, html, 'utf8');
console.log('\n✅ All changes applied! Running acorn validation...');

// Validate JS
try {
  var acorn = require('acorn');
  var jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (jsMatch) {
    var js = jsMatch[1];
    acorn.parse(js, { ecmaVersion: 2022 });
    console.log('✅ JS syntax valid (acorn)');
  }
} catch (e) {
  console.error('❌ JS syntax error:', e.message);
}
