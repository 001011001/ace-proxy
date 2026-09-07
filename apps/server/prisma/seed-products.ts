import { PrismaClient } from '@prisma/client';

/**
 * seed-products.ts — 向 AceProduct 表插入真实商品数据
 *
 * 用途：解决前端 /api/v1/product/list 返回空数据的问题
 * 可作为独立脚本运行：npx ts-node prisma/seed-products.ts
 * 也可被 prisma/seed.ts 调用
 */

interface SeedProduct {
  name: string;
  category: string;
  description: string;
  priceIdr: number;
  costCny: number;
  stock: number;
}

const products: SeedProduct[] = [
  // ─── 智能手机 & 数码 (10个) ───
  { name: 'Xiaomi Redmi Note 13 8/256GB Abyss Blue', category: 'Smartphones', description: 'Layar AMOLED 120Hz, Snapdragon 685, Triple Camera 108MP, Baterai 5000mAh, Garansi Resmi', priceIdr: 2499000, costCny: 1150, stock: 50 },
  { name: 'Samsung Galaxy A55 5G 12GB/256GB Navy', category: 'Smartphones', description: 'Layar Super AMOLED 6.6", Exynos 1480, Triple Camera 50MP, IP67 Water Resistant', priceIdr: 5299000, costCny: 2100, stock: 30 },
  { name: 'OPPO A78 8GB/256GB Glowing Black', category: 'Smartphones', description: 'Layar 6.5" HD+, MediaTek Helio G85, Dual Camera 50MP, Baterai 5000mAh', priceIdr: 2899000, costCny: 1250, stock: 40 },
  { name: 'POCO X6 Pro 5G 12GB/512GB Black', category: 'Smartphones', description: 'Dimensity 8300-Ultra, Layar Flow AMOLED 120Hz, Triple Camera 64MP, 67W Turbo Charge', priceIdr: 4799000, costCny: 1900, stock: 25 },
  { name: 'iPhone 15 128GB Black (Resmi iBox)', category: 'Smartphones', description: 'A16 Bionic, Dynamic Island, 48MP Main Camera, USB-C. Garansi Resmi iBox 1 Tahun', priceIdr: 13999000, costCny: 5200, stock: 10 },
  { name: 'Power Bank 20000mAh 22.5W Fast Charging', category: 'Accessories', description: 'Fast Charging PD 3.0, QC 4.0. LCD Display. Port USB-C + USB-A ganda', priceIdr: 185000, costCny: 65, stock: 200 },
  { name: 'Bluetooth Earphone TWS ANC Noise Cancelling', category: 'Accessories', description: 'Active Noise Cancelling 35dB, Bluetooth 5.3, 30 Jam Total Battery, IPX5 Waterproof', priceIdr: 325000, costCny: 110, stock: 100 },
  { name: 'Anti Gores Tempered Glass Full Screen', category: 'Accessories', description: 'Full Coverage 9H Hardness, Oleophobic Coating, HD Clear, Anti Fingerprint', priceIdr: 25000, costCny: 5, stock: 500 },
  { name: 'Casing HP Transparan Anti Bentur MagSafe', category: 'Accessories', description: 'Anti Yellowing, Military Grade Drop Protection, MagSafe Compatible, Lembut tidak licin', priceIdr: 45000, costCny: 10, stock: 300 },
  { name: 'Charger Kabel USB Type-C 3A Fast Charging 2M', category: 'Accessories', description: 'Fast Charging 3A, Nylon Braided Cable, 2 Meter. Universal untuk Android & iPhone 15+', priceIdr: 35000, costCny: 8, stock: 400 },

  // ─── 护肤美妆 (10个) ───
  { name: 'Skintific 5X Ceramide Moisturizer 35gr', category: 'Skincare', description: 'Moisturizer dengan 5 jenis Ceramide untuk perbaiki skin barrier. Cocok semua jenis kulit', priceIdr: 189000, costCny: 55, stock: 80 },
  { name: 'Wardah Crystallure Serum Essence 30ml', category: 'Skincare', description: 'Serum wajah dengan Niacinamide + Salicylic Acid. Mencerahkan dan mengecilkan pori-pori', priceIdr: 125000, costCny: 38, stock: 60 },
  { name: 'Somethinc Azelaic Acid 10% Serum 30ml', category: 'Skincare', description: 'Serum untuk bekas jerawat dan tekstur kulit. Bebas alkohol, aman untuk kulit sensitif', priceIdr: 135000, costCny: 42, stock: 70 },
  { name: 'Avoskin Your Skin Bae Serum 30ml', category: 'Skincare', description: 'Serum dengan Retinol + Bakuchiol. Anti aging, mengurangi garis halus dan kerutan', priceIdr: 159000, costCny: 48, stock: 55 },
  { name: 'Sunscreen Azelaic Acid SPF 50 PA++++ 50ml', category: 'Skincare', description: 'Sunscreen dengan Azelaic Acid. Ringan, tidak lengket, no white cast. Daily protection', priceIdr: 125000, costCny: 38, stock: 90 },
  { name: 'Lipstik Scarlett Infinity Liquid Lip Color 4gr', category: 'Makeup', description: 'Liquid lipstik tahan 12 jam. Matte finish, transferproof. 10 shades pilihan', priceIdr: 89000, costCny: 28, stock: 120 },
  { name: 'Bedak Padat Wardah Colorfit 10gr', category: 'Makeup', description: 'Bedak 2-in-1: finishing + coverage. Oil control, SPF 28 PA++. Natural finish', priceIdr: 75000, costCny: 24, stock: 100 },
  { name: 'Micellar Water Pembersih Makeup 200ml', category: 'Makeup', description: 'Micellar Water 3-in-1: cleanser + toner + makeup remover. Tanpa alkohol & pewangi', priceIdr: 45000, costCny: 15, stock: 150 },
  { name: 'Vitamin C Serum 20% Brightening 30ml', category: 'Skincare', description: 'High potency Vitamin C 20% + Vitamin E + Ferulic Acid. Brightening & antioksidan', priceIdr: 89000, costCny: 28, stock: 85 },
  { name: 'Hand Body Lotion Vaseline Aloe Vera 400ml', category: 'Skincare', description: 'Body lotion dengan Aloe Vera. Melembabkan 48 jam, cepat menyerap. Untuk semua kulit', priceIdr: 55000, costCny: 18, stock: 200 },

  // ─── 穆斯林时尚 (10个) ───
  { name: 'Hijab SegiEmpat Katun Jepang Premium - 10 Warna', category: 'Muslim Fashion', description: 'Katun Jepang premium, lembut, tidak licin, mudah dibentuk. Tersedia 10 warna elegan', priceIdr: 85000, costCny: 25, stock: 150 },
  { name: 'Gamis Muslimah Syari Katun Rayon - Lebaran', category: 'Muslim Fashion', description: 'Bahan katun rayon premium, flowy, adem. Model syari modern dengan bordir cantik', priceIdr: 225000, costCny: 68, stock: 60 },
  { name: 'Koko Baju Koko Pria Bordir Premium', category: 'Muslim Fashion', description: 'Bahan katun premium, bordir exclusive. Cocok untuk shalat, lebaran, dan acara formal', priceIdr: 185000, costCny: 55, stock: 80 },
  { name: 'Hijab Pashmina Premium Ceruty - 12 Warna', category: 'Muslim Fashion', description: 'Bahan ceruty premium, flowy, tidak menerawang. 12 warna pastel cantik', priceIdr: 65000, costCny: 20, stock: 180 },
  { name: 'Mukena Travel Premium Bordir Cantik', category: 'Muslim Fashion', description: 'Travel size, tas pouch included. Bahan katun halus, bordir cantik. 5 warna', priceIdr: 195000, costCny: 58, stock: 70 },
  { name: 'Gamis Anak Muslim Katun Halus 5-12th', category: 'Muslim Fashion', description: 'Bahan katun halus, nyaman untuk anak. Model princess style, banyak warna', priceIdr: 135000, costCny: 42, stock: 90 },
  { name: 'Kaos Polo Pria Cotton Combed Lengan Pendek', category: 'Muslim Fashion', description: 'Cotton Combed 24s, adem, tidak mudah kusut. Model slim fit modern', priceIdr: 75000, costCny: 24, stock: 110 },
  { name: 'Celana Jeans Pria Regular Fit Dark Blue', category: 'Muslim Fashion', description: 'Denim stretch nyaman, regular fit. 5 pocket klasik. Dark blue wash', priceIdr: 145000, costCny: 45, stock: 85 },
  { name: 'Setelan Muslim Pria Premium (Koko + Celana)', category: 'Muslim Fashion', description: 'Set lengkap: baju koko bordir + celana bahan. Cocok untuk lebaran dan shalat Jumat', priceIdr: 325000, costCny: 95, stock: 45 },
  { name: 'Jilbab Instan Bergo Premium Anti Kusut', category: 'Muslim Fashion', description: 'Anti kusut, langsung pakai, ada tali belakang. Tersedia 15 warna', priceIdr: 55000, costCny: 18, stock: 200 },

  // ─── 家居生活 (8个) ───
  { name: 'Vacuum Sealer Pro Food Grade', category: 'Home', description: 'Vacuum Sealer untuk makanan. Food grade, hemat tempat penyimpanan, seal kuat', priceIdr: 749000, costCny: 128, stock: 30 },
  { name: 'LED Hanging Lights Outdoor Waterproof 5M', category: 'Home', description: 'String LED lights, outdoor waterproof IP65. 5 meter, 50 LED, remote control, 16 warna', priceIdr: 139000, costCny: 42, stock: 100 },
  { name: 'Tumbler Stainless Steel 500ml Insulated', category: 'Home', description: 'Stainless steel food grade 304. Double wall vacuum. Tahan panas 12 jam, dingin 24 jam', priceIdr: 85000, costCny: 28, stock: 120 },
  { name: 'Portable Gas Stove Camping Outdoor', category: 'Home', description: 'Kompor portable untuk camping. Auto ignition, api biru hemat gas. Termasuk case plastik', priceIdr: 195000, costCny: 65, stock: 55 },
  { name: 'Set Peralatan Dapur Silikon 12pcs', category: 'Home', description: 'Set lengkap: spatula, sendok, sutil. Silikon food grade, tahan panas 230°C. BPA free', priceIdr: 125000, costCny: 38, stock: 80 },
  { name: 'Lampu Meja LED Belajar Dimmable', category: 'Home', description: 'LED eye-care, 3 mode warna, dimmable. USB charge. Lipat portable', priceIdr: 149000, costCny: 45, stock: 70 },
  { name: 'Kipas Angin Mini USB Portable 3 Speed', category: 'Home', description: 'Kipas angin mini USB. 3 speed, bisa diputar 360°. Battery 2000mAh, tahan 6 jam', priceIdr: 65000, costCny: 22, stock: 150 },
  { name: 'Set Sprei Katun Premium 180x200 (4pcs)', category: 'Home', description: 'Sprei katun premium, lembut, tidak luntur. Set lengkap: sprei + sarung bantal + sarung guling', priceIdr: 249000, costCny: 75, stock: 40 },

  // ─── 母婴用品 (6个) ───
  { name: 'Popok Bayi MamyPoko Pants L 54pcs', category: 'Baby', description: 'Popok celana untuk bayi. Daya serap tinggi, anti bocor, lembut di kulit', priceIdr: 145000, costCny: 42, stock: 60 },
  { name: 'Susu Formula Morinaga Chil Kid 800gr', category: 'Baby', description: 'Susu formula untuk anak 1-3 tahun. Mengandung DHA, AA, dan Prebiotik', priceIdr: 295000, costCny: 85, stock: 40 },
  { name: 'Botol Susu Silicone Anti Kolik 240ml', category: 'Baby', description: 'Botol susu silicone food grade. Anti kolik, wide neck, mudah dibersihkan. BPA free', priceIdr: 75000, costCny: 24, stock: 80 },
  { name: 'Termos Air Panas Portable 500ml', category: 'Baby', description: 'Termos stainless steel. Tahan panas 12 jam. Untuk air panas susu formula', priceIdr: 125000, costCny: 38, stock: 55 },
  { name: 'Tisu Basah Bayi Non-Alcohol 100 sheets x3', category: 'Baby', description: 'Tisu basah khusus bayi. Non-alcohol, lembut, pH balanced. 3 pack isi 100', priceIdr: 45000, costCny: 15, stock: 100 },
  { name: 'Mainan Edukasi Anak Montessori Set', category: 'Baby', description: 'Set mainan edukasi Montessori. Melatih motorik halus anak usia 1-4 tahun', priceIdr: 89000, costCny: 28, stock: 50 },

  // ─── 食品饮料 (6个) ───
  { name: 'Kopi Bubuk Gayo Arabica 250gr Premium', category: 'Food', description: 'Kopi Arabica Gayo Aceh asli. Single origin, medium roast. Cita rasa khas', priceIdr: 89000, costCny: 28, stock: 100 },
  { name: 'Teh Celup SariWangi Original 100s', category: 'Food', description: 'Teh celup asli Indonesia. Rasa segar, warna pekat. Isi 100 kantong', priceIdr: 35000, costCny: 12, stock: 200 },
  { name: 'Mie Instan Indomie Goreng 40pcs Karton', category: 'Food', description: 'Indomie Goreng original. Isi 40 bungkus dalam karton. Favorite Indonesia!', priceIdr: 125000, costCny: 38, stock: 80 },
  { name: 'Kacang Almond Panggang 500gr Premium', category: 'Food', description: 'Kacang almond USA, oven roasted, unsalted. Camilan sehat tinggi protein', priceIdr: 95000, costCny: 30, stock: 75 },
  { name: 'Madu Hutan Asli Kalimantan 500ml', category: 'Food', description: 'Madu hutan murni langsung dari petani Kalimantan. Tanpa campuran. Khasiat alami', priceIdr: 135000, costCny: 42, stock: 40 },
  { name: 'Chocolate Bar Dark 70% Cocoa 100gr', category: 'Food', description: 'Dark chocolate premium, 70% cocoa. Belgian recipe. Kaya antioksidan', priceIdr: 65000, costCny: 22, stock: 90 },
];

/**
 * 向 AceProduct 表插入全部种子商品
 * 可被外部调用（如 prisma/seed.ts）或独立运行
 */
/** 品类配色（用于生成占位图，与 Neo-Brutalism 色板呼应） */
const CATEGORY_COLORS: Record<string, string> = {
  Fashion: 'F97316',
  Food: '84CC16',
  Electronics: '0EA5E9',
  Home: 'A855F7',
  Beauty: 'EC4899',
  Sports: '22C55E',
  Toys: 'EAB308',
  Auto: '6366F1',
};

/**
 * 生成商品占位图
 * 真实环境应由 AI 修图管线（ImagePipelineService）产出实拍/场景图；
 * 种子数据阶段用带品类配色的占位图，保证前台网格有视觉内容。
 */
function placeholderFor(name: string, category: string): string {
  const color = CATEGORY_COLORS[category] || '64748B';
  const text = encodeURIComponent(name.substring(0, 14));
  return `https://placehold.co/600x600/${color}/FFFFFF?text=${text}`;
}

export async function seedAceProducts(prisma: PrismaClient): Promise<number> {
  console.log(`Seeding ${products.length} products to AceProduct table...`);

  for (const p of products) {
    const idx = products.indexOf(p) + 1;
    const imageUrls = JSON.stringify([placeholderFor(p.name, p.category)]);
    await prisma.aceProduct.upsert({
      where: { id: `PROD-SEED-${idx}` },
      update: {
        name: p.name,
        category: p.category,
        description: p.description,
        priceIdr: p.priceIdr,
        costCny: p.costCny,
        stock: p.stock,
        status: 'ACTIVE',
        imageUrls,
      },
      create: {
        id: `PROD-SEED-${idx}`,
        name: p.name,
        category: p.category,
        description: p.description,
        priceIdr: p.priceIdr,
        costCny: p.costCny,
        stock: p.stock,
        status: 'ACTIVE',
        imageUrls,
      },
    });

    if (idx % 10 === 0) process.stdout.write('.');
    else process.stdout.write('');
  }

  const count = await prisma.aceProduct.count({ where: { status: 'ACTIVE' } });
  console.log(` Done! ${count} products in AceProduct.`);
  return products.length;
}

// 如果直接运行此文件
if (require.main === module) {
  const prisma = new PrismaClient();
  seedAceProducts(prisma)
    .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
