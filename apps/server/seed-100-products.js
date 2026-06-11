// seed-100-products.js - 100个印尼热销品（真实品类 + 真实价格区间）
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const products = [
  // ===== 智能手机 & 配件 (15个) =====
  { name: 'Xiaomi Redmi Note 13 8/256GB Abyss Blue', priceIdr: 2499000, costCny: 1150, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbka-ljxz9k4w8oi8a' },
  { name: 'Xiaomi Redmi Note 13 8/256GB Arctic White', priceIdr: 2499000, costCny: 1150, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbkb-ljxz9k4w8oi9b' },
  { name: 'OPPO A78 8GB/256GB Glowing Black', priceIdr: 2899000, costCny: 1250, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbjx-ljxz9k4w8og3a' },
  { name: 'Samsung Galaxy A55 5G 12GB/256GB Navy', priceIdr: 5299000, costCny: 2100, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbl5-ljxz9k4w8ok2a' },
  { name: 'iPhone 15 128GB Black (Resmi iBox)', priceIdr: 13999000, costCny: 5200, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbm3-ljxz9k4w8ol1a' },
  { name: 'Vivo V30 5G 12GB/512GB Bloom White', priceIdr: 5499000, costCny: 2200, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbn1-ljxz9k4w8om5a' },
  { name: 'Realme C67 8GB/256GB Sunny Oasis', priceIdr: 2299000, costCny: 950, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbp2-ljxz9k4w8on4a' },
  { name: 'POCO X6 Pro 5G 12GB/512GB Black', priceIdr: 4799000, costCny: 1900, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbq3-ljxz9k4w8oo6a' },
  { name: 'Infinix HOT 40i 8GB/256GB Palm Blue', priceIdr: 1699000, costCny: 700, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbr4-ljxz9k4w8op7a' },
  { name: 'Samsung Galaxy S24 Ultra 256GB Titanium Black', priceIdr: 19999000, costCny: 7500, cat: 'smartphones', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbs5-ljxz9k4w8oq8a' },
  { name: 'Charger Kabel USB Type-C Cepat 3A Fast Charging', priceIdr: 35000, costCny: 8, cat: 'accessories', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbt1-ljxz9k4w8or1a' },
  { name: 'Anti Gores Tempered Glass Xiaomi Redmi Note 13', priceIdr: 25000, costCny: 5, cat: 'accessories', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbu2-ljxz9k4w8os2a' },
  { name: 'Casing HP Transparan Anti Bentur iPhone 15', priceIdr: 45000, costCny: 10, cat: 'accessories', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbv3-ljxz9k4w8ot3a' },
  { name: 'Power Bank 20000mAh 22.5W Fast Charging', priceIdr: 185000, costCny: 65, cat: 'accessories', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbw4-ljxz9k4w8ou4a' },
  { name: 'Bluetooth Earphone TWS ANC Noise Cancelling', priceIdr: 325000, costCny: 110, cat: 'accessories', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbx5-ljxz9k4w8ov5a' },

  // ===== Skincare & 美妆 (20个) =====
  { name: 'Wardah Crystallure Serum Essence 30ml', priceIdr: 125000, costCny: 38, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rby1-ljxz9k4w8ow6a' },
  { name: 'Wardah Crystallure Cleanser Foam 100ml', priceIdr: 89000, costCny: 28, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rbz2-ljxz9k4w8ox7a' },
  { name: 'Skintific 5X Ceramide Moisturizer 35gr', priceIdr: 189000, costCny: 55, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc01-ljxz9k4w8oy8a' },
  { name: 'Skintific Acne Wash 100ml', priceIdr: 125000, costCny: 38, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc12-ljxz9k4w8oz9a' },
  { name: 'Somethinc Azelaic Acid 10% 30ml', priceIdr: 135000, costCny: 42, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc23-ljxz9k4w8p10a' },
  { name: 'The Originote Hanasui Toner 100ml', priceIdr: 69000, costCny: 22, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc34-ljxz9k4w8p11a' },
  { name: 'Avoskin Your Skin Bae Serum 30ml', priceIdr: 159000, costCny: 48, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc45-ljxz9k4w8p12a' },
  { name: 'Emina Bright Stuff Moisturizer 40ml', priceIdr: 79000, costCny: 25, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc56-ljxz9k4w8p13a' },
  { name: 'Sunscreen Azelaic Acid 10% SPF 35 PA+++', priceIdr: 125000, costCny: 38, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc67-ljxz9k4w8p14a' },
  { name: 'Facelle Soft Facial Tissue 100 Sheets x 40 pcs', priceIdr: 42000, costCny: 15, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc78-ljxz9k4w8p15a' },
  { name: 'Lipstik Scarlett Infinity Liquid Lip Color 4gr', priceIdr: 89000, costCny: 28, cat: 'makeup', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc89-ljxz9k4w8p16a' },
  { name: 'Eyeliner Pensil Waterproof Rinzz 1.2gr', priceIdr: 35000, costCny: 12, cat: 'makeup', img: 'https://cf.shopee.co.id/file/sg-11134201-7rc90-ljxz9k4w8p17a' },
  { name: 'Bedak Padat Wardah Colorfit 10gr', priceIdr: 75000, costCny: 24, cat: 'makeup', img: 'https://cf.shopee.co.id/file/sg-11134201-7rca1-ljxz9k4w8p18a' },
  { name: 'Kutek PYN Nail Polish 8ml - 12 Warna', priceIdr: 25000, costCny: 8, cat: 'makeup', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcb2-ljxz9k4w8p19a' },
  { name: 'Pembersih Makeup Micellar Water 200ml', priceIdr: 45000, costCny: 15, cat: 'makeup', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcc3-ljxz9k4w8p20a' },
  { name: 'Masker Wajah Kleibell Charcoal 25ml x 10pcs', priceIdr: 35000, costCny: 12, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcd4-ljxz9k4w8p21a' },
  { name: 'Sabun Wajah Cetaphil Gentle Cleanser 125ml', priceIdr: 145000, costCny: 45, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rce5-ljxz9k4w8p22a' },
  { name: 'Vitamin C Serum 20% 30ml - Brightening', priceIdr: 89000, costCny: 28, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcf6-ljxz9k4w8p23a' },
  { name: 'Hand Body Lotion Vaseline 400ml - Aloe Vera', priceIdr: 55000, costCny: 18, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcg7-ljxz9k4w8p24a' },
  { name: 'Sabun Mandi Lifebuoy 850ml - Total 10', priceIdr: 35000, costCny: 12, cat: 'skincare', img: 'https://cf.shopee.co.id/file/sg-11134201-7rch8-ljxz9k4w8p25a' },

  // ===== 穆斯林服饰 (10个) =====
  { name: 'Hijab Instant SegiEmpat Katun Jepang - 10 Warna', priceIdr: 85000, costCny: 25, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rci1-ljxz9k4w8p26a' },
  { name: 'Gamis Muslimah Syar\'i Katun Rayon - Baju Lebaran', priceIdr: 225000, costCny: 68, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcj2-ljxz9k4w8p27a' },
  { name: 'Koko Baju Koko Pria Dewasa - Bordir Premium', priceIdr: 185000, costCny: 55, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rck3-ljxz9k4w8p28a' },
  { name: 'Hijab Pashmina Premium - 12 Warna Pilihan', priceIdr: 65000, costCny: 20, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcl4-ljxz9k4w8p29a' },
  { name: 'Mukena Travel Premium - Bordir Cantik', priceIdr: 195000, costCny: 58, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcm5-ljxz9k4w8p30a' },
  { name: 'Gamis Anak Muslim - Katun Halus Usia 5-12th', priceIdr: 135000, costCny: 42, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcn6-ljxz9k4w8p31a' },
  { name: 'Hijab Instan Magnetic - Praktis Pakai', priceIdr: 55000, costCny: 18, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rco7-ljxz9k4w8p32a' },
  { name: 'Seragam Sekolah Muslim - Hem + Celana Panjang', priceIdr: 165000, costCny: 50, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcp8-ljxz9k4w8p33a' },
  { name: 'Kaos Polo Pria Lengan Pendek - Cotton Combed', priceIdr: 75000, costCny: 24, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcq9-ljxz9k4w8p34a' },
  { name: 'Celana Jeans Pria - Regular Fit Dark Blue', priceIdr: 145000, costCny: 45, cat: 'muslim_fashion', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcr0-ljxz9k4w8p35a' },

  // ===== 母婴 & 育儿 (10个) =====
  { name: 'Popok Dewasa/Security Pant MamyPoko Pants L54', priceIdr: 145000, costCny: 42, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcs1-ljxz9k4w8p36a' },
  { name: 'Susu Formula Bubuk Formula Morinaga 800gr', priceIdr: 295000, costCny: 85, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rct2-ljxz9k4w8p37a' },
  { name: 'Dot Botol Susu Silicone - Slow Flow 2pcs', priceIdr: 35000, costCny: 12, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcu3-ljxz9k4w8p38a' },
  { name: 'Baju Bayi Set Baju Buddies 3pc - 0-24 Bulan', priceIdr: 89000, costCny: 28, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcv4-ljxz9k4w8p39a' },
  { name: 'Mainan Bayi Gantungan Kasur - Musik & Cahaya', priceIdr: 65000, costCny: 20, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcw5-ljxz9k4w8p40a' },
  { name: 'Botol Susu Bayi Anti Colic 250ml - Kaca', priceIdr: 125000, costCny: 38, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcx6-ljxz9k4w8p41a' },
  { name: 'Tisu Basah Bayi Alcohol Free 80 lembar x 6', priceIdr: 35000, costCny: 12, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcy7-ljxz9k4w8p42a' },
  { name: 'Teether Mainan Gigitan Silicone Bayi - 3 Bulan+', priceIdr: 45000, costCny: 15, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rcz8-ljxz9k4w8p43a' },
  { name: 'Susu Formula Fortifikasi - Serbuk 400gr', priceIdr: 185000, costCny: 55, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd01-ljxz9k4w8p44a' },
  { name: 'Stroller Kereta Dorong Bayi - Foldable Ringan', priceIdr: 750000, costCny: 220, cat: 'baby', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd12-ljxz9k4w8p45a' },

  // ===== 家居 & 厨房 (15个) =====
  { name: 'Magic Com Rice Cooker 1.8L - Multifungsi', priceIdr: 325000, costCny: 95, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd23-ljxz9k4w8p46a' },
  { name: 'Blender Philips 2-in-1 - Juicer + Chopper', priceIdr: 485000, costCny: 140, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd34-ljxz9k4w8p47a' },
  { name: 'Panci Elektrik Hotpot 2.5L - BBQ & Sup', priceIdr: 225000, costCny: 68, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd45-ljxz9k4w8p48a' },
  { name: 'Toples Plastik Kedap Udara 1200ml x 6 pcs', priceIdr: 85000, costCny: 25, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd56-ljxz9k4w8p49a' },
  { name: 'Sapu Lidi Ijuk - Alat Kebersihan Rumah', priceIdr: 35000, costCny: 12, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd67-ljxz9k4w8p50a' },
  { name: 'Sikat Lantai Stik Panjang - Ember Tekan', priceIdr: 65000, costCny: 20, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd78-ljxz9k4w8p51a' },
  { name: 'Selimut Electric Blanket - Hangat AC 2 Speed', priceIdr: 185000, costCny: 55, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd89-ljxz9k4w8p52a' },
  { name: 'Lampu LED E27 9W - Putih & Kuning 10pcs', priceIdr: 55000, costCny: 18, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rd90-ljxz9k4w8p53a' },
  { name: 'Kabel Extension 3 Lubang 3 Meter - Amphibi', priceIdr: 75000, costCny: 24, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rda1-ljxz9k4w8p54a' },
  { name: 'Kipas Angin Meja Berdiri - 5 Speed + Timer', priceIdr: 285000, costCny: 85, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdb2-ljxz9k4w8p55a' },
  { name: 'Cooking Apron Anti Air - Dapur Mandi Lipat', priceIdr: 45000, costCny: 15, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdc3-ljxz9k4w8p56a' },
  { name: 'Piring Keramik Makan 22cm - Motif Bunga', priceIdr: 35000, costCny: 12, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdd4-ljxz9k4w8p57a' },
  { name: 'Tempat Sampah Tong Sampah 30L - Pedal', priceIdr: 125000, costCny: 38, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rde5-ljxz9k4w8p58a' },
  { name: 'Gantungan Baju Besi - Rail Mounting 10 Hooks', priceIdr: 55000, costCny: 18, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdf6-ljxz9k4w8p59a' },
  { name: 'Korden Jendela Gorden Blackout 100x200cm', priceIdr: 85000, costCny: 25, cat: 'home', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdg7-ljxz9k4w8p60a' },

  // ===== 食品 & 饮料 (10个) =====
  { name: 'Indomie Kuah Rasa Mi Goreng 70gr x 40 pcs', priceIdr: 95000, costCny: 30, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdh1-ljxz9k4w8p61a' },
  { name: 'Kopi Instan Torabika Cappuccino 30 sachet', priceIdr: 55000, costCny: 18, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdi2-ljxz9k4w8p62a' },
  { name: 'Teh Botol Sosro 350ml x 24 botol', priceIdr: 75000, costCny: 24, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdj3-ljxz9k4w8p63a' },
  { name: 'Biskuit Marie Regal 1kg - Snack Diet', priceIdr: 45000, costCny: 15, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdk4-ljxz9k4w8p64a' },
  { name: 'Minyak Goreng Bimoli 2L - Refill Pouch', priceIdr: 35000, costCny: 12, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdl5-ljxz9k4w8p65a' },
  { name: 'Gula Pasir 1kg - Kemasan Premium', priceIdr: 18000, costCny: 7, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdm6-ljxz9k4w8p66a' },
  { name: 'Tepung Terigu Segitiga Biru 1kg', priceIdr: 15000, costCny: 6, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdn7-ljxz9k4w8p67a' },
  { name: 'Susu Kental Manis Frisian Flag 370gr', priceIdr: 22000, costCny: 8, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdo8-ljxz9k4w8p68a' },
  { name: 'Kecap Manis Bango 600ml - Botol Kaca', priceIdr: 28000, costCny: 10, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdp9-ljxz9k4w8p69a' },
  { name: 'Air Mineral Galon Aqua 19L - Isi Ulang', priceIdr: 25000, costCny: 9, cat: 'food', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdq0-ljxz9k4w8p70a' },

  // ===== 文具 & 办公 (10个) =====
  { name: 'Pulpen Pilot G2 0.7mm - 12 Warna Pilihan', priceIdr: 25000, costCny: 8, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdr1-ljxz9k4w8p71a' },
  { name: 'Buku Tulis Random 38 Lembar x 10 buah', priceIdr: 25000, costCny: 8, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rds2-ljxz9k4w8p72a' },
  { name: 'Tipe-X/Penghapus Pensil Staedtler 2pcs', priceIdr: 15000, costCny: 5, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdt3-ljxz9k4w8p73a' },
  { name: 'Map Plastik Snellhecter A4 10pcs - Warna', priceIdr: 35000, costCny: 12, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdu4-ljxz9k4w8p74a' },
  { name: 'Kertas HVS A4 70gsm 500 lembar - Sinar Dunia', priceIdr: 65000, costCny: 20, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdv5-ljxz9k4w8p75a' },
  { name: 'Sticky Notes Post-it 76x76mm 100 lembar', priceIdr: 15000, costCny: 5, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdw6-ljxz9k4w8p76a' },
  { name: 'Tas Sekolah Motif Animasi - Anti Air', priceIdr: 125000, costCny: 38, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdx7-ljxz9k4w8p77a' },
  { name: 'Spidol Whiteboard Permanen 4pcs - Warna', priceIdr: 25000, costCny: 8, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdy8-ljxz9k4w8p78a' },
  { name: 'Kalkulator Sains Scientific - 240 Fungsi', priceIdr: 65000, costCny: 20, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7rdz9-ljxz9k4w8p79a' },
  { name: 'Pensil 2B/2H - Set Menggambar 12pcs', priceIdr: 18000, costCny: 6, cat: 'stationery', img: 'https://cf.shopee.co.id/file/sg-11134201-7re01-ljxz9k4w8p80a' },

  // ===== 运动 & 户外 (10个) =====
  { name: 'Sepatu Sneakers Pria Wanita - White Casual', priceIdr: 225000, costCny: 68, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re12-ljxz9k4w8p81a' },
  { name: 'Tas Ransel Outdoor Hiking - 40L Waterproof', priceIdr: 185000, costCny: 55, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re23-ljxz9k4w8p82a' },
  { name: 'Matras Yoga / Fitness 10mm - Anti Slip', priceIdr: 95000, costCny: 30, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re34-ljxz9k4w8p83a' },
  { name: 'Dumbbell Set 20kg - Adjustable Weight', priceIdr: 350000, costCny: 105, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re45-ljxz9k4w8p84a' },
  { name: 'Bola Sepak Bersertifikat FIFA - Size 5', priceIdr: 125000, costCny: 38, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re56-ljxz9k4w8p85a' },
  { name: 'Baju Renang Wanita - Full Body Syar\'i', priceIdr: 155000, costCny: 48, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re67-ljxz9k4w8p86a' },
  { name: 'Sepatu Lari Nike Air Zoom Pegasus - Original', priceIdr: 1250000, costCny: 380, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re78-ljxz9k4w8p87a' },
  { name: 'Botol Minum Olahraga 1L - Tritan BPA Free', priceIdr: 45000, costCny: 15, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re89-ljxz9k4w8p88a' },
  { name: 'Flying Disc / Lempar Cakram - Family Fun', priceIdr: 35000, costCny: 12, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7re90-ljxz9k4w8p89a' },
  { name: 'Jump Rope Tali Lompat Kapower - Counter', priceIdr: 55000, costCny: 18, cat: 'sports', img: 'https://cf.shopee.co.id/file/sg-11134201-7rea1-ljxz9k4w8p90a' },
];

async function main() {
  const pool = new Pool({
    host: 'ep-wispy-shape-aj90qiwn-pooler.c-3.us-east-2.aws.neon.tech',
    port: 5432,
    database: 'neondb',
    user: 'neondb_owner',
    password: 'npg_QF1UiIwB5tLx',
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  console.log(`🛍️  准备导入 ${products.length} 个印尼热销品...`);

  let ok = 0, skip = 0, err = 0;
  for (const p of products) {
    try {
      const sourceUrl = `https://shopee.co.id/product/${Math.random().toString(36).slice(2, 12)}`;
      await pool.query(`
        INSERT INTO ace_products (
          id, source_url, image_urls, name, price_idr, cost_cny,
          category, status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'active', NOW(), NOW()
        )
        ON CONFLICT (source_url) DO NOTHING
      `, [
        sourceUrl,
        JSON.stringify([p.img]),
        p.name,
        p.priceIdr,
        p.costCny,
        p.cat,
      ]);
      ok++;
      const margin = Math.round((1 - (p.costCny * 2200) / p.priceIdr) * 100);
      console.log(`  ✅ [${ok}] ${p.name.substring(0, 50)}... (margin ~${margin}%)`);
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('ON CONFLICT')) {
        skip++;
      } else {
        err++;
        console.error(`  ❌ ${p.name.substring(0, 30)}: ${e.message.substring(0, 80)}`);
      }
    }
  }

  await pool.end();
  console.log(`\n✅ 完成！导入: ${ok}, 跳过: ${skip}, 错误: ${err}, 总计: ${products.length}`);
}

main().catch(console.error);
