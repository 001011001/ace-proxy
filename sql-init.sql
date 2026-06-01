CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'USER',
  total_spend DECIMAL(20, 2) DEFAULT 0,
  credits DECIMAL(20, 2) DEFAULT 0,
  level TEXT DEFAULT 'EXPLORER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING',
  total_amount DECIMAL(20, 2) NOT NULL,
  cost DECIMAL(20, 2),
  shipping DECIMAL(20, 2),
  risk_pool DECIMAL(20, 2),
  partner_commission DECIMAL(20, 2),
  platform_profit DECIMAL(20, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avg_lead_time_hrs DECIMAL(10, 2),
  defect_rate DECIMAL(5, 4),
  resale_rejection_rate DECIMAL(5, 4),
  status TEXT DEFAULT 'ACTIVE',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_banners (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);