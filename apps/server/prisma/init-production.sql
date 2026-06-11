-- AceProxy 生产数据库建表 SQL (PostgreSQL)
-- 由 Prisma schema 手动转换，推到 Neon serverless PostgreSQL

-- 1. 用户表
CREATE TABLE IF NOT EXISTS ace_users (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  total_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  credits DECIMAL(12,2) NOT NULL DEFAULT 0,
  level VARCHAR(50) NOT NULL DEFAULT 'EXPLORER',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. 供应商表
CREATE TABLE IF NOT EXISTS ace_suppliers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avg_lead_time_hrs FLOAT,
  defect_rate FLOAT,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. 团长/指挥官表
CREATE TABLE IF NOT EXISTS ace_partners (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL REFERENCES ace_users(id),
  name VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.05,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  pending_settlement DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. 商品目录（通用电商商品表）
CREATE TABLE IF NOT EXISTS ace_products (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_product_id VARCHAR(64) UNIQUE REFERENCES ace_hero_products(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price_idr DECIMAL(12,2) NOT NULL,
  cost_cny DECIMAL(12,2),
  image_urls TEXT, -- JSON array string
  stock INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. CMS 爆款库
CREATE TABLE IF NOT EXISTS ace_hero_products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  source_price_cny DECIMAL(12,2),
  local_price_idr DECIMAL(12,2),
  arbitrage_gap_pct DECIMAL(5,2),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  patent_status VARCHAR(50) NOT NULL DEFAULT 'CLEAN',
  last_audit_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. 订单主表
CREATE TABLE IF NOT EXISTS ace_orders (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES ace_users(id),
  partner_id VARCHAR(64) REFERENCES ace_partners(id),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(12,2) NOT NULL,
  source_cost DECIMAL(12,2),
  shipping_fee DECIMAL(12,2),
  service_fee DECIMAL(12,2),
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  risk_pool_amount DECIMAL(12,2),
  compliance_audit_log TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. 订单明细表
CREATE TABLE IF NOT EXISTS ace_order_items (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(64) NOT NULL REFERENCES ace_orders(id),
  product_id VARCHAR(64) NOT NULL REFERENCES ace_products(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL
);

-- 8. 购物车
CREATE TABLE IF NOT EXISTS ace_cart_items (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL REFERENCES ace_users(id),
  product_id VARCHAR(64) NOT NULL REFERENCES ace_products(id),
  quantity INT NOT NULL DEFAULT 1,
  selected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. 用户地址簿
CREATE TABLE IF NOT EXISTS ace_user_addresses (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL REFERENCES ace_users(id),
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
);

-- 10. 商品评价
CREATE TABLE IF NOT EXISTS ace_product_reviews (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL REFERENCES ace_users(id),
  product_id VARCHAR(64) NOT NULL REFERENCES ace_products(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  images TEXT, -- JSON array string
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. 财务审计账本
CREATE TABLE IF NOT EXISTS ace_vault_ledger (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(64) NOT NULL REFERENCES ace_orders(id),
  account VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. AI 管家聊天存证
CREATE TABLE IF NOT EXISTS ace_order_chat (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(64) NOT NULL REFERENCES ace_orders(id),
  user_id VARCHAR(64) NOT NULL REFERENCES ace_users(id),
  role VARCHAR(50) NOT NULL,
  content_original TEXT NOT NULL,
  content_translated TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 13. 节日引擎配置
CREATE TABLE IF NOT EXISTS ace_holiday_config (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(64) NOT NULL,
  festival_name VARCHAR(255) NOT NULL,
  theme_id VARCHAR(64) NOT NULL,
  reminder_days INT NOT NULL DEFAULT 30,
  reminder_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 14. 全球收款配置
CREATE TABLE IF NOT EXISTS ace_payment_configs (
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
);

-- 15. 优惠券
CREATE TABLE IF NOT EXISTS ace_coupons (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- "FIXED" | "PERCENT"
  value DECIMAL(12,2) NOT NULL,
  min_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(12,2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  usage_limit INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ace_orders_user_id ON ace_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ace_orders_status ON ace_orders(status);
CREATE INDEX IF NOT EXISTS idx_ace_orders_partner_id ON ace_orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_ace_products_status ON ace_products(status);
CREATE INDEX IF NOT EXISTS idx_ace_products_category ON ace_products(category);
CREATE INDEX IF NOT EXISTS idx_ace_products_hero_product_id ON ace_products(hero_product_id);
CREATE INDEX IF NOT EXISTS idx_ace_order_items_order_id ON ace_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ace_order_items_product_id ON ace_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_ace_cart_items_user_id ON ace_cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_ace_cart_items_product_id ON ace_cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_ace_user_addresses_user_id ON ace_user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_ace_product_reviews_product_id ON ace_product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_ace_vault_ledger_account ON ace_vault_ledger(account);
CREATE INDEX IF NOT EXISTS idx_ace_holiday_config_station_id ON ace_holiday_config(station_id);

-- Prisma 迁移锁表
CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id VARCHAR(64) PRIMARY KEY,
  checksum VARCHAR(64) NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  migration_name VARCHAR(255) NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
