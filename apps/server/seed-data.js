// seed-data.js - 导入基础种子数据到 Neon PostgreSQL
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const users = [
  { id:'u-budi-001',    email:'budi@aceproxy.id',  password:'Password123', role:'USER',     totalSpend:2450000, level:'TRUSTED' },
  { id:'u-siti-002',    email:'siti@aceproxy.id',  password:'Password123', role:'USER',     totalSpend:1280000, level:'EXPLORER' },
  { id:'u-agus-003',    email:'agus@aceproxy.id',  password:'Password123', role:'PARTNER',  totalSpend:8750000, level:'VETERAN' },
  { id:'u-merchant-004', email:'merchant@aceproxy.id', password:'Password123', role:'MERCHANT', totalSpend:0,       level:'EXPLORER' },
];

const suppliers = [
  { id:'sup-taobao-001', name:'Taobao Collection', avgLeadTime:48, defectRate:0.02, status:'ACTIVE' },
  { id:'sup-1688-002',   name:'1688 Factory Direct', avgLeadTime:72, defectRate:0.015, status:'ACTIVE' },
];

const partners = [
  { id:'p-agus-001', userId:'u-agus-003', name:'Agus Store', inviteCode:'AGUS2026', commissionRate:0.05, balance:1250000, status:'ACTIVE' },
];

const heroProducts = [
  { id:'hp-001', name:'SK-II Facial Treatment Essence',     category:'beauty', sourcePriceCny:850,  localPriceIdr:1850000, arbitrageGapPct:0.31, status:'ACTIVE', patentStatus:'CLEAN' },
  { id:'hp-002', name:'L\'Oreal Paris Serum Worth It',       category:'beauty', sourcePriceCny:65,   localPriceIdr:185000,  arbitrageGapPct:0.45, status:'ACTIVE', patentStatus:'CLEAN' },
  { id:'hp-003', name:'Xiaomi Redmi Buds 6',                category:'electronics', sourcePriceCny:199,  localPriceIdr:450000,  arbitrageGapPct:0.42, status:'ACTIVE', patentStatus:'CLEAN' },
  { id:'hp-004', name:'Uniqlo AIRism 3-Pack',              category:'fashion', sourcePriceCny:99,   localPriceIdr:299000,  arbitrageGapPct:0.50, status:'ACTIVE', patentStatus:'CLEAN' },
  { id:'hp-005', name:'Philips Sonicare 3100',              category:'home', sourcePriceCny:299,  localPriceIdr:899000,  arbitrageGapPct:0.50, status:'ACTIVE', patentStatus:'CLEAN' },
];

const products = [
  { id:'prod-001', heroProductId:null, name:'SK-II Facial Treatment Essence 50ml',               description:'Imported from Japan via Taobao. Original SK-II essence.', category:'beauty',          priceIdr:1850000, costCny:850,  imageUrls:JSON.stringify(['https://ext.sk-ii.id/SK-II-FTE-50ml.jpg']),            stock:25, status:'ACTIVE', ratingAvg:4.8, ratingCount:1245 },
  { id:'prod-002', heroProductId:null, name:'L\'Oreal Worth It Serum 30ml',                      description:'Premium French serum. Hydrates deeply.',            category:'beauty',          priceIdr:185000,  costCny:65,   imageUrls:JSON.stringify(['https://ext.loreal.id/worth-it-30ml.jpg']),        stock:80, status:'ACTIVE', ratingAvg:4.6, ratingCount:892 },
  { id:'prod-003', heroProductId:null, name:'Xiaomi Redmi Buds 6 - White',                      description:'ANC, 42dB noise cancellation.',               category:'electronics',      priceIdr:450000,  costCny:199,  imageUrls:JSON.stringify(['https://ext.mi.com/redmi-buds6-w.jpg']),        stock:50, status:'ACTIVE', ratingAvg:4.5, ratingCount:2103 },
  { id:'prod-004', heroProductId:null, name:'Uniqlo AIRism Cotton 3-Pack (M)',                description:'Breathable, soft cotton. 3-pack.',              category:'fashion',          priceIdr:299000,  costCny:99,   imageUrls:JSON.stringify(['https://ext.uniqlo.id/airism-3pk-M.jpg']),        stock:120, status:'ACTIVE', ratingAvg:4.7, ratingCount:3421 },
  { id:'prod-005', heroProductId:null, name:'Philips Sonicare 3100 Electric Toothbrush',       description:'2-minute timer, pressure sensor.',             category:'home',             priceIdr:899000,  costCny:299,  imageUrls:JSON.stringify(['https://ext.philips.id/sonicare-3100.jpg']),      stock:35, status:'ACTIVE', ratingAvg:4.4, ratingCount:756 },
  { id:'prod-006', heroProductId:null, name:'Wardah Series Wardah Brightenning Essence 30ml',  description:'Indonesian halal beauty. Vitamin C.',            category:'beauty',          priceIdr:125000,  costCny:38,   imageUrls:JSON.stringify(['https://ext.wardah.id/brightenning-30ml.jpg']),    stock:200, status:'ACTIVE', ratingAvg:4.7, ratingCount:5432 },
  { id:'prod-007', heroProductId:null, name:'Samsung Galaxy A16 5G 6GB/128GB',               description:'Latest Samsung budget 5G smartphone.',          category:'electronics',      priceIdr:2499000, costCny:899,  imageUrls:JSON.stringify(['https://ext.samsung.id/galaxy-a16-5g.jpg']),     stock:15, status:'ACTIVE', ratingAvg:4.3, ratingCount:1876 },
  { id:'prod-008', heroProductId:null, name:'Baju Muslim Gamis Syar\'i (L)',                    description:'Modest wear for daily use. Cotton.',             category:'fashion',          priceIdr:275000,  costCny:85,   imageUrls:JSON.stringify(['https://ext.tokopedia.com/baju-muslim-gamis-L.jpg']), stock:60, status:'ACTIVE', ratingAvg:4.5, ratingCount:1298 },
  { id:'prod-009', heroProductId:null, name:'Mamypoko Pants M 40s',                            description:'Baby diaper pants. Japanese quality.',           category:'baby',             priceIdr:89000,   costCny:28,   imageUrls:JSON.stringify(['https://ext.mamypoko.id/pants-M-40s.jpg']),        stock:300, status:'ACTIVE', ratingAvg:4.8, ratingCount:8765 },
  { id:'prod-010', heroProductId:null, name:'Indomie Goreng 5pcs (Bumbu Original)',            description:'Indonesia\'s favorite instant noodles.',         category:'food',             priceIdr:12500,   costCny:5,    imageUrls:JSON.stringify(['https://ext.indomie.id/goreng-5pcs.jpg']),         stock:500, status:'ACTIVE', ratingAvg:4.9, ratingCount:23456 },
];

const orders = [
  { id:'ORD-2026-001', userId:'u-budi-001', partnerId:null,          status:'DELIVERED',  totalAmount:1850000, sourceCost:185000, shippingFee:15000, serviceFee:50000, commissionAmount:0,    riskPoolAmount:25000,  complianceAuditLog:'{"status":"PASS","checker":"AI","details":"No restricted keywords"}' },
  { id:'ORD-2026-002', userId:'u-siti-002', partnerId:'p-agus-001',  status:'PROCESSING', totalAmount:739000,  sourceCost:95000,  shippingFee:12000, serviceFee:25000, commissionAmount:36950, riskPoolAmount:15000,  complianceAuditLog:'{"status":"PASS","checker":"AI","details":"No restricted keywords"}' },
  { id:'ORD-2026-003', userId:'u-budi-001', partnerId:null,          status:'SHIPPED',    totalAmount:450000,  sourceCost:45000,  shippingFee:10000, serviceFee:15000, commissionAmount:0,    riskPoolAmount:10000,  complianceAuditLog:'{"status":"PASS","checker":"AI","details":"No restricted keywords"}' },
];

const orderItems = [
  { id:'oi-001', orderId:'ORD-2026-001', productId:'prod-001', quantity:1, unitPrice:1850000 },
  { id:'oi-002', orderId:'ORD-2026-002', productId:'prod-002', quantity:2, unitPrice:185000 },
  { id:'oi-003', orderId:'ORD-2026-002', productId:'prod-006', quantity:3, unitPrice:125000 },
  { id:'oi-004', orderId:'ORD-2026-003', productId:'prod-003', quantity:1, unitPrice:450000 },
];

const addresses = [
  { id:'addr-001', userId:'u-budi-001', label:'Home',  recipientName:'Budi Santoso',    phone:'081234567890', province:'DKI Jakarta',      city:'Jakarta Selatan', district:'Kebayoran Baru', postalCode:'12190', detail:'Jl. Soepomo No. 45', isDefault:true },
  { id:'addr-002', userId:'u-siti-002', label:'Office', recipientName:'Siti Nurhaliza',   phone:'082345678901', province:'Jawa Barat',      city:'Bandung',        district:'Coblong',       postalCode:'40132', detail:'Jl. Ganesha No. 10',  isDefault:true },
  { id:'addr-003', userId:'u-agus-003', label:'Home',  recipientName:'Agus Widodo',      phone:'083456789012', province:'Jawa Tengah',     city:'Surakarta',      district:'Banjarsari',    postalCode:'57136', detail:'Jl. Slamet Riyadi No. 88', isDefault:true },
];

const paymentConfigs = [
  { id:'pc-id-001', regionCode:'ID', providerName:'Xendit',  bankName:null,               accountNumber:null,             beneficiaryName:null,            status:'ACTIVE', isDefault:true },
  { id:'pc-id-002', regionCode:'ID', providerName:'Gopay',   bankName:null,               accountNumber:null,             beneficiaryName:null,            status:'ACTIVE', isDefault:false },
  { id:'pc-id-003', regionCode:'ID', providerName:'OVO',     bankName:null,               accountNumber:null,             beneficiaryName:null,            status:'ACTIVE', isDefault:false },
  { id:'pc-sg-001', regionCode:'SG', providerName:'Stripe',  bankName:'DBS Bank',          accountNumber:'1234567890',       beneficiaryName:'AceProxy Pte Ltd',  status:'ACTIVE', isDefault:true },
];

async function main() {
  const dbUrl = new URL(process.env.DATABASE_URL);
  const pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: dbUrl.port || 5432,
    database: dbUrl.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  console.log('🌱 开始导入基础种子数据...');

  // 1. 用户（密码统一 Password123）
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO ace_users (id, email, password_hash, role, total_spend, credits, level, created_at)
       VALUES ($1,$2,$3,$4,$5,0,$6,NOW()) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.email, hash, u.role, u.totalSpend, u.level]
    );
  }
  console.log(`  ✅ ace_users: ${users.length} 条`);

  // 2. 供应商
  for (const s of suppliers) {
    await pool.query(
      `INSERT INTO ace_suppliers (id, name, avg_lead_time_hrs, defect_rate, status, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (id) DO NOTHING`,
      [s.id, s.name, s.avgLeadTime, s.defectRate, s.status]
    );
  }
  console.log(`  ✅ ace_suppliers: ${suppliers.length} 条`);

  // 3. 团长
  for (const p of partners) {
    await pool.query(
      `INSERT INTO ace_partners (id, user_id, name, invite_code, commission_rate, balance, pending_settlement, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,0,$7,NOW()) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.userId, p.name, p.inviteCode, p.commissionRate, p.balance, p.status]
    );
  }
  console.log(`  ✅ ace_partners: ${partners.length} 条`);

  // 4. 爆款库
  for (const hp of heroProducts) {
    await pool.query(
      `INSERT INTO ace_hero_products (id, name, category, source_price_cny, local_price_idr, arbitrage_gap_pct, status, patent_status, last_audit_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) ON CONFLICT (id) DO NOTHING`,
      [hp.id, hp.name, hp.category, hp.sourcePriceCny, hp.localPriceIdr, hp.arbitrageGapPct, hp.status, hp.patentStatus]
    );
  }
  console.log(`  ✅ ace_hero_products: ${heroProducts.length} 条`);

  // 5. 商品
  for (const p of products) {
    await pool.query(
      `INSERT INTO ace_products (id, hero_product_id, name, description, category, price_idr, cost_cny, image_urls, stock, status, rating_avg, rating_count, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.heroProductId, p.name, p.description, p.category, p.priceIdr, p.costCny, p.imageUrls, p.stock, p.status, p.ratingAvg, p.ratingCount]
    );
  }
  console.log(`  ✅ ace_products: ${products.length} 条`);

  // 6. 订单
  for (const o of orders) {
    await pool.query(
      `INSERT INTO ace_orders (id, user_id, partner_id, status, total_amount, source_cost, shipping_fee, service_fee, commission_amount, risk_pool_amount, compliance_audit_log, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) ON CONFLICT (id) DO NOTHING`,
      [o.id, o.userId, o.partnerId, o.status, o.totalAmount, o.sourceCost, o.shippingFee, o.serviceFee, o.commissionAmount, o.riskPoolAmount, o.complianceAuditLog]
    );
  }
  console.log(`  ✅ ace_orders: ${orders.length} 条`);

  // 7. 订单明细
  for (const oi of orderItems) {
    await pool.query(
      `INSERT INTO ace_order_items (id, order_id, product_id, quantity, unit_price)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [oi.id, oi.orderId, oi.productId, oi.quantity, oi.unitPrice]
    );
  }
  console.log(`  ✅ ace_order_items: ${orderItems.length} 条`);

  // 8. 地址
  for (const a of addresses) {
    await pool.query(
      `INSERT INTO ace_user_addresses (id, user_id, label, recipient_name, phone, province, city, district, postal_code, detail, is_default, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) ON CONFLICT (id) DO NOTHING`,
      [a.id, a.userId, a.label, a.recipientName, a.phone, a.province, a.city, a.district, a.postalCode, a.detail, a.isDefault]
    );
  }
  console.log(`  ✅ ace_user_addresses: ${addresses.length} 条`);

  // 9. 支付配置
  for (const pc of paymentConfigs) {
    await pool.query(
      `INSERT INTO ace_payment_configs (id, region_code, provider_name, bank_name, account_number, beneficiary_name, status, is_default, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) ON CONFLICT (id) DO NOTHING`,
      [pc.id, pc.regionCode, pc.providerName, pc.bankName, pc.accountNumber, pc.beneficiaryName, pc.status, pc.isDefault]
    );
  }
  console.log(`  ✅ ace_payment_configs: ${paymentConfigs.length} 条`);

  await pool.end();
  console.log('\n✅ 基础种子数据导入完成！');
}

main().catch(console.error);
