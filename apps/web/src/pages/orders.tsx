import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Package, ArrowRight, Home, ShoppingBag, Truck, Check,
  Clock, AlertCircle, Search,
} from 'lucide-react';

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

interface OrderItem {
  id: string;
  orderId: string;
  status: string;
  total: number;
  itemCount: number;
  date: string;
  productName: string;
}

const STATUS_MAP: Record<string, { label: Record<string, string>; icon: JSX.Element; color: string }> = {
  PENDING: {
    label: { ID: 'Menunggu Pembayaran', EN: 'Pending Payment', ZH: '等待付款' },
    icon: <Clock size={14} />,
    color: 'bg-warning-soft text-warning border-warning',
  },
  PAID: {
    label: { ID: 'Dibayar', EN: 'Paid', ZH: '已支付' },
    icon: <Check size={14} />,
    color: 'bg-ocean-soft text-ocean border-ocean',
  },
  PURCHASING: {
    label: { ID: 'Pembelian', EN: 'Purchasing', ZH: '采购中' },
    icon: <ShoppingBag size={14} />,
    color: 'bg-warning-soft text-warning border-warning',
  },
  CONSOLIDATING: {
    label: { ID: 'Konsolidasi', EN: 'Consolidating', ZH: '集运中' },
    icon: <Package size={14} />,
    color: 'bg-ocean-soft text-ocean border-ocean',
  },
  SHIPPED: {
    label: { ID: 'Dikirim', EN: 'Shipped', ZH: '已发货' },
    icon: <Truck size={14} />,
    color: 'bg-ocean-soft text-ocean border-ocean',
  },
  DELIVERED: {
    label: { ID: 'Terkirim', EN: 'Delivered', ZH: '已签收' },
    icon: <Check size={14} />,
    color: 'bg-success-soft text-success border-success',
  },
};

type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'Pesanan Saya — AceProxy',
    heading: 'Pesanan Saya',
    empty: 'Belum ada pesanan.',
    emptyDesc: 'Pesanan Anda akan muncul di sini setelah checkout.',
    emptyAction: 'Mulai Belanja',
    all: 'Semua',
    pending: 'Menunggu',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Selesai',
    viewDetail: 'Lihat Detail',
    orderDate: 'Tanggal',
    total: 'Total',
    items: 'barang',
  },
  EN: {
    title: 'My Orders — AceProxy',
    heading: 'My Orders',
    empty: 'No orders yet.',
    emptyDesc: 'Your orders will appear here after checkout.',
    emptyAction: 'Start Shopping',
    all: 'All',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Completed',
    viewDetail: 'View Detail',
    orderDate: 'Date',
    total: 'Total',
    items: 'items',
  },
  ZH: {
    title: '我的订单 — AceProxy',
    heading: '我的订单',
    empty: '暂无订单。',
    emptyDesc: '结账后订单将显示在这里。',
    emptyAction: '去购物',
    all: '全部',
    pending: '待付款',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已完成',
    viewDetail: '查看详情',
    orderDate: '日期',
    total: '总额',
    items: '件',
  },
};

const ORDER_TABS = [
  { key: 'all', labelKey: 'all' },
  { key: 'PENDING', labelKey: 'pending' },
  { key: 'PAID,PURCHASING,CONSOLIDATING', labelKey: 'processing' },
  { key: 'SHIPPED', labelKey: 'shipped' },
  { key: 'DELIVERED', labelKey: 'delivered' },
];

export default function OrdersPage() {
  const [lang] = useState<Lang>('ID');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const t = T[lang];

  useEffect(() => {
    async function fetchOrders() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('aceproxy_token') : null;
      if (token) {
        try {
          const res = await fetch('/api/v1/order/list?limit=20', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            const items = (json.data?.items || json.data || []).map((o: any): OrderItem => ({
              id: o.id,
              orderId: o.id,
              status: o.status || 'PENDING',
              total: o.totalIdr || 0,
              itemCount: o.productCount || 1,
              date: o.createdAt || '',
              productName: o.items?.[0]?.name || 'Pesanan',
            }));
            setOrders(items);
          }
        } catch { /* backend unavailable */ }
      }
      setLoaded(true);
    }
    fetchOrders();
  }, []);

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => activeTab.split(',').includes(o.status));

  return (
    <>
      <Head><title>{t.title}</title></Head>
      <div className="min-h-screen bg-canvas-warm font-body">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                <span className="font-display font-black text-lg tracking-tight hidden sm:block">ACEPROXY</span>
              </Link>
              <Link href="/login" className="btn-brutal-sm text-[13px] !px-4 !py-2">Masuk</Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-terracotta"><Home size={14} /></Link>
            <span>/</span>
            <span className="text-ink">{t.heading}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em] mb-6">
            {t.heading}
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ORDER_TABS.map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 border-3 font-display font-bold text-xs uppercase transition-colors
                  ${activeTab === tab.key
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-white border-black hover:bg-canvas-gray'}`}
                style={{ boxShadow: activeTab === tab.key ? '3px 3px 0 #000' : 'none' }}>
                {t[tab.labelKey]}
              </button>
            ))}
          </div>

          {/* Empty */}
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <Package size={56} className="mx-auto mb-5 text-ink-mute" />
              <h2 className="font-display text-xl font-black text-ink uppercase mb-3">{t.empty}</h2>
              <p className="text-ink-secondary mb-6">{t.emptyDesc}</p>
              <Link href="/products" className="btn-brutal">
                <ArrowRight size={18} /> {t.emptyAction}
              </Link>
            </div>
          )}

          {/* Order List */}
          <div className="space-y-4">
            {filtered.map(order => {
              const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
              return (
                <div key={order.id}
                  className="bg-white border-4 border-black p-4 sm:p-5 hover:shadow-[6px_6px_0_#000] transition-shadow"
                  style={{ boxShadow: '4px 4px 0 #000' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-dashed border-black/10">
                    <div>
                      <div className="text-xs font-bold text-ink-mute uppercase tracking-wider">
                        {t.orderDate}: {order.date}
                      </div>
                      <div className="font-display font-black text-sm text-ink mt-0.5">
                        #{order.orderId}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 text-[10px] font-display font-bold uppercase ${st.color}`}>
                      {st.icon} {st.label[lang]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-ink">{order.productName}</p>
                      <p className="text-xs text-ink-mute">{order.itemCount} {t.items}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-display font-black text-terracotta">
                        {fmtRp(order.total)}
                      </div>
                      <Link href={`/orders/${order.id}`}
                        className="mt-1 text-[10px] font-display font-bold text-ink-mute uppercase hover:text-terracotta transition-colors inline-block">
                        {t.viewDetail} →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="bg-ink text-white border-t-4 border-black mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
            <p className="text-xs text-white/40 font-bold uppercase">© 2026 AceProxy</p>
          </div>
        </footer>
      </div>
    </>
  );
}
