import { PrismaClient } from '@prisma/client';

/**
 * seed-customer-service.ts — 向 ChatLog 表灌入真实客服对话种子数据
 *
 * 覆盖场景：
 * - FAQ 快速匹配（物流/运费/支付/退换货）
 * - AI Tool Calling（查订单/查物流/查用户订单）
 * - 转人工（投诉/复杂问题）
 * - 满意度评分
 */

interface SeedChat {
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  intent?: string;
  metadata?: string;
  rating?: number;
}

const conversations: SeedChat[] = [
  // ────── 会话 1：FAQ 物流查询（AI 自动解决 ✅）──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-001', role: 'user',
    content: 'Dimana paket saya? Order ORD-9920',
    intent: 'qa', rating: 5 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-001', role: 'assistant',
    content: 'Untuk melacak pesanan Anda, buka halaman "Pesanan Saya" dan klik nomor pesanan. Status akan diperbarui secara real-time dari gudang Shenzhen hingga pengiriman ke alamat Anda.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'where', confidence: 0.85 }),
    rating: 5 },

  // ────── 会话 2：FAQ 运费时效（AI 自动解决 ✅）──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-002', role: 'user',
    content: 'Berapa lama pengiriman ke Jakarta?',
    intent: 'qa', rating: 4 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-002', role: 'assistant',
    content: 'Pengiriman ke Jabodetabek memakan waktu 7-9 hari kerja. Untuk daerah lain di Indonesia 12-16 hari kerja.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'shipping', confidence: 0.82 }),
    rating: 4 },

  // ────── 会话 3：FAQ 支付方式（AI 自动解决 ✅）──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-003', role: 'user',
    content: 'Bisa bayar pakai DANA ga?',
    intent: 'qa', rating: 5 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-003', role: 'assistant',
    content: 'Kami menerima pembayaran via OVO, DANA, QRIS, dan transfer bank (BCA, Mandiri, BNI). Pilih metode di halaman checkout. Pembayaran akan diverifikasi dalam 5 menit.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'payment', confidence: 0.88 }),
    rating: 5 },

  // ────── 会话 4：Tool Calling 查订单（AI 调用 checkOrderStatus）──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-004', role: 'user',
    content: 'Tolong cek status order saya ORD-9920',
    intent: 'order_status' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-004', role: 'tool',
    content: JSON.stringify({
      success: true,
      summary: 'Pesanan ORD-9920: Status AIRPORT_PICKUP. Total Rp 748,000. Estimasi tiba 3-5 hari.',
    }),
    intent: 'order_status' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-004', role: 'assistant',
    content: 'Pesanan Anda ORD-9920 saat ini dalam status AIRPORT_PICKUP — paket sudah tiba di bandara tujuan dan menunggu pengambilan. Total pembayaran Rp 748,000. Estimasi tiba dalam 3-5 hari kerja.',
    intent: 'order_status',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'checkOrderStatus', confidence: 0.78 }),
    rating: 4 },

  // ────── 会话 5：Tool Calling 查物流（AI 调用 trackLogistics）──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-005', role: 'user',
    content: 'Dimana posisi paket saya sekarang? Order ORD-9920',
    intent: 'order_status' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-005', role: 'tool',
    content: JSON.stringify({
      success: true,
      summary: '3 node ditemukan: 1) Gudang Shenzhen (siap kirim), 2) Dalam transit via YUNTU, 3) Tiba di Jakarta sorting center.',
    }),
    intent: 'order_status' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-005', role: 'assistant',
    content: 'Paket Anda ORD-9920 saat ini sudah tiba di Jakarta sorting center. Proses selanjutnya akan dikirim ke alamat Anda dalam 1-2 hari. Silakan pantau di halaman "Pesanan Saya".',
    intent: 'order_status',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'trackLogistics', confidence: 0.75 }),
    rating: 4 },

  // ────── 会话 6：Tool Calling 估算运费 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-006', role: 'user',
    content: 'Berapa ongkir untuk kirim 2kg ke Surabaya?',
    intent: 'qa' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-006', role: 'tool',
    content: JSON.stringify({
      success: true,
      summary: 'Estimasi ongkir Surabaya via YUNTU: ¥78 (~Rp 175,000). Estimasi 10-12 hari.',
    }),
    intent: 'qa' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-006', role: 'assistant',
    content: 'Estimasi ongkos kirim ke Surabaya untuk paket 2kg sekitar Rp 175,000 via YUNTU Express. Waktu pengiriman 10-12 hari kerja. Biaya akan dihitung ulang saat checkout berdasarkan berat aktual.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'estimateShipping', confidence: 0.72 }),
    rating: 3 },

  // ────── 会话 7：转人工 — 商品破损投诉 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-007', role: 'user',
    content: 'Barang saya rusak pas datang! Ini foto kerusakannya. Saya minta refund sekarang.',
    intent: 'complaint' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-007', role: 'assistant',
    content: 'Karena AceProxy adalah layanan jasa titip internasional, barang tidak dapat ditukar atau dikembalikan. Jika ada masalah kualitas, kami akan membantu klaim ke supplier. Silakan kirim foto produk yang diterima.',
    intent: 'complaint',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'return', confidence: 0.65, needsHuman: true }),
    rating: 2 },

  // ────── 会话 8：转人工 — 订单丢失 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-008', role: 'user',
    content: 'Pesanan saya ORD-9921 sudah 20 hari belom sampe. Ini keterlaluan!',
    intent: 'complaint' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-008', role: 'assistant',
    content: 'Tolong dicek ulang, pesanan ORD-9921 statusnya DELIVERED — sudah terkirim. Apakah Anda menerima notifikasi pengiriman? Jika belum, tim kami akan membantu melacak ulang.',
    intent: 'complaint',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'checkOrderStatus', needsHuman: true }),
    rating: 1 },

  // ────── 会话 9：Tool Calling 查用户订单列表 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-009', role: 'user',
    content: 'Berapa total order saya sejauh ini?',
    intent: 'qa' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-009', role: 'tool',
    content: JSON.stringify({
      success: true,
      summary: 'Ditemukan 2 pesanan: ORD-9920 (AIRPORT_PICKUP, Rp 748,000), ORD-9921 (DELIVERED, Rp 289,000). Total spend: Rp 1,037,000.',
    }),
    intent: 'qa' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-009', role: 'assistant',
    content: 'Anda memiliki 2 pesanan: ORD-9920 (dalam perjalanan, Rp 748,000) dan ORD-9921 (sudah terkirim, Rp 289,000). Total belanja Anda Rp 1,037,000. Terima kasih sudah berbelanja di AceProxy!',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'getUserOrders', confidence: 0.80 }),
    rating: 4 },

  // ────── 会话 10：FAQ 退换货 + 满意度高 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-010', role: 'user',
    content: 'Bisa retur barang ga kalo ga cocok?',
    intent: 'qa', rating: 4 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-010', role: 'assistant',
    content: 'Karena AceProxy adalah layanan jasa titip internasional, barang tidak dapat ditukar atau dikembalikan. Jika ada masalah kualitas, kami akan membantu klaim ke supplier. Silakan kirim foto produk yang diterima.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'return', confidence: 0.86 }),
    rating: 4 },

  // ────── 会话 11：多轮对话 — 先 FAQ 再转人工 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-011', role: 'user',
    content: 'Kapan bisa gabungin order saya?',
    intent: 'qa', rating: 3 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-011', role: 'assistant',
    content: 'Kami mengkonsolidasikan pesanan Anda di gudang Shenzhen. Setelah semua paket tiba, kami gabungkan dalam satu kotak untuk menghemat biaya pengiriman. Maksimal waktu tunggu 14 hari.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'consolidation', confidence: 0.84 }),
    rating: 3 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-011', role: 'user',
    content: 'Tapi udah 16 hari belum digabung. Gimana ini?',
    intent: 'human_escalation', rating: 2 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-011', role: 'assistant',
    content: 'Maaf, saya perlu bantuan tim support untuk pertanyaan ini. Pesan Anda sudah diteruskan ke tim kami. Kami akan membalas dalam 1-2 jam.',
    intent: 'human_escalation',
    metadata: JSON.stringify({ source: 'fallback', confidence: 0.1, needsHuman: true }),
    rating: 2 },

  // ────── 会话 12：搜索商品 FAQ ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-012', role: 'user',
    content: 'Ada baju koko untuk lebaran?',
    intent: 'search', rating: 4 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-012', role: 'assistant',
    content: 'Kami memiliki koleksi Baju Koko premium untuk Lebaran! Silakan buka katalog "Fashion" di aplikasi atau website AceProxy. Kami punya Baju Koko Bordir Premium (Rp 185,000) dan Setelan Muslim Pria lengkap.',
    intent: 'search',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'searchFAQ', confidence: 0.70 }),
    rating: 4 },

  // ────── 会话 13：LLM 通用问答 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-013', role: 'user',
    content: 'Jam operasional customer service?',
    intent: 'qa', rating: 5 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-013', role: 'assistant',
    content: 'Tim customer service kami tersedia Senin-Jumat pukul 09:00-18:00 WIB, dan Sabtu 09:00-14:00 WIB. Untuk pertanyaan umum, AI kami siap membantu 24/7!',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'llm_general', confidence: 0.55 }),
    rating: 5 },

  // ────── 会话 14：英文 FAQ ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-014', role: 'user',
    content: 'How long does shipping to Thailand take?',
    intent: 'qa', rating: 4 },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-014', role: 'assistant',
    content: 'Shipping to Thailand takes 5-8 business days. For other regions in Southeast Asia, times vary between 5-16 days depending on destination.',
    intent: 'qa',
    metadata: JSON.stringify({ source: 'faq', faqMatchId: 'shipping', confidence: 0.83 }),
    rating: 4 },

  // ────── 会话 15：Tool Calling 取消订单 ──────
  { userId: 'usr_seed_002', sessionId: 'cs-sess-015', role: 'user',
    content: 'Saya mau batalkan pesanan ORD-9921',
    intent: 'order_status' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-015', role: 'tool',
    content: JSON.stringify({
      success: false,
      summary: 'Gagal: pesanan ORD-9921 sudah dalam status DELIVERED dan tidak dapat dibatalkan.',
    }),
    intent: 'order_status' },
  { userId: 'usr_seed_002', sessionId: 'cs-sess-015', role: 'assistant',
    content: 'Maaf, pesanan ORD-9921 tidak dapat dibatalkan karena sudah dalam status DELIVERED (terkirim). Untuk pesanan yang sudah diterima, silakan hubungi tim support kami untuk bantuan lebih lanjut.',
    intent: 'order_status',
    metadata: JSON.stringify({ source: 'tool_calling', toolUsed: 'cancelOrder', confidence: 0.68 }),
    rating: 3 },
];

export async function seedCustomerServiceChats(prisma: PrismaClient): Promise<number> {
  console.log(`\n💬 Seeding ${conversations.length} ChatLog entries for customer service...`);

  let count = 0;
  for (let i = 0; i < conversations.length; i++) {
    const c = conversations[i];
    // 使用固定的 ID 避免重复 seed
    const id = `chat-seed-${String(i + 1).padStart(3, '0')}`;
    // 每条消息间隔几分钟，模拟真实时间线
    const offsetMs = i * 5 * 60 * 1000; // 每条间隔 5 分钟

    await prisma.chatLog.upsert({
      where: { id },
      update: {},
      create: {
        id,
        userId: c.userId,
        sessionId: c.sessionId,
        role: c.role,
        content: c.content,
        intent: c.intent || null,
        metadata: c.metadata || null,
        rating: c.rating || null,
        // 从 3 天前开始生成，每条间隔 5 分钟
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + offsetMs),
      },
    });

    count++;
    if (count % 5 === 0) process.stdout.write('.');
  }

  const total = await prisma.chatLog.count();
  console.log(` Done! ${count} ChatLog entries added (total: ${total})`);
  return count;
}

// 独立运行
if (require.main === module) {
  const prisma = new PrismaClient();
  seedCustomerServiceChats(prisma)
    .catch((e) => { console.error('Seed CS failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
