import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Home, Package, ShoppingBag, Truck, Check, Clock,
  AlertCircle, RefreshCw, Box, Shield, Globe, MapPin, Warehouse,
  Search, ShoppingCart, ExternalLink, ChevronRight, MessageCircle,
  Share2, Copy, CheckCheck,
} from 'lucide-react';

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}
function fmtCny(n: number): string {
  return `¥${n.toFixed(2)}`;
}

// ─── Full Timeline Nodes (15 steps) ───
interface TimelineNode {
  key: string;
  status: 'completed' | 'active' | 'pending' | 'warning' | 'error';
  icon: JSX.Element;
  label: Record<string, string>;
  desc: Record<string, string>;
}

// ─── Translations ───
type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'Detail Pesanan — AceProxy',
    loading: 'Memuat...',
    notFound: 'Pesanan tidak ditemukan',
    back: 'Kembali',
    backToOrders: 'Kembali ke Pesanan',
    orderNumber: 'Nomor Pesanan',
    orderDate: 'Tanggal',
    status: 'Status',
    items: 'Barang',
    qty: 'Jumlah',
    total: 'Total',
    subtotal: 'Subtotal',
    shippingFee: 'Ongkir',
    consolidation: 'Konsolidasi',
    free: 'GRATIS',
    address: 'Alamat Pengiriman',
    paymentMethod: 'Metode Pembayaran',
    timeline: 'Jejak Pesanan',
    purchaseOrder: 'Informasi Pembelian 1688',
    poNumber: 'No. Pembelian',
    poStatus: 'Status Pembelian',
    supplierUrl: 'Link 1688',
    viewOn1688: 'Lihat di 1688 →',
    trackingNumber: 'No. Resi',
    shareOrder: 'Bagikan',
    shareViaWhatsApp: 'Bagikan via WhatsApp',
    copyLink: 'Salin Tautan',
    copied: 'Tersalin!',
    timelineNodes: {
      PENDING: 'Menunggu Pembayaran',
      PAID: 'Pembayaran Diterima',
      MATCHED: 'Dijodohkan dengan Produk 1688',
      PURCHASING: 'AceProxy Membeli di 1688',
      ORDERED_ON_1688: 'Sudah Dipesan di 1688',
      SELLER_SHIPPED: 'Penjual 1688 Mengirim',
      IN_WAREHOUSE_CN: 'Sampai Gudang China',
      QC_PASSED: 'QC AI Lulus',
      QC_REJECTED: 'QC Tidak Lulus',
      CONSOLIDATING: 'Konsolidasi Paket',
      SHIPPED: 'Pengiriman Internasional',
      CLEARED_CUSTOMS: 'Bea Cukai Selesai',
      OUT_FOR_DELIVERY: 'Dalam Pengiriman Lokal',
      DELIVERED: 'Terkirim',
      COMPLETED: 'Selesai',
    },
    timelineDescs: {
      PENDING: 'Silakan selesaikan pembayaran',
      PAID: 'Pembayaran Anda telah diterima',
      MATCHED: 'Produk ditemukan di 1688',
      PURCHASING: 'Tim kami sedang membeli produk Anda',
      ORDERED_ON_1688: 'Pesanan ditempatkan di 1688',
      SELLER_SHIPPED: 'Penjual mengirim ke gudang kami',
      IN_WAREHOUSE_CN: 'Barang diterima di gudang China',
      QC_PASSED: 'Barang lulus pemeriksaan AI',
      QC_REJECTED: 'Barang perlu ditinjau ulang',
      CONSOLIDATING: 'Gabung dengan pesanan lain',
      SHIPPED: 'Dalam perjalanan ke Indonesia',
      CLEARED_CUSTOMS: 'Telah melewati bea cukai',
      OUT_FOR_DELIVERY: 'Kurir mengantar ke alamat Anda',
      DELIVERED: 'Paket telah diterima',
      COMPLETED: 'Pesanan selesai',
    },
  },
  EN: {
    title: 'Order Detail — AceProxy',
    loading: 'Loading...',
    notFound: 'Order not found',
    back: 'Back',
    backToOrders: 'Back to Orders',
    orderNumber: 'Order Number',
    orderDate: 'Date',
    status: 'Status',
    items: 'Items',
    qty: 'Qty',
    total: 'Total',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping',
    consolidation: 'Consolidation',
    free: 'FREE',
    address: 'Shipping Address',
    paymentMethod: 'Payment Method',
    timeline: 'Order Timeline',
    purchaseOrder: '1688 Purchase Info',
    poNumber: 'PO Number',
    poStatus: 'PO Status',
    supplierUrl: '1688 Link',
    viewOn1688: 'View on 1688 →',
    trackingNumber: 'Tracking No.',
    shareOrder: 'Share',
    shareViaWhatsApp: 'Share via WhatsApp',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    timelineNodes: {
      PENDING: 'Pending Payment',
      PAID: 'Payment Received',
      MATCHED: 'Matched with 1688',
      PURCHASING: 'Buying on 1688',
      ORDERED_ON_1688: 'Ordered on 1688',
      SELLER_SHIPPED: 'Seller Shipped',
      IN_WAREHOUSE_CN: 'Arrived CN Warehouse',
      QC_PASSED: 'QC Passed',
      QC_REJECTED: 'QC Failed',
      CONSOLIDATING: 'Consolidating',
      SHIPPED: 'International Shipping',
      CLEARED_CUSTOMS: 'Customs Cleared',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      COMPLETED: 'Completed',
    },
    timelineDescs: {
      PENDING: 'Please complete payment',
      PAID: 'Your payment has been received',
      MATCHED: 'Product matched on 1688',
      PURCHASING: 'Our team is purchasing for you',
      ORDERED_ON_1688: 'Order placed on 1688',
      SELLER_SHIPPED: 'Seller ships to our warehouse',
      IN_WAREHOUSE_CN: 'Received at China warehouse',
      QC_PASSED: 'Passed AI quality check',
      QC_REJECTED: 'Needs manual review',
      CONSOLIDATING: 'Combining with other orders',
      SHIPPED: 'On the way to Indonesia',
      CLEARED_CUSTOMS: 'Customs cleared',
      OUT_FOR_DELIVERY: 'Courier delivering to you',
      DELIVERED: 'Package received',
      COMPLETED: 'Order complete',
    },
  },
  ZH: {
    title: '订单详情 — AceProxy',
    loading: '加载中...',
    notFound: '订单未找到',
    back: '返回',
    backToOrders: '返回订单列表',
    orderNumber: '订单编号',
    orderDate: '日期',
    status: '状态',
    items: '商品',
    qty: '数量',
    total: '总额',
    subtotal: '小计',
    shippingFee: '运费',
    consolidation: '集运',
    free: '免费',
    address: '收货地址',
    paymentMethod: '支付方式',
    timeline: '订单追踪',
    purchaseOrder: '1688采购信息',
    poNumber: '采购单号',
    poStatus: '采购状态',
    supplierUrl: '1688链接',
    viewOn1688: '查看1688 →',
    trackingNumber: '快递单号',
    shareOrder: '分享',
    shareViaWhatsApp: '分享到 WhatsApp',
    copyLink: '复制链接',
    copied: '已复制！',
    timelineNodes: {
      PENDING: '等待付款',
      PAID: '支付成功',
      MATCHED: '匹配1688商品',
      PURCHASING: 'AceProxy代购中',
      ORDERED_ON_1688: '已在1688下单',
      SELLER_SHIPPED: '1688卖家已发货',
      IN_WAREHOUSE_CN: '已入库中国仓',
      QC_PASSED: 'AI质检通过',
      QC_REJECTED: '质检未通过',
      CONSOLIDATING: '集运合包中',
      SHIPPED: '国际运输中',
      CLEARED_CUSTOMS: '已清关',
      OUT_FOR_DELIVERY: '派送中',
      DELIVERED: '已签收',
      COMPLETED: '已完成',
    },
    timelineDescs: {
      PENDING: '请完成支付',
      PAID: '您的付款已收到',
      MATCHED: '已匹配1688商品',
      PURCHASING: '我们正在为您采购',
      ORDERED_ON_1688: '已在1688下单',
      SELLER_SHIPPED: '卖家发货至仓库',
      IN_WAREHOUSE_CN: '已到达中国仓库',
      QC_PASSED: 'AI质检已通过',
      QC_REJECTED: '需人工复核',
      CONSOLIDATING: '合包中',
      SHIPPED: '运往印尼途中',
      CLEARED_CUSTOMS: '海关已放行',
      OUT_FOR_DELIVERY: '快递派送中',
      DELIVERED: '已收货',
      COMPLETED: '订单完成',
    },
  },
};

const ORDER_FLOW_KEYS = [
  'PENDING', 'PAID', 'MATCHED', 'PURCHASING', 'ORDERED_ON_1688',
  'SELLER_SHIPPED', 'IN_WAREHOUSE_CN', 'QC_PASSED',
  'CONSOLIDATING', 'SHIPPED', 'CLEARED_CUSTOMS',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED',
];

const STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  MATCHED: 'MATCHED',
  PURCHASING: 'PURCHASING',
  ORDERED_ON_1688: 'ORDERED_ON_1688',
  SELLER_SHIPPED: 'SELLER_SHIPPED',
  IN_WAREHOUSE_CN: 'IN_WAREHOUSE_CN',
  QC_PASSED: 'QC_PASSED',
  QC_REJECTED: 'QC_REJECTED',
  CONSOLIDATING: 'CONSOLIDATING',
  SHIPPED: 'SHIPPED',
  CLEARED_CUSTOMS: 'CLEARED_CUSTOMS',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RMA_INITIATED: 'RMA_INITIATED',
  RESALE: 'RESALE',
};

const STATUS_BG_MAP: Record<string, string> = {
  PENDING: 'bg-warning-soft text-warning border-warning',
  PAID: 'bg-ocean-soft text-ocean border-ocean',
  MATCHED: 'bg-ocean-soft text-ocean border-ocean',
  PURCHASING: 'bg-warning-soft text-warning border-warning',
  ORDERED_ON_1688: 'bg-ocean-soft text-ocean border-ocean',
  SELLER_SHIPPED: 'bg-ocean-soft text-ocean border-ocean',
  IN_WAREHOUSE_CN: 'bg-ocean-soft text-ocean border-ocean',
  QC_PASSED: 'bg-success-soft text-success border-success',
  QC_REJECTED: 'bg-error-soft text-error border-error',
  CONSOLIDATING: 'bg-warning-soft text-warning border-warning',
  SHIPPED: 'bg-ocean-soft text-ocean border-ocean',
  CLEARED_CUSTOMS: 'bg-ocean-soft text-ocean border-ocean',
  OUT_FOR_DELIVERY: 'bg-ocean-soft text-ocean border-ocean',
  DELIVERED: 'bg-success-soft text-success border-success',
  COMPLETED: 'bg-success-soft text-success border-success',
  CANCELLED: 'bg-ink-mute/20 text-ink-mute border-ink-mute',
};

const TIMELINE_ICONS: Record<string, JSX.Element> = {
  PENDING: <Clock size={18} />,
  PAID: <Check size={18} />,
  MATCHED: <Search size={18} />,
  PURCHASING: <ShoppingCart size={18} />,
  ORDERED_ON_1688: <ShoppingBag size={18} />,
  SELLER_SHIPPED: <Truck size={18} />,
  IN_WAREHOUSE_CN: <Warehouse size={18} />,
  QC_PASSED: <Shield size={18} />,
  QC_REJECTED: <AlertCircle size={18} />,
  CONSOLIDATING: <Box size={18} />,
  SHIPPED: <Globe size={18} />,
  CLEARED_CUSTOMS: <Shield size={18} />,
  OUT_FOR_DELIVERY: <Truck size={18} />,
  DELIVERED: <MapPin size={18} />,
  COMPLETED: <Check size={18} />,
};

interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  sourceCost: number;
  shippingFee: number;
  serviceFee: number;
  createdAt: string;
  address?: string;
  paymentMethod?: string;
  items: Array<{
    id: string; productId: string; name: string;
    image?: string; quantity: number; priceIdr: number;
  }>;
  purchaseOrder?: {
    id: string; status: string; totalCostCny: number;
    trackingNumber?: string; sourceUrl?: string;
    notes?: string;
    items: Array<{ productName: string; quantity: number; unitCostCny: number; status: string }>;
  };
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lang, setLang] = useState<Lang>('ID');
  const [copied, setCopied] = useState(false);

  const t = T[lang];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('aceproxy_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/v1/order/${id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        const data = json.data || json;
        if (!data || !data.id) throw new Error('Empty');
        setOrder(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function getTimelineStatus(nodeKey: string, currentStatus: string): 'completed' | 'active' | 'pending' | 'warning' | 'error' {
    const currentIdx = ORDER_FLOW_KEYS.indexOf(STATUS_LABEL_MAP[currentStatus] || currentStatus);
    const nodeIdx = ORDER_FLOW_KEYS.indexOf(nodeKey);

    // Special cases
    if (currentStatus === 'QC_REJECTED' && nodeKey === 'QC_REJECTED') return 'error';
    if (currentStatus === 'QC_REJECTED' && nodeKey === 'QC_PASSED') return 'pending';

    if (nodeIdx < currentIdx) return 'completed';
    if (nodeIdx === currentIdx) return 'active';
    return 'pending';
  }

  function handleShareWhatsApp() {
    if (!order) return;
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/orders/${order.id}`;
    const text = encodeURIComponent(`Check out my AceProxy order #${order.id} — quality products from China factory at wholesale prices! 🔥`);
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function handleCopyLink() {
    if (!order) return;
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/orders/${order.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={44} className="animate-spin mx-auto mb-6 text-terracotta" />
          <p className="font-bold text-ink-mute text-lg">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ─── Not Found ───
  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-black flex items-center justify-center bg-white"
            style={{ boxShadow: '6px 6px 0 #000' }}>
            <Package size={36} className="text-ink-mute" />
          </div>
          <h1 className="font-display text-2xl font-black text-ink uppercase mb-3">{t.notFound}</h1>
          <Link href="/orders" className="btn-brutal-sm">
            <ArrowLeft size={16} /> {t.backToOrders}
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = STATUS_LABEL_MAP[order.status] || order.status;
  const statusBg = STATUS_BG_MAP[order.status] || STATUS_BG_MAP.PENDING;

  return (
    <>
      <Head><title>{t.title}</title></Head>

      <div className="min-h-screen bg-canvas-warm font-body">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                <span className="font-display font-black text-lg text-ink tracking-tight hidden sm:block">ACEPROXY</span>
              </Link>
              <Link href="/orders" className="btn-brutal-sm text-[13px] !px-4 !py-2">
                <ArrowLeft size={14} /> {t.backToOrders}
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-terracotta"><Home size={14} /></Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-terracotta">{t.backToOrders}</Link>
            <span>/</span>
            <span className="text-ink">#{order.id.slice(0, 8)}</span>
          </div>

          {/* ─── Order Header ─── */}
          <div className="bg-white border-4 border-black p-6 mb-6"
            style={{ boxShadow: '6px 6px 0 #000' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-bold text-ink-mute uppercase tracking-wider mb-1">{t.orderNumber}</div>
                <div className="font-display font-black text-xl text-ink tracking-tight">#{order.id}</div>
                <div className="text-xs text-ink-secondary font-medium mt-1">
                  {t.orderDate}: {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 border-3 text-sm font-display font-black uppercase ${statusBg}`}
                style={{ boxShadow: '3px 3px 0 #000' }}>
                <Check size={16} /> {statusLabel}
              </span>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2 pt-3 border-t-2 border-dashed border-black/10">
              <button onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#25D366] text-white text-[11px] font-display font-bold uppercase hover:bg-[#1DA851] transition-colors"
                style={{ boxShadow: '2px 2px 0 #000' }}>
                <MessageCircle size={14} /> {t.shareViaWhatsApp}
              </button>
              <button onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[11px] font-display font-bold uppercase transition-colors ${copied ? 'bg-success text-white' : 'bg-white hover:bg-canvas-gray'}`}
                style={{ boxShadow: '2px 2px 0 #000' }}>
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? t.copied : t.copyLink}
              </button>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* ─── LEFT: Timeline ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline */}
              <section className="bg-white border-4 border-black p-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h2 className="font-display font-black text-lg text-ink uppercase mb-5 pb-3 border-b-3 border-black flex items-center gap-2">
                  <Clock size={20} className="text-terracotta" /> {t.timeline}
                </h2>

                <div className="relative">
                  {ORDER_FLOW_KEYS.map((nodeKey, idx) => {
                    const nodeStatus = getTimelineStatus(nodeKey, order.status);
                    const isLast = idx === ORDER_FLOW_KEYS.length - 1;
                    const icon = TIMELINE_ICONS[nodeKey];

                    // Determine dot color
                    let dotBg = 'bg-canvas-gray border-ink-mute text-ink-mute';
                    switch (nodeStatus) {
                      case 'completed': dotBg = 'bg-success border-success text-white'; break;
                      case 'active': dotBg = 'bg-terracotta border-terracotta text-white animate-pulse'; break;
                      case 'warning': dotBg = 'bg-warning border-warning text-white'; break;
                      case 'error': dotBg = 'bg-error border-error text-white'; break;
                    }

                    return (
                      <div key={nodeKey} className="flex gap-4">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 border-3 flex items-center justify-center flex-shrink-0 relative z-10 ${dotBg}`}
                            style={{ boxShadow: nodeStatus === 'active' ? '3px 3px 0 #000' : 'none' }}>
                            {icon}
                          </div>
                          {!isLast && (
                            <div className={`w-1 flex-1 min-h-[2rem] ${nodeStatus === 'completed' ? 'bg-success' : 'bg-ink-mute/20'}`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-6 flex-1">
                          <h4 className={`text-sm font-display font-black uppercase leading-tight mb-1 ${nodeStatus === 'pending' ? 'text-ink-mute/50' : 'text-ink'}`}>
                            {t.timelineNodes[nodeKey] || nodeKey}
                          </h4>
                          <p className={`text-xs font-medium leading-relaxed ${nodeStatus === 'pending' ? 'text-ink-mute/40' : 'text-ink-secondary'}`}>
                            {t.timelineDescs[nodeKey] || ''}
                          </p>
                          {nodeStatus === 'active' && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-terracotta rounded-full animate-ping" />
                              <div className="w-2 h-2 bg-terracotta rounded-full" />
                              <span className="text-[10px] font-display font-bold text-terracotta uppercase ml-1">Sekarang</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 1688 Purchase Order Info */}
              {order.purchaseOrder && (
                <section className="bg-white border-4 border-black p-6"
                  style={{ boxShadow: '4px 4px 0 #000' }}>
                  <h2 className="font-display font-black text-lg text-ink uppercase mb-5 pb-3 border-b-3 border-black flex items-center gap-2">
                    <ShoppingBag size={20} className="text-terracotta" /> {t.purchaseOrder}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">{t.poNumber}</div>
                      <div className="font-mono text-sm font-bold text-ink">{order.purchaseOrder.id.slice(0, 12)}...</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">{t.poStatus}</div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-black text-[11px] font-display font-bold uppercase bg-warning-soft text-warning">
                        {order.purchaseOrder.status}
                      </span>
                    </div>
                    {order.purchaseOrder.sourceUrl && (
                      <div className="sm:col-span-2">
                        <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">{t.supplierUrl}</div>
                        <a href={order.purchaseOrder.sourceUrl} target="_blank" rel="noopener"
                          className="inline-flex items-center gap-1.5 px-3 py-2 border-3 border-black bg-canvas-warm text-xs font-display font-bold text-ocean uppercase hover:bg-terracotta hover:text-white hover:border-terracotta transition-colors"
                          style={{ boxShadow: '2px 2px 0 #000' }}>
                          <ExternalLink size={14} /> {t.viewOn1688}
                        </a>
                      </div>
                    )}
                    {order.purchaseOrder.trackingNumber && (
                      <div className="sm:col-span-2">
                        <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">{t.trackingNumber}</div>
                        <div className="font-mono text-sm font-bold text-ink bg-canvas-gray px-3 py-1.5 border-2 border-black inline-block">
                          {order.purchaseOrder.trackingNumber}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PO Items */}
                  {order.purchaseOrder.items?.length > 0 && (
                    <div className="mt-4 border-t-2 border-dashed border-black/10 pt-3">
                      <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-2">{t.items}</div>
                      {order.purchaseOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
                          <span className="font-bold text-ink">{item.productName}</span>
                          <span className="font-mono text-ink-secondary">
                            {item.quantity}× {fmtCny(item.unitCostCny)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 mt-2 border-t-2 border-black">
                        <span className="font-display font-black text-sm uppercase text-ink">{t.total}</span>
                        <span className="font-display font-black text-lg text-terracotta">{fmtCny(order.purchaseOrder.totalCostCny)}</span>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* ─── RIGHT: Order Summary ─── */}
            <div className="mt-6 lg:mt-0">
              <div className="bg-white border-4 border-black p-5 sticky top-20"
                style={{ boxShadow: '6px 6px 0 #000' }}>
                <h2 className="font-display font-black text-lg text-ink uppercase mb-4 pb-3 border-b-3 border-black">
                  {t.items}
                </h2>

                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-3 items-center py-3 border-b-2 border-dashed border-black/10 last:border-0">
                    <div className="w-14 h-14 border-2 border-black bg-canvas-gray flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : <span className="text-xl">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-[10px] text-ink-mute">{item.quantity}× {fmtRp(item.priceIdr)}</p>
                    </div>
                    <div className="text-sm font-display font-black text-ink">
                      {fmtRp(item.priceIdr * item.quantity)}
                    </div>
                  </div>
                ))}

                <div className="border-t-3 border-black mt-3 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.subtotal}</span>
                    <span className="font-display font-black text-ink">{fmtRp(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.shippingFee}</span>
                    <span className="font-display font-black text-ink">
                      {order.shippingFee ? fmtRp(order.shippingFee) : t.free}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.consolidation}</span>
                    <span className="font-display font-black text-success uppercase text-xs">{t.free}</span>
                  </div>
                </div>

                <div className="flex justify-between py-4 mt-2 border-t-4 border-black">
                  <span className="font-display font-black text-base text-ink uppercase">{t.total}</span>
                  <span className="font-display font-black text-2xl text-terracotta">{fmtRp(order.totalAmount)}</span>
                </div>

                {order.address && (
                  <div className="mt-4 pt-3 border-t-2 border-dashed border-black/10">
                    <div className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-1">{t.address}</div>
                    <p className="text-xs text-ink-secondary leading-relaxed">{order.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-ink text-white border-t-4 border-black mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
            <p className="text-xs text-white/40 font-bold uppercase">© 2026 AceProxy</p>
          </div>
        </footer>
      </div>
    </>
  );
}
