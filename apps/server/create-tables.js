// create-tables.js - 直接在 Neon 上建表，逐条执行并报告错误
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const sqls = [
  `CREATE TABLE IF NOT EXISTS ace_users (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    total_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
    credits DECIMAL(12,2) NOT NULL DEFAULT 0,
    level VARCHAR(50) NOT NULL DEFAULT 'EXPLORER',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_suppliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avg_lead_time_hrs FLOAT,
    defect_rate FLOAT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_partners (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.05,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    pending_settlement DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_hero_products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    source_price_cny DECIMAL(12,2),
    local_price_idr DECIMAL(12,2),
    arbitrage_gap_pct DECIMAL(5,2),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    patent_status VARCHAR(50) NOT NULL DEFAULT 'CLEAN',
    last_audit_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_products (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_product_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_idr DECIMAL(12,2) NOT NULL,
    cost_cny DECIMAL(12,2),
    image_urls TEXT,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
    rating_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    partner_id VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(12,2) NOT NULL,
    source_cost DECIMAL(12,2),
    shipping_fee DECIMAL(12,2),
    service_fee DECIMAL(12,2),
    commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    risk_pool_amount DECIMAL(12,2),
    compliance_audit_log TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_order_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ace_cart_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_user_addresses (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    label VARCHAR(50),
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    province VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    detail TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_product_reviews (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    images TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_vault_ledger (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(64) NOT NULL,
    account VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    entry_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_order_chat (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content_original TEXT NOT NULL,
    content_translated TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_holiday_config (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(64) NOT NULL,
    festival_name VARCHAR(255) NOT NULL,
    theme_id VARCHAR(64) NOT NULL,
    reminder_days INT NOT NULL DEFAULT 30,
    reminder_message TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS ace_payment_configs (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(20) NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(255),
    beneficiary_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(region_code, provider_name)
  )`,
  `CREATE TABLE IF NOT EXISTS ace_coupons (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    min_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_discount DECIMAL(12,2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    usage_limit INT NOT NULL DEFAULT 1,
    used_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id VARCHAR(64) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
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
    max: 3,
  });

  console.log(`📦 开始建表，共 ${sqls.length} 条...`);
  let ok = 0, skip = 0, err = 0;

  for (let i = 0; i < sqls.length; i++) {
    const sql = sqls[i];
    const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || `#${i+1}`;
    try {
      await pool.query(sql);
      ok++;
      console.log(`  ✅ [${ok}] ${name}`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        skip++;
        console.log(`  ⏭️  [skip] ${name} already exists`);
      } else {
        err++;
        console.error(`  ❌ [${i+1}] ${name}: ${e.message}`);
      }
    }
  }

  // 外键约束（分开执行，避免顺序问题）
  const fks = [
    `ALTER TABLE ace_partners ADD CONSTRAINT fk_partner_user FOREIGN KEY (user_id) REFERENCES ace_users(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_orders ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES ace_users(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_orders ADD CONSTRAINT fk_order_partner FOREIGN KEY (partner_id) REFERENCES ace_partners(id) ON DELETE SET NULL`,
    `ALTER TABLE ace_order_items ADD CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES ace_orders(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_order_items ADD CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES ace_products(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_cart_items ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES ace_users(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_cart_items ADD CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES ace_products(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_user_addresses ADD CONSTRAINT fk_addr_user FOREIGN KEY (user_id) REFERENCES ace_users(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_product_reviews ADD CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES ace_users(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_product_reviews ADD CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES ace_products(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_vault_ledger ADD CONSTRAINT fk_ledger_order FOREIGN KEY (order_id) REFERENCES ace_orders(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_order_chat ADD CONSTRAINT fk_chat_order FOREIGN KEY (order_id) REFERENCES ace_orders(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_order_chat ADD CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES ace_users(id) ON DELETE CASCADE`,
    `ALTER TABLE ace_products ADD CONSTRAINT fk_product_hero FOREIGN KEY (hero_product_id) REFERENCES ace_hero_products(id) ON DELETE SET NULL`,
  ];

  console.log(`\n🔗 开始加外键约束，共 ${fks.length} 条...`);
  for (let i = 0; i < fks.length; i++) {
    try {
      await pool.query(fks[i]);
      console.log(`  ✅ FK [${i+1}] ok`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log(`  ⏭️  FK [${i+1}] already exists`);
      } else {
        console.error(`  ❌ FK [${i+1}]: ${e.message}`);
      }
    }
  }

  await pool.end();
  console.log(`\n✅ 完成！建表: ${ok}, 跳过: ${skip}, 错误: ${err}`);
}

main().catch(console.error);
