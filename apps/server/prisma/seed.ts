import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. 创建测试用户
  const user1 = await prisma.aceUser.upsert({
    where: { email: 'commander@aceproxy.id' },
    update: {},
    create: {
      id: 'usr_seed_001',
      email: 'commander@aceproxy.id',
      password: '$2b$10$seed_hash_for_dev_only_not_for_prod',
      role: 'GOD_MODE',
      totalSpend: 0,
      credits: 1000000,
      level: 'GOD_MODE',
    },
  });

  const user2 = await prisma.aceUser.upsert({
    where: { email: 'shopper@aceproxy.id' },
    update: {},
    create: {
      id: 'usr_seed_002',
      email: 'shopper@aceproxy.id',
      password: '$2b$10$seed_hash_for_dev_only',
      role: 'USER',
      totalSpend: 2500000,
      credits: 500000,
      level: 'PROXY_PRO',
    },
  });

  console.log('✅ Users created');

  // 2. 创建爆款商品（AceHeroProduct）
  const products = [
    {
      id: 'prod_001',
      name: 'Baju Koko (Ramadan Special Edition)',
      category: 'Fashion',
      sourcePriceCny: 45.00,
      localPriceIdr: 289000,
      arbitrageGapPct: 0.42,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_002',
      name: 'LED Hanging Lights (Outdoor Waterproof)',
      category: 'Home',
      sourcePriceCny: 38.50,
      localPriceIdr: 199000,
      arbitrageGapPct: 0.38,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_003',
      name: 'Vacuum Sealer Pro (Food Grade)',
      category: 'Home',
      sourcePriceCny: 128.00,
      localPriceIdr: 749000,
      arbitrageGapPct: 0.35,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_004',
      name: 'Premium Silk Hijab (Printed Batik)',
      category: 'Fashion',
      sourcePriceCny: 28.00,
      localPriceIdr: 168000,
      arbitrageGapPct: 0.45,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_005',
      name: 'Travel Mukena Pro (Compact Pouch)',
      category: 'Travel',
      sourcePriceCny: 55.00,
      localPriceIdr: 329000,
      arbitrageGapPct: 0.40,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_006',
      name: 'Smart Zikr Ring Gen2 (Prayer Reminder)',
      category: 'Electronics',
      sourcePriceCny: 18.00,
      localPriceIdr: 119000,
      arbitrageGapPct: 0.52,
      status: 'ACTIVE',
      patentStatus: 'REVIEW',
    },
    {
      id: 'prod_007',
      name: 'LED Moon Decor Light (Ramadan Kids)',
      category: 'Gifts',
      sourcePriceCny: 22.00,
      localPriceIdr: 139000,
      arbitrageGapPct: 0.48,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_008',
      name: 'Modern Baju Koko (Premium Cotton)',
      category: 'Fashion',
      sourcePriceCny: 62.00,
      localPriceIdr: 389000,
      arbitrageGapPct: 0.37,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_009',
      name: 'Hakoba Eyelet Dress (Eid Collection)',
      category: 'Fashion',
      sourcePriceCny: 85.00,
      localPriceIdr: 525000,
      arbitrageGapPct: 0.34,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
    {
      id: 'prod_010',
      name: 'Portable Gas Stove (Camping Outdoor)',
      category: 'Home',
      sourcePriceCny: 95.00,
      localPriceIdr: 599000,
      arbitrageGapPct: 0.36,
      status: 'ACTIVE',
      patentStatus: 'CLEAN',
    },
  ];

  for (const p of products) {
    await prisma.aceHeroProduct.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  console.log(`✅ ${products.length} hero products seeded`);

  // 3. 创建测试订单
  const order1 = await prisma.aceOrder.upsert({
    where: { id: 'ORD-9921' },
    update: {},
    create: {
      id: 'ORD-9921',
      userId: user2.id,
      status: 'DELIVERED',
      totalAmount: 289000,
      sourceCost: 90000,
      shippingFee: 25000,
      serviceFee: 15000,
      commissionAmount: 25000,
      riskPoolAmount: 5000,
      complianceAudit: JSON.stringify({ visionQc: 'PASS', patent: 'CLEAN' }),
    },
  });

  const order2 = await prisma.aceOrder.upsert({
    where: { id: 'ORD-9920' },
    update: {},
    create: {
      id: 'ORD-9920',
      userId: user2.id,
      status: 'AIRPORT_PICKUP',
      totalAmount: 748000,
      sourceCost: 280000,
      shippingFee: 50000,
      serviceFee: 35000,
      commissionAmount: 45000,
      riskPoolAmount: 8000,
      complianceAudit: JSON.stringify({ visionQc: 'PASS', patent: 'CLEAN' }),
    },
  });

  console.log('✅ Orders seeded');

  // 4. 创建供应商
  await prisma.aceSupplier.upsert({
    where: { id: 'sup_yiwu_001' },
    update: {},
    create: {
      id: 'sup_yiwu_001',
      name: 'Yiwu Premium Fashion Ltd.',
      avgLeadTime: 48,
      defectRate: 0.02,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Supplier seeded');

  // 5. 创建团长（Partner）
  const partner1 = await prisma.acePartner.upsert({
    where: { id: 'prt_seed_001' },
    update: {},
    create: {
      id: 'prt_seed_001',
      userId: user1.id,
      name: 'JKT Premium Group',
      inviteCode: 'JKT2026',
      commissionRate: 0.08,
      balance: 2500000,
      pendingSettlement: 750000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Partner seeded');

  // 6. 财务账本（Vault Ledger）
  await prisma.aceVaultLedger.createMany({
    data: [
      {
        orderId: 'ORD-9921',
        account: 'RETAIL',
        amount: 289000,
        entryType: 'SALE',
        description: 'Order ORD-9921 sale',
      },
      {
        orderId: 'ORD-9921',
        account: 'SOURCE_COST',
        amount: -90000,
        entryType: 'COST',
        description: '1688 source cost',
      },
      {
        orderId: 'ORD-9921',
        account: 'SERVICE_FEE',
        amount: -15000,
        entryType: 'FEE',
        description: 'AceProxy service fee',
      },
    ],
  });

  console.log('✅ Vault ledger seeded');

  // 7. 全球收款配置（upsert 避免重复 seed 报唯一约束）
  const paymentConfigs = [
    { regionCode: 'ID', providerName: 'Xendit', status: 'ACTIVE', isDefault: true },
    { regionCode: 'ID', providerName: 'WorldFirst', bankName: 'Bank Central Asia (BCA)', accountNumber: '1234567890', beneficiaryName: 'PT ACE PROXY INDONESIA', status: 'ACTIVE', isDefault: false },
    { regionCode: 'CN', providerName: 'Alipay Cross-border', status: 'ACTIVE', isDefault: true },
  ];
  for (const cfg of paymentConfigs) {
    await prisma.acePaymentConfig.upsert({
      where: { regionCode_providerName: { regionCode: cfg.regionCode, providerName: cfg.providerName } },
      create: cfg,
      update: {},
    });
  }

  console.log('✅ Payment configs seeded');

  // 8. 创建 AceProduct 表数据（前端商品列表/详情的数据源）
  console.log('\n📦 Seeding AceProduct catalog...');
  const { seedAceProducts } = await import('./seed-products');
  const productCount = await seedAceProducts(prisma);
  console.log(`✅ ${productCount} AceProduct records seeded`);

  // 9. 创建 AI 客服对话数据（ChatLog 表种子）
  console.log('\n💬 Seeding customer service chat logs...');
  const { seedCustomerServiceChats } = await import('./seed-customer-service');
  await seedCustomerServiceChats(prisma);
  console.log('✅ Customer service chats seeded');

  console.log('🎉 Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
