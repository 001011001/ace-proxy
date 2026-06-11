// migrate-schema.js — apply schema changes directly to SQLite
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, 'prisma/ace_proxy.db'));

const migrations = [
  // Add columns to existing tables (IF NOT EXISTS via try/catch)
  'ALTER TABLE ace_users ADD COLUMN last_login_at DATETIME',
  'ALTER TABLE ace_users ADD COLUMN referred_by TEXT',
  'ALTER TABLE ace_orders ADD COLUMN country TEXT',
  'ALTER TABLE ace_orders ADD COLUMN warehouse_id TEXT',
  'ALTER TABLE ace_orders ADD COLUMN loss_amount DECIMAL',
  'ALTER TABLE ace_vault_ledger ADD COLUMN loss_type TEXT',
  'ALTER TABLE ace_coupons ADD COLUMN country TEXT',
  'ALTER TABLE ace_coupons ADD COLUMN claimed_at DATETIME',
  'ALTER TABLE ace_coupons ADD COLUMN used_at DATETIME',
  'ALTER TABLE ace_products ADD COLUMN source_url TEXT',
  'ALTER TABLE ace_products ADD COLUMN supplier_id TEXT',
  // New tables
  `CREATE TABLE ace_product_localizations (
    id TEXT PRIMARY KEY, product_id TEXT, country TEXT, name TEXT, description TEXT,
    price_local DECIMAL, currency TEXT, shipping_cost DECIMAL,
    order_count INTEGER DEFAULT 0, rating_avg REAL DEFAULT 0, is_active INTEGER DEFAULT 0
  )`,
  `CREATE TABLE ace_logistics_nodes (
    id TEXT PRIMARY KEY, order_id TEXT, node TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    location TEXT, note TEXT
  )`,
  `CREATE TABLE ace_parcels (
    id TEXT PRIMARY KEY, order_id TEXT, order_item_id TEXT, weight REAL,
    status TEXT DEFAULT 'IN_TRANSIT_TO_WAREHOUSE', arrived_at DATETIME,
    qc_status TEXT, qc_images TEXT, warehouse_entry_at DATETIME, warehouse_exit_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE ace_qc_reports (
    id TEXT PRIMARY KEY, parcel_id TEXT, result TEXT DEFAULT 'PENDING',
    defects TEXT, images TEXT, operator_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE ace_refunds (
    id TEXT PRIMARY KEY, order_id TEXT, amount DECIMAL, reason TEXT,
    status TEXT DEFAULT 'PENDING', approver_id TEXT, approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE ace_consolidation_orders (
    id TEXT PRIMARY KEY, parcel_ids TEXT, destination TEXT, route_id TEXT,
    box_number TEXT UNIQUE, total_weight REAL, total_volume REAL,
    status TEXT DEFAULT 'CREATED', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

let ok = 0, skip = 0;
for (const sql of migrations) {
  try {
    db.exec(sql);
    ok++;
    const preview = sql.substring(0, 60).replace(/\n/g, ' ');
    console.log(`  ✅ ${preview}...`);
  } catch (e) {
    if (e.message.includes('duplicate column') || e.message.includes('already exists')) {
      skip++;
    } else {
      console.error(`  ❌ ${e.message.substring(0, 80)}`);
    }
  }
}

// Verify
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(`\n📊 Tables (${tables.length}):`, tables.map(t => t.name).join(', '));

db.close();
console.log(`\n✅ Done! Created: ${ok}, Skipped: ${skip}`);
