import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Check, X, ArrowRight, Home, RefreshCw, Package, Clock,
  ShieldCheck, ShoppingBag, MessageCircle,
} from 'lucide-react';

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    successTitle: 'Pembayaran Berhasil!',
    successDesc: 'Pesanan Anda sedang diproses. AceProxy akan segera membeli produk Anda dari pabrik China.',
    pendingTitle: 'Pembayaran Diproses',
    pendingDesc: 'Pembayaran Anda sedang diverifikasi. Ini biasanya memakan waktu beberapa saat.',
    failedTitle: 'Pembayaran Gagal',
    failedDesc: 'Pembayaran Anda tidak dapat diproses. Silakan coba lagi dengan metode pembayaran lain atau hubungi tim support.',
    expiredTitle: 'Pembayaran Kedaluwarsa',
    expiredDesc: 'Batas waktu pembayaran telah habis. Silakan buat pesanan baru.',
    orderNumber: 'Nomor Pesanan',
    amount: 'Jumlah',
    paymentMethod: 'Metode Pembayaran',
    whatsappSupport: 'Hubungi via WhatsApp',
    viewOrder: 'Lihat Pesanan',
    continueShopping: 'Lanjut Belanja',
    tryAgain: 'Coba Lagi',
    backHome: 'Kembali ke Beranda',
    timeline: 'Apa yang terjadi selanjutnya?',
    timelineSteps: [
      'Tim AceProxy akan membeli produk Anda di 1688.com',
      'Produk akan diperiksa oleh AI Quality Control kami',
      'Produk dikemas dan dikirimkan ke Indonesia',
      'Pesanan sampai di alamat Anda (14-21 hari)',
    ],
  },
  EN: {
    successTitle: 'Payment Successful!',
    successDesc: 'Your order is being processed. AceProxy will purchase your items from Chinese factories shortly.',
    pendingTitle: 'Payment Processing',
    pendingDesc: 'Your payment is being verified. This usually takes a few moments.',
    failedTitle: 'Payment Failed',
    failedDesc: 'Your payment could not be processed. Please try again with another payment method or contact support.',
    expiredTitle: 'Payment Expired',
    expiredDesc: 'The payment deadline has passed. Please create a new order.',
    orderNumber: 'Order Number',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    whatsappSupport: 'Contact via WhatsApp',
    viewOrder: 'View Order',
    continueShopping: 'Continue Shopping',
    tryAgain: 'Try Again',
    backHome: 'Back to Home',
    timeline: "What's next?",
    timelineSteps: [
      'AceProxy team purchases your items on 1688.com',
      'Products inspected by our AI Quality Control',
      'Packages consolidated and shipped to Indonesia',
      'Order delivered to your address (14-21 days)',
    ],
  },
  ZH: {
    successTitle: '支付成功！',
    successDesc: '您的订单正在处理中。AceProxy 将很快从中国工厂为您采购商品。',
    pendingTitle: '支付处理中',
    pendingDesc: '您的付款正在验证中，通常只需片刻。',
    failedTitle: '支付失败',
    failedDesc: '您的付款未能处理。请尝试其他支付方式或联系客服。',
    expiredTitle: '支付已过期',
    expiredDesc: '支付期限已过，请重新下单。',
    orderNumber: '订单编号',
    amount: '金额',
    paymentMethod: '支付方式',
    whatsappSupport: '联系 WhatsApp 客服',
    viewOrder: '查看订单',
    continueShopping: '继续购物',
    tryAgain: '重试',
    backHome: '返回首页',
    timeline: '接下来？',
    timelineSteps: [
      'AceProxy 团队在 1688.com 为您采购',
      'AI 质检系统检查商品质量',
      '打包并运往印尼',
      '送达您的地址（14-21天）',
    ],
  },
};

type ResultType = 'success' | 'pending' | 'failed' | 'expired';

export default function PaymentResultPage() {
  const router = useRouter();
  const { status, order_id, amount, method } = router.query;
  const [lang] = useState<Lang>('ID');
  const t = T[lang];

  const resultType: ResultType =
    (typeof status === 'string' && ['success', 'pending', 'failed', 'expired'].includes(status))
      ? (status as ResultType)
      : 'success';

  const orderNumber = typeof order_id === 'string' ? order_id : null;
  const orderAmount = typeof amount === 'string' ? Number(amount) : 0;
  const paymentMethod = typeof method === 'string' ? method : '';

  const config = {
    success: {
      icon: <Check size={40} className="text-white" />,
      bgColor: 'bg-success border-success',
      title: t.successTitle,
      desc: t.successDesc,
    },
    pending: {
      icon: <Clock size={40} className="text-white" />,
      bgColor: 'bg-warning border-warning',
      title: t.pendingTitle,
      desc: t.pendingDesc,
    },
    failed: {
      icon: <X size={40} className="text-white" />,
      bgColor: 'bg-error border-error',
      title: t.failedTitle,
      desc: t.failedDesc,
    },
    expired: {
      icon: <Clock size={40} className="text-white" />,
      bgColor: 'bg-ink-mute border-ink-mute',
      title: t.expiredTitle,
      desc: t.expiredDesc,
    },
  };

  const current = config[resultType];

  return (
    <>
      <Head><title>{current.title} — AceProxy</title></Head>

      <div className="min-h-screen bg-canvas-warm flex items-center justify-center px-4 py-10 font-body">
        <div className="max-w-lg w-full">
          {/* Result Card */}
          <div className="bg-white border-4 border-black p-8 sm:p-10"
            style={{ boxShadow: '8px 8px 0 #000' }}>
            {/* Icon */}
            <div className={`w-24 h-24 mx-auto mb-6 border-4 ${current.bgColor} flex items-center justify-center`}
              style={{ boxShadow: '4px 4px 0 #000' }}>
              {current.icon}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em] text-center mb-3">
              {current.title}
            </h1>

            {/* Description */}
            <p className="text-ink-secondary text-center mb-6 leading-relaxed">
              {current.desc}
            </p>

            {/* Order Info */}
            {orderNumber && (
              <div className="border-3 border-black bg-canvas-warm p-4 mb-6"
                style={{ boxShadow: '3px 3px 0 #000' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">
                      {t.orderNumber}
                    </div>
                    <div className="font-mono text-sm font-black text-ink">
                      {orderNumber}
                    </div>
                  </div>
                  {orderAmount > 0 && (
                    <div>
                      <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">
                        {t.amount}
                      </div>
                      <div className="font-display font-black text-lg text-terracotta">
                        {fmtRp(orderAmount)}
                      </div>
                    </div>
                  )}
                  {paymentMethod && (
                    <div className="col-span-2">
                      <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">
                        {t.paymentMethod}
                      </div>
                      <div className="text-sm font-bold text-ink uppercase">{paymentMethod}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {resultType === 'success' || resultType === 'pending' ? (
                <>
                  {orderNumber && (
                    <Link href={`/orders/${orderNumber}`} className="btn-brutal w-full text-sm justify-center">
                      <Package size={18} /> {t.viewOrder}
                    </Link>
                  )}
                  <Link href="/products" className="btn-brutal-outline w-full text-sm justify-center">
                    <ArrowRight size={18} /> {t.continueShopping}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/checkout" className="btn-brutal w-full text-sm justify-center">
                    <RefreshCw size={18} /> {t.tryAgain}
                  </Link>
                  <Link href="/" className="btn-brutal-outline w-full text-sm justify-center">
                    <Home size={18} /> {t.backHome}
                  </Link>
                </>
              )}

              {/* WhatsApp Support */}
              <a
                href="https://wa.me/62812xxxx?text=Hi%20AceProxy%2C%20I%20need%20help%20with%20my%20payment"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-[#25D366] text-white text-sm font-display font-bold uppercase hover:bg-[#1DA851] transition-colors w-full"
                style={{ boxShadow: '2px 2px 0 #000' }}>
                <MessageCircle size={16} /> {t.whatsappSupport}
              </a>
            </div>
          </div>

          {/* Next Steps Timeline (only for success) */}
          {resultType === 'success' && (
            <div className="bg-white border-4 border-black p-6 mt-6"
              style={{ boxShadow: '4px 4px 0 #000' }}>
              <h2 className="font-display font-black text-sm text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-terracotta" /> {t.timeline}
              </h2>
              <div className="space-y-4">
                {t.timelineSteps.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 border-2 border-black bg-terracotta text-white flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ boxShadow: '2px 2px 0 #000' }}>
                      <span className="text-[10px] font-display font-black">{i + 1}</span>
                    </div>
                    <p className="text-sm font-bold text-ink-secondary leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
