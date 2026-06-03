-- AceProxy v1.0 Production Schema (Isolated)
-- Auditor: aceproxy-security-auditor
-- Scope: Jakarta Pilot 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户表 (与旧数据物理隔离)
CREATE TABLE IF NOT EXISTS ace_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'USER', -- USER, PARTNER, ADMIN
    total_spend DECIMAL(20, 2) DEFAULT 0,
    credits DECIMAL(20, 2) DEFAULT 0,
    level TEXT DEFAULT 'EXPLORER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 供应商表
CREATE TABLE IF NOT EXISTS ace_suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avg_lead_time_hrs DECIMAL(10, 2),
    defect_rate DECIMAL(5, 4),
    status TEXT DEFAULT 'ACTIVE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 订单主表
CREATE TABLE IF NOT EXISTS ace_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES ace_users(id),
    partner_id UUID, -- 关联团长/指挥官
    status TEXT DEFAULT 'PENDING',
    total_amount DECIMAL(20, 2) NOT NULL,
    source_cost DECIMAL(20, 2),
    shipping_fee DECIMAL(20, 2),
    service_fee DECIMAL(20, 2),
    commission_amount DECIMAL(20, 2) DEFAULT 0, -- 佣金数额
    risk_pool_amount DECIMAL(20, 2),
    compliance_audit_log JSONB, -- 存证不退货协议与 IP 审计
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 团长/指挥官表 (Commanders)
CREATE TABLE IF NOT EXISTS ace_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES ace_users(id),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL, -- 邀请码 (e.g. JKTA-001)
    commission_rate DECIMAL(5, 4) DEFAULT 0.0500, -- 佣金比例 (默认 5%)
    balance DECIMAL(20, 2) DEFAULT 0.00, -- 账户余额
    pending_settlement DECIMAL(20, 2) DEFAULT 0.00, -- 待结算总额
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ace_orders ADD CONSTRAINT fk_ace_orders_partner FOREIGN KEY (partner_id) REFERENCES ace_partners(id);

-- 4. 财务审计账本 (Vault Ledger)
CREATE TABLE IF NOT EXISTS ace_vault_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT REFERENCES ace_orders(id),
    account TEXT NOT NULL, -- RISK_POOL, PLATFORM_NET_PROFIT, etc.
    amount DECIMAL(20, 2) NOT NULL,
    entry_type TEXT NOT NULL, -- DEBIT, CREDIT
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI 管家聊天存证
CREATE TABLE IF NOT EXISTS ace_order_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL,
    user_id UUID REFERENCES ace_users(id),
    role TEXT NOT NULL, -- USER, SUPPLIER, STEWARD
    content_original TEXT NOT NULL,
    content_translated TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CMS 爆款库
CREATE TABLE IF NOT EXISTS ace_hero_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    source_price_cny DECIMAL(10, 2),
    local_price_idr DECIMAL(20, 2),
    arbitrage_gap_pct DECIMAL(5, 4),
    status TEXT DEFAULT 'ACTIVE',
    patent_status TEXT DEFAULT 'CLEAN',
    last_audit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ace_order_chat_order_id ON ace_order_chat(order_id);
CREATE INDEX idx_ace_vault_ledger_order_id ON ace_vault_ledger(order_id);

-- 7. 节日引擎配置 (Holiday Engine)
CREATE TABLE IF NOT EXISTS ace_holiday_config (
    id SERIAL PRIMARY KEY,
    station_id TEXT NOT NULL, -- 如 ID (雅加达)
    festival_name TEXT NOT NULL, -- 如 Eid 2026
    theme_id TEXT NOT NULL, -- UI 皮肤 ID
    reminder_days INTEGER DEFAULT 30, -- 提前多少天提醒备货
    reminder_message TEXT, -- 首页强制警告条文案
    is_active BOOLEAN DEFAULT FALSE, -- 老板是否点击“一键点火”
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 全球收款配置 (Multi-Region Payment Config)
CREATE TABLE IF NOT EXISTS ace_payment_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code TEXT NOT NULL, -- 如 ID, TH, MY
    provider_name TEXT NOT NULL, -- 如 WorldFirst, PingPong
    bank_name TEXT,
    account_number TEXT,
    beneficiary_name TEXT,
    status TEXT DEFAULT 'ACTIVE',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(region_code, provider_name)
);

INSERT INTO ace_holiday_config (station_id, festival_name, theme_id, reminder_days, reminder_message, is_active)
VALUES ('ID', 'Eid 2026', 'NEO_BRUTALISM_V1', 30, '⚠️ 备货提醒: 距离开斋节仅剩 30 天，请提前锁货避免延误！', TRUE);
