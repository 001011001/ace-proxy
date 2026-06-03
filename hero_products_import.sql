-- AceProxy Hero Products Import (Eid 2026 Jakarta Pilot)
-- Project Ref: jlifbzxuxhlcdkajagni

INSERT INTO ace_hero_products (id, name, category, source_price_cny, local_price_idr, arbitrage_gap_pct, status, patent_status) VALUES
('EP-2026-HJ01', 'Premium Silk Hijab - Emerald Green', 'Premium Hijabs', 35.00, 195000.00, 1.52, 'ACTIVE', 'CLEAN'),
('EP-2026-HJ02', 'Lace-Trimmed Gamis - Midnight Blue', 'Premium Hijabs', 88.00, 485000.00, 1.50, 'ACTIVE', 'CLEAN'),
('EP-2026-HJ03', 'Hand-Embroidered Pashmina', 'Premium Hijabs', 45.00, 250000.00, 1.53, 'ACTIVE', 'CLEAN'),
('EP-2026-HJ04', 'Linen Blend Abaya - Sand Beige', 'Premium Hijabs', 75.00, 420000.00, 1.54, 'ACTIVE', 'CLEAN'),
('EP-2026-SH01', 'Smart Aroma Diffuser V2 (App Controlled)', 'Smart Home Kits', 42.00, 285000.00, 2.08, 'ACTIVE', 'CLEAN'),
('EP-2026-SH02', 'UV-C Handheld Vacuum for Sofa', 'Smart Home Kits', 125.00, 850000.00, 2.09, 'ACTIVE', 'CLEAN'),
('EP-2026-SH03', 'Automatic Pet Feeder - Lite', 'Smart Home Kits', 95.00, 650000.00, 2.11, 'ACTIVE', 'CLEAN'),
('EP-2026-GB01', 'Lux Eid Gift Box - Velvet Finish', 'Exclusive Gift Boxes', 15.00, 125000.00, 2.79, 'ACTIVE', 'CLEAN'),
('EP-2026-GB02', 'Gold-Foiled Hamper Basket (Large)', 'Exclusive Gift Boxes', 22.00, 185000.00, 2.82, 'ACTIVE', 'CLEAN'),
('EP-2026-GB03', 'Collapsible Festive Gift Bag Set (10pcs)', 'Exclusive Gift Boxes', 8.50, 75000.00, 3.01, 'ACTIVE', 'CLEAN')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  category = EXCLUDED.category, 
  source_price_cny = EXCLUDED.source_price_cny, 
  local_price_idr = EXCLUDED.local_price_idr, 
  arbitrage_gap_pct = EXCLUDED.arbitrage_gap_pct, 
  status = EXCLUDED.status, 
  patent_status = EXCLUDED.patent_status;
