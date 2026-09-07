import { Injectable, Logger } from '@nestjs/common';

/**
 * KnowledgeBase — RAG 知识库
 *
 * 嵌入 AceProxy 所有业务政策、FAQ、产品文档。
 * 支持语义检索 + 关键词匹配，为 AI 客服提供准确的业务上下文。
 *
 * 三个层次：
 * 1. Static Policies（硬编码政策，不可变）
 * 2. Dynamic FAQ（可从 ChatLog 中学习高频问题）
 * 3. Product Specs（从数据库动态加载产品规格）
 */
@Injectable()
export class KnowledgeBase {
  private readonly logger = new Logger(KnowledgeBase.name);

  // ─── 静态政策文档 ───────────────────────────────────────────

  /** 退换货政策 */
  static readonly RETURN_POLICY = {
    id: 'policy-return',
    title: 'Return & Refund Policy',
    category: 'policy',
    tags: ['return', 'refund', 'cancel', 'money back', '退换', '退款', '退货', 'kembali', 'batalkan', 'uang'],
    content: {
      EN: `AceProxy is a proxy buying service. As items are purchased specifically for each customer from Chinese suppliers:
- No standard returns or exchanges are accepted
- If there is a quality issue, we will help file a claim with the supplier
- Resale Hub allows you to resell unwanted items and earn Ace Credits
- Refunds are only issued for supplier-caused defects confirmed within 48 hours of delivery`,
      ID: `AceProxy adalah layanan jasa titip. Karena barang dibeli khusus untuk setiap pelanggan dari supplier China:
- Tidak ada pengembalian atau penukaran standar
- Jika ada masalah kualitas, kami akan membantu klaim ke supplier
- Resale Hub memungkinkan Anda menjual kembali barang dan mendapatkan Ace Credits
- Pengembalian dana hanya untuk cacat dari supplier yang dikonfirmasi dalam 48 jam setelah pengiriman`,
    },
  };

  /** 物流与时效 */
  static readonly SHIPPING_POLICY = {
    id: 'policy-shipping',
    title: 'Shipping & Delivery Policy',
    category: 'policy',
    tags: ['shipping', 'delivery', 'how long', 'tracking', 'logistics', '物流', '送货', '时效', 'pengiriman', 'lacak'],
    content: {
      EN: `International shipping from Shenzhen warehouse:
- Jakarta/Bogor/Depok/Tangerang/Bekasi (Jabodetabek): 7-9 business days
- Other Indonesian regions: 12-16 business days
- Thailand: 5-8 business days
- Philippines: 5-10 business days
- Tracking: Available 24/7 via "My Orders" page with 15-node real-time tracking
- Consolidation orders: items held up to 14 days at Shenzhen warehouse before shipping`,
      ID: `Pengiriman internasional dari gudang Shenzhen:
- Jabodetabek: 7-9 hari kerja
- Daerah lain di Indonesia: 12-16 hari kerja
- Thailand: 5-8 hari kerja
- Filipina: 5-10 hari kerja
- Pelacakan: Tersedia 24/7 melalui halaman "Pesanan Saya" dengan 15-node tracking real-time
- Pesanan konsolidasi: barang ditahan hingga 14 hari di gudang Shenzhen sebelum dikirim`,
    },
  };

  /** 支付政策 */
  static readonly PAYMENT_POLICY = {
    id: 'policy-payment',
    title: 'Payment Methods & Policy',
    category: 'policy',
    tags: ['payment', 'pay', 'invoice', 'bill', '付款', '支付', 'bayar', 'pembayaran', 'tagihan'],
    content: {
      EN: `Accepted payment methods:
- Indonesia: GoPay, OVO, DANA, QRIS, BCA, Mandiri, BNI bank transfers
- Thailand: PromptPay, TrueMoney, credit/debit cards
- Philippines: GCash, Maya, bank transfers
- Global: credit/debit cards via WorldFirst

Important:
- Payment is verified within 5 minutes
- All prices shown in local currency (IDR/THB/PHP)
- No hidden fees — service fee is included in the displayed price`,
      ID: `Metode pembayaran yang diterima:
- Indonesia: GoPay, OVO, DANA, QRIS, transfer bank BCA, Mandiri, BNI
- Thailand: PromptPay, TrueMoney, kartu kredit/debit
- Filipina: GCash, Maya, transfer bank
- Global: kartu kredit/debit via WorldFirst

Penting:
- Pembayaran diverifikasi dalam 5 menit
- Semua harga ditampilkan dalam mata uang lokal (IDR/THB/PHP)
- Tidak ada biaya tersembunyi — biaya layanan sudah termasuk dalam harga yang ditampilkan`,
    },
  };

  /** 质检政策 */
  static readonly QUALITY_POLICY = {
    id: 'policy-quality',
    title: 'Quality Control (VisionQC)',
    category: 'policy',
    tags: ['quality', 'qc', 'inspection', 'defect', '质检', '质量', 'kualitas', 'cacat'],
    content: {
      EN: `Every item passes VisionQC 2.0 AI inspection at our Shenzhen warehouse:
- Color verification: checks color matches product listing
- Stitching & craftsmanship: detects defects automatically
- Specification matching: size, weight, material all verified
- Packaging inspection: ensures items are properly packed for international shipping
- QC images are available in your order details upon request`,
      ID: `Setiap barang melewati inspeksi AI VisionQC 2.0 di gudang Shenzhen kami:
- Verifikasi warna: memeriksa warna sesuai dengan daftar produk
- Jahitan & pengerjaan: mendeteksi cacat secara otomatis
- Pencocokan spesifikasi: ukuran, berat, bahan semua diverifikasi
- Inspeksi kemasan: memastikan barang dikemas dengan benar untuk pengiriman internasional
- Gambar QC tersedia di detail pesanan Anda berdasarkan permintaan`,
    },
  };

  /** 集运政策 */
  static readonly CONSOLIDATION_POLICY = {
    id: 'policy-consolidation',
    title: 'Order Consolidation',
    category: 'policy',
    tags: ['consolidation', 'merge', 'combine', 'gabung', '合并', '集运', 'konsolidasi'],
    content: {
      EN: `Smart Consolidation at Shenzhen warehouse:
- Multiple orders are combined into one shipment to save on shipping costs
- Max waiting period: 14 days for all items to arrive
- Combined weight optimization reduces per-item shipping cost by 30-50%
- Items are inspected individually before consolidation
- Consolidated boxes are reinforced for international transit`,
      ID: `Konsolidasi Cerdas di gudang Shenzhen:
- Beberapa pesanan digabung menjadi satu pengiriman untuk menghemat biaya
- Periode tunggu maksimal: 14 hari untuk semua barang tiba
- Optimasi berat gabungan mengurangi biaya pengiriman per item 30-50%
- Barang diperiksa satu per satu sebelum konsolidasi
- Kotak konsolidasi diperkuat untuk transit internasional`,
    },
  };

  /** 费用结构 */
  static readonly FEE_STRUCTURE = {
    id: 'policy-fees',
    title: 'Fee Structure',
    category: 'policy',
    tags: ['fee', 'cost', 'price', 'service charge', '费用', 'biaya', 'harga'],
    content: {
      EN: `Transparent fee structure:
- Product Price: Factory-direct price from Chinese suppliers (30-60% below retail)
- Service Fee: 5-10% of product price (covers procurement, QC, packing)
- Shipping Fee: Calculated by weight and destination (see Shipping Policy)
- Insurance: Optional, 1% of order value (covers loss/damage during transit)
- No hidden fees, no surprise charges`,
      ID: `Struktur biaya transparan:
- Harga Produk: Harga langsung pabrik dari supplier China (30-60% di bawah eceran)
- Biaya Layanan: 5-10% dari harga produk (mencakup pengadaan, QC, pengemasan)
- Biaya Pengiriman: Dihitung berdasarkan berat dan tujuan (lihat Kebijakan Pengiriman)
- Asuransi: Opsional, 1% dari nilai pesanan (mencakup kehilangan/kerusakan selama transit)
- Tidak ada biaya tersembunyi, tidak ada biaya kejutan`,
    },
  };

  /** 投诉处理 */
  static readonly COMPLAINT_PROCESS = {
    id: 'policy-complaint',
    title: 'Complaint & Claim Process',
    category: 'policy',
    tags: ['complaint', 'claim', 'problem', 'issue', '投诉', 'keluhan', 'masalah', 'komplain'],
    content: {
      EN: `How to file a complaint or claim:
1. Describe the issue in detail via in-app chat or email hello@aceproxy.id
2. Attach photos of the received item showing the problem
3. Our team reviews within 24 hours
4. For supplier-caused defects: we file a claim with the supplier (3-7 business days)
5. For shipping damage: insurance claim processing (5-10 business days)
6. Resolution: refund to Ace Credits or replacement shipment`,
      ID: `Cara mengajukan keluhan atau klaim:
1. Jelaskan masalah secara detail melalui chat in-app atau email hello@aceproxy.id
2. Lampirkan foto barang yang diterima yang menunjukkan masalah
3. Tim kami meninjau dalam 24 jam
4. Untuk cacat dari supplier: kami mengajukan klaim ke supplier (3-7 hari kerja)
5. Untuk kerusakan pengiriman: pemrosesan klaim asuransi (5-10 hari kerja)
6. Resolusi: pengembalian dana ke Ace Credits atau pengiriman pengganti`,
    },
  };

  // ─── 高频 FAQ ───────────────────────────────────────────────

  static readonly TOP_FAQ = [
    {
      q: { EN: 'Where is my package?', ID: 'Dimana paket saya?' },
      a: {
        EN: 'You can track your order 24/7 in "My Orders". We use a 15-node tracking system that shows your package from our Shenzhen warehouse to your doorstep. If you provide your order ID, I can check the exact status for you.',
        ID: 'Anda dapat melacak pesanan 24/7 di "Pesanan Saya". Kami menggunakan sistem pelacakan 15-node yang menunjukkan paket Anda dari gudang Shenzhen hingga ke depan pintu Anda. Jika Anda memberikan ID pesanan, saya dapat memeriksa status tepatnya untuk Anda.',
      },
      tags: ['where', 'package', 'tracking', 'locate', 'dimana', 'paket', 'lacak'],
    },
    {
      q: { EN: 'How long does delivery take?', ID: 'Berapa lama pengiriman?' },
      a: {
        EN: 'Jabodetabek: 7-9 business days. Other Indonesia: 12-16 days. Thailand: 5-8 days. Philippines: 5-10 days. Actual delivery may vary by customs clearance.',
        ID: 'Jabodetabek: 7-9 hari kerja. Indonesia lainnya: 12-16 hari. Thailand: 5-8 hari. Filipina: 5-10 hari. Pengiriman aktual dapat bervariasi tergantung bea cukai.',
      },
      tags: ['how long', 'delivery time', 'berapa lama', 'pengiriman', 'sampai'],
    },
    {
      q: { EN: 'Can I return or exchange items?', ID: 'Bisa return atau tukar barang?' },
      a: {
        EN: 'As items are bought specifically for you, returns aren\'t accepted as standard. For quality defects confirmed within 48 hours, we will file a claim with the supplier. You can also use our Resale Hub to sell unwanted items.',
        ID: 'Karena barang dibeli khusus untuk Anda, pengembalian tidak diterima secara standar. Untuk cacat kualitas yang dikonfirmasi dalam 48 jam, kami akan mengajukan klaim ke supplier. Anda juga dapat menggunakan Resale Hub kami untuk menjual barang yang tidak diinginkan.',
      },
      tags: ['return', 'exchange', 'refund', 'return', 'tukar', 'kembali', 'uang'],
    },
    {
      q: { EN: 'How do I pay?', ID: 'Bagaimana cara bayar?' },
      a: {
        EN: 'We accept GoPay, OVO, DANA, QRIS, BCA/Mandiri/BNI transfers (Indonesia); PromptPay (Thailand); GCash (Philippines); credit/debit cards globally. Payment is verified within 5 minutes.',
        ID: 'Kami menerima GoPay, OVO, DANA, QRIS, transfer BCA/Mandiri/BNI (Indonesia); PromptPay (Thailand); GCash (Filipina); kartu kredit/debit global. Pembayaran diverifikasi dalam 5 menit.',
      },
      tags: ['pay', 'payment', 'how to pay', 'bayar', 'pembayaran', 'cara bayar'],
    },
    {
      q: { EN: 'What if my item is damaged?', ID: 'Bagaimana jika barang saya rusak?' },
      a: {
        EN: 'If you receive a damaged item, please take photos immediately and send them via chat or email hello@aceproxy.id within 48 hours. We will file a claim with the supplier or insurance, whichever applies.',
        ID: 'Jika Anda menerima barang rusak, silakan foto segera dan kirim melalui chat atau email hello@aceproxy.id dalam 48 jam. Kami akan mengajukan klaim ke supplier atau asuransi, sesuai yang berlaku.',
      },
      tags: ['damaged', 'broken', 'defect', 'rusak', 'cacat', 'pecah'],
    },
    {
      q: { EN: 'Can I combine multiple orders?', ID: 'Bisa gabung beberapa pesanan?' },
      a: {
        EN: 'Yes! Our Smart Consolidation combines orders at our Shenzhen warehouse. It saves 30-50% on shipping. Max wait time for all items to arrive is 14 days.',
        ID: 'Ya! Konsolidasi Cerdas kami menggabungkan pesanan di gudang Shenzhen. Menghemat 30-50% biaya pengiriman. Waktu tunggu maksimal untuk semua barang tiba adalah 14 hari.',
      },
      tags: ['combine', 'consolidation', 'merge', 'gabung', 'konsolidasi', 'satukan'],
    },
    {
      q: { EN: 'How do I cancel an order?', ID: 'Bagaimana cara membatalkan pesanan?' },
      a: {
        EN: 'You can cancel if the order status is PENDING or PAID (before purchase from supplier). Once PROCURING, cancellation may incur a fee. Provide your order ID and I can check if cancellation is possible.',
        ID: 'Anda dapat membatalkan jika status pesanan PENDING atau PAID (sebelum pembelian dari supplier). Jika sudah PROCURING, pembatalan mungkin dikenakan biaya. Berikan ID pesanan Anda dan saya dapat memeriksa apakah pembatalan memungkinkan.',
      },
      tags: ['cancel', 'batalkan', 'cancellation', 'pembatalan'],
    },
    {
      q: { EN: 'How is quality checked?', ID: 'Bagaimana kualitas diperiksa?' },
      a: {
        EN: 'Every item passes VisionQC 2.0 AI inspection: color verification, stitching check, spec matching, and packaging inspection. QC images are available on request.',
        ID: 'Setiap barang melewati inspeksi AI VisionQC 2.0: verifikasi warna, pemeriksaan jahitan, pencocokan spesifikasi, dan inspeksi kemasan. Gambar QC tersedia berdasarkan permintaan.',
      },
      tags: ['quality', 'check', 'qc', 'inspect', 'kualitas', 'periksa', 'cek'],
    },
  ];

  // ─── 方法 ─────────────────────────────────────────────────────

  /** 列出所有静态政策 */
  listAllPolicies() {
    return [
      KnowledgeBase.RETURN_POLICY,
      KnowledgeBase.SHIPPING_POLICY,
      KnowledgeBase.PAYMENT_POLICY,
      KnowledgeBase.QUALITY_POLICY,
      KnowledgeBase.CONSOLIDATION_POLICY,
      KnowledgeBase.FEE_STRUCTURE,
      KnowledgeBase.COMPLAINT_PROCESS,
    ];
  }

  /**
   * 语义搜索政策文档
   * @param query 用户问题
   * @returns 相关文档片段
   */
  searchPolicies(query: string): Array<{ title: string; content: string; relevance: number }> {
    const lower = query.toLowerCase();
    const results: Array<{ title: string; content: string; relevance: number }> = [];

    for (const policy of this.listAllPolicies()) {
      let score = 0;

      // 标签精确匹配（高权重）
      for (const tag of policy.tags) {
        if (lower.includes(tag.toLowerCase())) {
          score += 3;
        }
      }

      // 标题关键词匹配
      for (const word of policy.title.toLowerCase().split(/\s+/)) {
        if (lower.includes(word)) {
          score += 2;
        }
      }

      // 内容关键词匹配（低权重）
      const contentWords = (policy.content['EN'] || '').toLowerCase().split(/\s+/);
      for (const word of contentWords) {
        if (word.length > 3 && lower.includes(word)) {
          score += 0.5;
        }
      }

      if (score >= 3) {
        results.push({
          title: policy.title,
          content: policy.content['EN'],
          relevance: Math.min(score / 15, 1),
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  /**
   * 搜索 FAQ
   * @param query 用户问题
   * @param lang 语言
   */
  searchFAQ(query: string, lang: string = 'EN'): Array<{ question: string; answer: string; relevance: number }> {
    const lower = query.toLowerCase();
    const results: Array<{ question: string; answer: string; relevance: number }> = [];

    for (const faq of KnowledgeBase.TOP_FAQ) {
      let score = 0;
      const qText = (faq.q[lang] || faq.q['EN']).toLowerCase();

      // 问题文本相似度
      for (const word of qText.split(/\s+/)) {
        if (word.length > 2 && lower.includes(word)) {
          score += 2;
        }
      }

      // 标签匹配
      for (const tag of faq.tags) {
        if (lower.includes(tag.toLowerCase())) {
          score += 3;
        }
      }

      if (score >= 3) {
        results.push({
          question: faq.q[lang] || faq.q['EN'],
          answer: faq.a[lang] || faq.a['EN'],
          relevance: Math.min(score / 12, 1),
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  /**
   * 生成 RAG 增强的系统提示词
   * @param query 用户消息
   * @returns 注入相关知识的系统提示词片段
   */
  buildRagContext(query: string): string {
    const policies = this.searchPolicies(query);
    const faqs = this.searchFAQ(query);

    const parts: string[] = [];

    if (policies.length > 0) {
      parts.push('## RELEVANT POLICIES (use these for accurate answers):\n');
      for (const p of policies) {
        parts.push(`### ${p.title}\n${p.content}\n`);
      }
    }

    if (faqs.length > 0) {
      parts.push('## RELEVANT FAQ (reference patterns):\n');
      for (const f of faqs) {
        parts.push(`Q: ${f.question}\nA: ${f.answer}\n`);
      }
    }

    return parts.join('\n');
  }
}
