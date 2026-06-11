// seed-sqlite.js — seed 100 Indonesian hot products into SQLite
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'prisma/ace_proxy.db'));

db.exec('DELETE FROM ace_order_items');
db.exec('DELETE FROM ace_cart_items');
db.exec('DELETE FROM ace_product_reviews');
db.exec('DELETE FROM ace_products');
db.exec('DELETE FROM sqlite_sequence');

const products = [
  { name:'Xiaomi Redmi Note 13 8/256GB',priceIdr:2499000,costCny:1150,cat:'smartphones',rating:4.7,rv:328,img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',desc:'Best seller smartphone Indonesia' },
  { name:'Samsung Galaxy A55 5G 12GB/256GB',priceIdr:5299000,costCny:2100,cat:'smartphones',rating:4.8,rv:512,img:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',desc:'Flagship-killer mid-range phone' },
  { name:'OPPO A78 8GB/256GB Glowing Black',priceIdr:2899000,costCny:1250,cat:'smartphones',rating:4.5,rv:245,img:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',desc:'Budget 5G phone for Indonesia' },
  { name:'iPhone 15 128GB Black',priceIdr:14999000,costCny:5800,cat:'smartphones',rating:4.9,rv:890,img:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',desc:'Premium Apple iPhone imported' },
  { name:'Vivo Y36 8GB/256GB',priceIdr:2399000,costCny:980,cat:'smartphones',rating:4.4,rv:189,img:'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',desc:'Budget-friendly everyday phone' },
  { name:'Infinix HOT 40 Pro 8GB/256GB',priceIdr:1899000,costCny:720,cat:'smartphones',rating:4.3,rv:156,img:'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400',desc:'Ultra-budget gaming phone' },
  { name:'Realme C67 8GB/128GB',priceIdr:1799000,costCny:650,cat:'smartphones',rating:4.2,rv:98,img:'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400',desc:'Entry-level smartphone' },
  { name:'Samsung Galaxy S24 Ultra',priceIdr:21999000,costCny:8500,cat:'smartphones',rating:4.9,rv:1200,img:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',desc:'Best Android flagship 2024' },
  { name:'Xiaomi Poco X6 Pro 12GB/512GB',priceIdr:4299000,costCny:1800,cat:'smartphones',rating:4.6,rv:445,img:'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',desc:'Performance beast at mid price' },
  { name:'Tecno Spark 20 Pro 8GB/256GB',priceIdr:1599000,costCny:580,cat:'smartphones',rating:4.1,rv:67,img:'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400',desc:'Affordable entry phone' },

  { name:'Wardah Lightening Serum Ampoule',priceIdr:45000,costCny:18,cat:'skincare',rating:4.8,rv:1560,img:'https://images.unsplash.com/photo-1570194065650-d99fb4ee8b22?w=400',desc:'Indonesia #1 whitening serum' },
  { name:'Somethinc Niacinamide Serum',priceIdr:89000,costCny:35,cat:'skincare',rating:4.7,rv:2340,img:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',desc:'Viral skincare on TikTok Indonesia' },
  { name:'Skintific 5X Ceramide Moisturizer',priceIdr:135000,costCny:52,cat:'skincare',rating:4.9,rv:3200,img:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400',desc:'Ceramide barrier repair cream' },
  { name:'Scarlett Whitening Body Lotion',priceIdr:75000,costCny:28,cat:'skincare',rating:4.6,rv:8900,img:'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400',desc:'Best-selling body whitening lotion' },
  { name:'MSH Niacinamide Brightening Moisturizer',priceIdr:65000,costCny:24,cat:'skincare',rating:4.5,rv:1200,img:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',desc:'Affordable brightening cream' },
  { name:'The Originote Hyaluronic Serum',priceIdr:35000,costCny:12,cat:'skincare',rating:4.4,rv:890,img:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',desc:'Budget hyaluronic acid serum' },
  { name:'Azarine Hydrasoothe Sunscreen SPF45',priceIdr:55000,costCny:20,cat:'skincare',rating:4.7,rv:2100,img:'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',desc:'Lightweight daily sunscreen gel' },
  { name:'Avoskin Your Skin Bae Vitamin C',priceIdr:169000,costCny:68,cat:'skincare',rating:4.8,rv:1800,img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',desc:'Premium Indonesian vitamin C serum' },
  { name:'Glad2Glow Centella Asiatica Serum',priceIdr:49000,costCny:18,cat:'skincare',rating:4.3,rv:654,img:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400',desc:'Centella calming serum for acne' },
  { name:'NPURE Centella Asiatica Face Wash',priceIdr:35000,costCny:13,cat:'skincare',rating:4.5,rv:780,img:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',desc:'Gentle centella face cleanser' },

  { name:'Gamis Syari Premium Rayon',priceIdr:189000,costCny:72,cat:'muslimwear',rating:4.8,rv:1500,img:'https://images.unsplash.com/photo-1617957743169-3d634d65255f?w=400',desc:'Elegant long dress for daily wear' },
  { name:'Mukena Travel Premium Set',priceIdr:280000,costCny:105,cat:'muslimwear',rating:4.9,rv:890,img:'https://images.unsplash.com/photo-1584551246679-0daf3d275567?w=400',desc:'Compact travel prayer set with pouch' },
  { name:'Baju Koko Pria Modern Bordir',priceIdr:250000,costCny:95,cat:'muslimwear',rating:4.6,rv:670,img:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',desc:'Modern embroidered men koko shirt' },
  { name:'Hijab Segi Empat Voal Premium',priceIdr:35000,costCny:13,cat:'muslimwear',rating:4.7,rv:2300,img:'https://images.unsplash.com/photo-1583391733923-cd44bce3eaa6?w=400',desc:'Premium voal square hijab' },
  { name:'Pashmina Ceruty Babydoll',priceIdr:45000,costCny:17,cat:'muslimwear',rating:4.6,rv:1100,img:'https://images.unsplash.com/photo-1591360236480-4ed7d90e6e38?w=400',desc:'Soft ceruty babydoll pashmina' },
  { name:'Setelan Keluarga Muslim Lebaran',priceIdr:350000,costCny:135,cat:'muslimwear',rating:4.8,rv:430,img:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400',desc:'Family matching set for Lebaran' },
  { name:'Khimar Instan Syari Premium',priceIdr:75000,costCny:28,cat:'muslimwear',rating:4.5,rv:560,img:'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400',desc:'Instant khimar with inner' },
  { name:'Sarung Tenun Premium Atlas',priceIdr:120000,costCny:45,cat:'muslimwear',rating:4.7,rv:340,img:'https://images.unsplash.com/photo-1590156221767-c4b6aa8f49fc?w=400',desc:'Premium woven sarong for men' },
  { name:'Kaftan Modern Wanita Motif Bunga',priceIdr:195000,costCny:75,cat:'muslimwear',rating:4.6,rv:290,img:'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400',desc:'Floral print modern kaftan' },
  { name:'Peci Rajut Premium Pria',priceIdr:45000,costCny:17,cat:'muslimwear',rating:4.4,rv:410,img:'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400',desc:'Premium knitted peci cap' },

  { name:'Kursi Makan Lipat Minimalis',priceIdr:180000,costCny:68,cat:'home',rating:4.3,rv:230,img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',desc:'Foldable minimalist dining chair' },
  { name:'Rak Sepatu Plastik Susun 5',priceIdr:89000,costCny:32,cat:'home',rating:4.4,rv:560,img:'https://images.unsplash.com/photo-1597072689227-8882273e8ca5?w=400',desc:'5-tier plastic shoe rack' },
  { name:'Sprei Katun Motif Bunga 180x200',priceIdr:145000,costCny:55,cat:'home',rating:4.5,rv:780,img:'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',desc:'Cotton floral bedsheet set' },
  { name:'Lampu Hias LED Ruang Tamu',priceIdr:250000,costCny:95,cat:'home',rating:4.6,rv:320,img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',desc:'LED decorative living room lamp' },
  { name:'Keset Kaki Anti Slip Premium',priceIdr:39000,costCny:14,cat:'home',rating:4.2,rv:890,img:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',desc:'Anti-slip premium doormat' },
  { name:'Rak Dapur Gantung Multifungsi',priceIdr:110000,costCny:40,cat:'home',rating:4.3,rv:210,img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',desc:'Multifunctional hanging kitchen rack' },
  { name:'Sarung Bantal Motif Batik',priceIdr:35000,costCny:13,cat:'home',rating:4.5,rv:1200,img:'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400',desc:'Batik motif pillowcase set' },
  { name:'Taplak Meja Makan Waterproof',priceIdr:65000,costCny:24,cat:'home',rating:4.4,rv:340,img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400',desc:'Waterproof dining tablecloth' },
  { name:'Gorden Blackout Premium 2m',priceIdr:160000,costCny:60,cat:'home',rating:4.6,rv:670,img:'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',desc:'Premium blackout curtain 2 meters' },
  { name:'Tempat Sampah Sensor Otomatis',priceIdr:210000,costCny:78,cat:'home',rating:4.5,rv:190,img:'https://images.unsplash.com/photo-1604281373313-9c6bd1d5f195?w=400',desc:'Auto-sensor trash bin' },

  { name:'Popok Bayi Disposable XXL 50pcs',priceIdr:79000,costCny:28,cat:'baby',rating:4.7,rv:2300,img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',desc:'XXL disposable diapers for baby' },
  { name:'Susu Formula Bayi 0-6 Bulan 800g',priceIdr:165000,costCny:62,cat:'baby',rating:4.8,rv:1500,img:'https://images.unsplash.com/photo-1584839404042-8bc21d240e91?w=400',desc:'Infant formula milk 800g' },
  { name:'Stroller Bayi Lipat Ringan',priceIdr:850000,costCny:320,cat:'baby',rating:4.5,rv:340,img:'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',desc:'Lightweight foldable baby stroller' },
  { name:'Botol Susu Anti Kolik 260ml',priceIdr:89000,costCny:34,cat:'baby',rating:4.6,rv:890,img:'https://images.unsplash.com/photo-1574732027154-d2030b3be0a4?w=400',desc:'Anti-colic baby bottle 260ml' },
  { name:'Mainan Edukasi Bayi Montessori',priceIdr:129000,costCny:48,cat:'baby',rating:4.4,rv:560,img:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400',desc:'Montessori educational baby toy' },
  { name:'Baby Walker 3-in-1 Multifungsi',priceIdr:450000,costCny:170,cat:'baby',rating:4.3,rv:230,img:'https://images.unsplash.com/photo-1555252333-9f8f4a3d2d7b?w=400',desc:'3-in-1 multifunctional baby walker' },
  { name:'Tissue Basah Baby 3x70 Lembar',priceIdr:35000,costCny:13,cat:'baby',rating:4.7,rv:3400,img:'https://images.unsplash.com/photo-1616628188906-58be482bbcfe?w=400',desc:'Baby wet wipes 3x70 sheets' },
  { name:'Baju Bayi Katun Set 5pcs',priceIdr:65000,costCny:24,cat:'baby',rating:4.5,rv:670,img:'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400',desc:'Cotton baby clothes set 5pcs' },

  { name:'Kopi Gayo Arabica 250g',priceIdr:65000,costCny:24,cat:'food',rating:4.8,rv:1900,img:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',desc:'Premium Gayo Arabica coffee beans' },
  { name:'Kacang Mete Panggang 500g',priceIdr:55000,costCny:20,cat:'food',rating:4.6,rv:780,img:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',desc:'Roasted cashew nuts 500g' },
  { name:'Keripik Tempe Original 250g',priceIdr:25000,costCny:9,cat:'food',rating:4.5,rv:2300,img:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',desc:'Original tempeh chips 250g' },
  { name:'Madu Murni Hutan Sumatra 500ml',priceIdr:99000,costCny:37,cat:'food',rating:4.7,rv:890,img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',desc:'Pure Sumatran forest honey' },
  { name:'Rendang Sapi Instan Premium 200g',priceIdr:45000,costCny:17,cat:'food',rating:4.4,rv:430,img:'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=400',desc:'Premium instant beef rendang' },
  { name:'Bawang Goreng Crispy 200g',priceIdr:28000,costCny:10,cat:'food',rating:4.6,rv:1200,img:'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',desc:'Crispy fried shallots 200g' },
  { name:'Coklat Kacang Premium 300g',priceIdr:49000,costCny:18,cat:'food',rating:4.5,rv:560,img:'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',desc:'Premium nut chocolate 300g' },
  { name:'Teh Celup Melati Asli 50 Kantong',priceIdr:22000,costCny:8,cat:'food',rating:4.3,rv:890,img:'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400',desc:'Authentic jasmine tea bags 50pcs' },

  { name:'Sepatu Lari Pria Flyknit',priceIdr:350000,costCny:132,cat:'sports',rating:4.5,rv:560,img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',desc:'Flyknit running shoes for men' },
  { name:'Matras Yoga Anti Slip 6mm',priceIdr:89000,costCny:34,cat:'sports',rating:4.6,rv:1200,img:'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',desc:'Anti-slip yoga mat 6mm' },
  { name:'Jersey Bola Kaki Premium Printing',priceIdr:129000,costCny:48,cat:'sports',rating:4.4,rv:890,img:'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400',desc:'Premium printed football jersey' },
  { name:'Dumbbell Set Adjustable 20kg',priceIdr:450000,costCny:170,cat:'sports',rating:4.3,rv:340,img:'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',desc:'Adjustable dumbbell set 20kg' },
  { name:'Resistance Band Set 5 Level',priceIdr:49000,costCny:18,cat:'sports',rating:4.5,rv:780,img:'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',desc:'5-level resistance band set' },
  { name:'Botol Minum Sport 1000ml',priceIdr:35000,costCny:13,cat:'sports',rating:4.7,rv:2100,img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',desc:'Sport water bottle 1000ml' },
  { name:'Tas Gym Travel Multifungsi',priceIdr:159000,costCny:60,cat:'sports',rating:4.4,rv:230,img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',desc:'Multifunctional gym travel bag' },
  { name:'Lompat Tali Speed Bearing',priceIdr:29000,costCny:11,cat:'sports',rating:4.6,rv:1500,img:'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400',desc:'Speed bearing jump rope' },

  { name:'Jam Tangan Pria Analog Premium',priceIdr:350000,costCny:132,cat:'accessories',rating:4.4,rv:560,img:'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',desc:'Premium analog men watch' },
  { name:'Tas Ransel Kulit Sintetis Pria',priceIdr:280000,costCny:105,cat:'accessories',rating:4.5,rv:340,img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',desc:'Synthetic leather men backpack' },
  { name:'Dompet Kulit Pria Slim RFID',priceIdr:129000,costCny:48,cat:'accessories',rating:4.6,rv:780,img:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',desc:'Slim RFID leather wallet' },
  { name:'Kacamata Hitam UV400 Unisex',priceIdr:59000,costCny:22,cat:'accessories',rating:4.3,rv:890,img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',desc:'UV400 unisex sunglasses' },
  { name:'Ikat Pinggang Kulit Asli Pria',priceIdr:99000,costCny:37,cat:'accessories',rating:4.5,rv:450,img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',desc:'Genuine leather men belt' },
  { name:'Cincin Titanium Pria Simple',priceIdr:75000,costCny:28,cat:'accessories',rating:4.4,rv:230,img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',desc:'Simple titanium men ring' },
  { name:'Topi Baseball Premium Unisex',priceIdr:49000,costCny:18,cat:'accessories',rating:4.6,rv:1200,img:'https://images.unsplash.com/photo-1588850561407-ed78c282e36b?w=400',desc:'Premium unisex baseball cap' },
  { name:'Kaos Kaki Olahraga Premium 6pcs',priceIdr:39000,costCny:14,cat:'accessories',rating:4.5,rv:2100,img:'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400',desc:'Premium sports socks 6 pairs' },

  { name:'Lipstik Matte Tahan Lama Wardah',priceIdr:35000,costCny:13,cat:'beauty',rating:4.7,rv:2300,img:'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',desc:'Long-lasting matte lipstick Wardah' },
  { name:'Bedak Tabur Natural Pigeon',priceIdr:28000,costCny:10,cat:'beauty',rating:4.6,rv:1800,img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',desc:'Natural loose powder Pigeon' },
  { name:'Eyeliner Waterproof Hitam Pekat',priceIdr:25000,costCny:9,cat:'beauty',rating:4.5,rv:1200,img:'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400',desc:'Deep black waterproof eyeliner' },
  { name:'Pensil Alis Natural Brown',priceIdr:22000,costCny:8,cat:'beauty',rating:4.4,rv:890,img:'https://images.unsplash.com/photo-1626208688735-e8e1fcb7e81c?w=400',desc:'Natural brown eyebrow pencil' },
  { name:'Maskara Volume 4D Tahan Air',priceIdr:45000,costCny:17,cat:'beauty',rating:4.6,rv:1500,img:'https://images.unsplash.com/photo-1631214500318-5934c6d1f811?w=400',desc:'4D volume waterproof mascara' },
  { name:'Foundation Full Coverage SPF30',priceIdr:89000,costCny:34,cat:'beauty',rating:4.5,rv:670,img:'https://images.unsplash.com/photo-1631214524057-e1669faf1e2d?w=400',desc:'Full coverage foundation SPF30' },
  { name:'Blush On Natural Pink Glow',priceIdr:29000,costCny:11,cat:'beauty',rating:4.3,rv:560,img:'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400',desc:'Natural pink glow blush on' },
  { name:'Setting Spray Makeup Tahan 16 Jam',priceIdr:55000,costCny:20,cat:'beauty',rating:4.7,rv:980,img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',desc:'16-hour makeup setting spray' },

  { name:'Vitamin C 1000mg + Zinc 30 Tablet',priceIdr:35000,costCny:13,cat:'health',rating:4.8,rv:3400,img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400',desc:'Vitamin C 1000mg + Zinc supplements' },
  { name:'Masker KN95 50pcs Premium',priceIdr:65000,costCny:24,cat:'health',rating:4.6,rv:2300,img:'https://images.unsplash.com/photo-1584634731332-a30715c8a761?w=400',desc:'KN95 mask premium 50 pieces' },
  { name:'Hand Sanitizer Gel 500ml',priceIdr:29000,costCny:11,cat:'health',rating:4.5,rv:1800,img:'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400',desc:'Hand sanitizer gel 500ml' },
  { name:'Minyak Kayu Putih Aromaterapi 100ml',priceIdr:25000,costCny:9,cat:'health',rating:4.7,rv:4500,img:'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',desc:'Eucalyptus aromatherapy oil 100ml' },
  { name:'Tensimeter Digital Otomatis',priceIdr:250000,costCny:95,cat:'health',rating:4.4,rv:340,img:'https://images.unsplash.com/photo-1584982751601-97bbbc09699e?w=400',desc:'Automatic digital blood pressure monitor' },
  { name:'Obat Sakit Kepala Paracetamol 20 Tablet',priceIdr:12000,costCny:4,cat:'health',rating:4.5,rv:5600,img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400',desc:'Paracetamol headache relief 20 tablets' },
  { name:'Alat Cek Gula Darah + 50 Strip',priceIdr:189000,costCny:72,cat:'health',rating:4.3,rv:230,img:'https://images.unsplash.com/photo-1584982751601-97bbbc09699e?w=400',desc:'Blood glucose monitor + 50 strips' },

  { name:'Pulpen Gel 0.5mm Set 12 Warna',priceIdr:29000,costCny:11,cat:'stationery',rating:4.5,rv:1200,img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',desc:'Gel pen 0.5mm 12-color set' },
  { name:'Buku Catatan A5 Hard Cover',priceIdr:35000,costCny:13,cat:'stationery',rating:4.4,rv:890,img:'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400',desc:'A5 hardcover notebook' },
  { name:'Sticky Notes Warna Pastel 10 Pack',priceIdr:19000,costCny:7,cat:'stationery',rating:4.6,rv:2300,img:'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400',desc:'Pastel sticky notes 10-pack' },
  { name:'Highlighter Set 6 Warna Neon',priceIdr:25000,costCny:9,cat:'stationery',rating:4.5,rv:670,img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',desc:'Neon highlighter set 6 colors' },
  { name:'Pensil Mekanik 0.7mm + Isi Ulang',priceIdr:18000,costCny:7,cat:'stationery',rating:4.3,rv:450,img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',desc:'Mechanical pencil 0.7mm + refills' },
];

const stmt = db.prepare(`
  INSERT INTO ace_products (id, name, category, price_idr, cost_cny, image_urls, rating_avg, rating_count, description, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
`);

let count = 0;
for (const p of products) {
  const id = `AP-${String(count+1).padStart(4,'0')}`;
  const img = JSON.stringify([p.img]);
  stmt.run(id, p.name, p.cat, p.priceIdr, p.costCny, img, p.rating, p.rv, p.desc);
  count++;
}

console.log(`✅ Seeded ${count} products into SQLite`);
db.close();
