import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '@/hooks/useCart';
import {
  ArrowLeft, Home, ShoppingCart, ShieldCheck, Truck,
  Check, MapPin, CreditCard, Smartphone, ArrowRight,
  Package, RefreshCw,
} from 'lucide-react';

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

// ─── Translation ───
type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'Checkout — AceProxy',
    heading: 'Checkout',
    breadcrumb: 'Checkout',
    // Steps
    stepAddress: 'Alamat',
    stepPayment: 'Pembayaran',
    stepConfirm: 'Konfirmasi',
    // Form
    fullName: 'Nama Lengkap',
    phone: 'WhatsApp / No. HP',
    phoneExample: '0812-3456-7890',
    province: 'Provinsi',
    city: 'Kota / Kabupaten',
    district: 'Kecamatan',
    address: 'Alamat Lengkap',
    addressPlaceholder: 'Nama jalan, nomor rumah, RT/RW, kode pos...',
    postalCode: 'Kode Pos',
    // Shipping
    shipping: 'Pengiriman',
    shippingStandard: 'Standar (14-21 hari)',
    shippingExpress: 'Ekspres (7-10 hari)',
    shippingDesc: 'termasuk konsolidasi gratis',
    // Payment
    payment: 'Metode Pembayaran',
    paymentXendit: 'Xendit (Escrow)',
    paymentDesc: 'Dana aman sampai barang diterima',
    paymentVA: 'Virtual Account Bank',
    paymentBCA: 'BCA Virtual Account',
    paymentMandiri: 'Mandiri Virtual Account',
    paymentBNI: 'BNI Virtual Account',
    paymentEWallet: 'E-Wallet',
    paymentGoPay: 'GoPay',
    paymentOVO: 'OVO',
    paymentDana: 'DANA',
    paymentQRIS: 'QRIS',
    paymentRetail: 'Retail',
    paymentIndomaret: 'Indomaret',
    paymentAlfamart: 'Alfamart',
    // Summary
    summary: 'Ringkasan Pesanan',
    items: 'Barang',
    subtotal: 'Subtotal',
    shippingFee: 'Ongkos Kirim',
    consolidation: 'Konsolidasi',
    free: 'GRATIS',
    total: 'Total',
    // Button
    placeOrder: 'Buat Pesanan',
    placingOrder: 'Memproses...',
    // Success
    success: 'Pesanan Berhasil Dibuat!',
    successMsg: 'Pesanan Anda sedang diproses. Tim kami akan menghubungi melalui WhatsApp untuk konfirmasi pembayaran.',
    orderNumber: 'Nomor Pesanan',
    viewOrders: 'Lihat Pesanan',
    continueShopping: 'Lanjut Belanja',
    // Empty
    empty: 'Keranjang kosong.',
    emptyAction: 'Kembali Belanja',
    // Trust
    trustNote: 'Pembayaran diproses oleh Xendit. Dana Anda aman dengan sistem escrow.',
    required: 'wajib diisi',
  },
  EN: {
    title: 'Checkout — AceProxy',
    heading: 'Checkout',
    breadcrumb: 'Checkout',
    stepAddress: 'Address',
    stepPayment: 'Payment',
    stepConfirm: 'Confirm',
    fullName: 'Full Name',
    phone: 'WhatsApp / Phone',
    phoneExample: '0812-3456-7890',
    province: 'Province',
    city: 'City',
    district: 'District',
    address: 'Full Address',
    addressPlaceholder: 'Street, house number, postal code...',
    postalCode: 'Postal Code',
    shipping: 'Shipping',
    shippingStandard: 'Standard (14-21 days)',
    shippingExpress: 'Express (7-10 days)',
    shippingDesc: 'includes free consolidation',
    payment: 'Payment Method',
    paymentXendit: 'Xendit (Escrow)',
    paymentDesc: 'Funds safe until delivery',
    paymentVA: 'Bank Virtual Account',
    paymentBCA: 'BCA Virtual Account',
    paymentMandiri: 'Mandiri Virtual Account',
    paymentBNI: 'BNI Virtual Account',
    paymentEWallet: 'E-Wallet',
    paymentGoPay: 'GoPay',
    paymentOVO: 'OVO',
    paymentDana: 'DANA',
    paymentQRIS: 'QRIS',
    paymentRetail: 'Retail',
    paymentIndomaret: 'Indomaret',
    paymentAlfamart: 'Alfamart',
    summary: 'Order Summary',
    items: 'Items',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping Fee',
    consolidation: 'Consolidation',
    free: 'FREE',
    total: 'Total',
    placeOrder: 'Place Order',
    placingOrder: 'Processing...',
    success: 'Order Placed Successfully!',
    successMsg: 'Your order is being processed. Our team will contact you via WhatsApp for payment confirmation.',
    orderNumber: 'Order Number',
    viewOrders: 'View Orders',
    continueShopping: 'Continue Shopping',
    empty: 'Cart is empty.',
    emptyAction: 'Back to Shopping',
    trustNote: 'Payment processed by Xendit. Your funds are safe with escrow.',
    required: 'required',
  },
  ZH: {
    title: '结算 — AceProxy',
    heading: '结算',
    breadcrumb: '结算',
    stepAddress: '地址',
    stepPayment: '支付',
    stepConfirm: '确认',
    fullName: '姓名',
    phone: 'WhatsApp / 手机号',
    phoneExample: '0812-3456-7890',
    province: '省份',
    city: '城市',
    district: '区/县',
    address: '详细地址',
    addressPlaceholder: '街道、门牌号、邮编...',
    postalCode: '邮编',
    shipping: '配送',
    shippingStandard: '标准 (14-21天)',
    shippingExpress: '加急 (7-10天)',
    shippingDesc: '含免费集运',
    payment: '支付方式',
    paymentXendit: 'Xendit (托管)',
    paymentDesc: '收货后再放款，资金安全',
    paymentVA: '银行虚拟账户',
    paymentBCA: 'BCA 虚拟账户',
    paymentMandiri: 'Mandiri 虚拟账户',
    paymentBNI: 'BNI 虚拟账户',
    paymentEWallet: '电子钱包',
    paymentGoPay: 'GoPay',
    paymentOVO: 'OVO',
    paymentDana: 'DANA',
    paymentQRIS: 'QRIS',
    paymentRetail: '便利店',
    paymentIndomaret: 'Indomaret',
    paymentAlfamart: 'Alfamart',
    summary: '订单摘要',
    items: '商品',
    subtotal: '小计',
    shippingFee: '运费',
    consolidation: '集运',
    free: '免费',
    total: '总计',
    placeOrder: '提交订单',
    placingOrder: '处理中...',
    success: '下单成功！',
    successMsg: '您的订单正在处理。客服将通过 WhatsApp 联系您确认付款。',
    orderNumber: '订单编号',
    viewOrders: '查看订单',
    continueShopping: '继续购物',
    empty: '购物车为空。',
    emptyAction: '返回购物',
    trustNote: '由 Xendit 处理支付。资金托管，安全可靠。',
    required: '必填',
  },
};

// ─── Payment Method Options ───
const PAYMENT_GROUPS = [
  {
    group: 'paymentVA',
    icon: <CreditCard size={20} />,
    methods: [
      { id: 'bca', labelKey: 'paymentBCA' },
      { id: 'mandiri', labelKey: 'paymentMandiri' },
      { id: 'bni', labelKey: 'paymentBNI' },
    ],
  },
  {
    group: 'paymentEWallet',
    icon: <Smartphone size={20} />,
    methods: [
      { id: 'gopay', labelKey: 'paymentGoPay' },
      { id: 'ovo', labelKey: 'paymentOVO' },
      { id: 'dana', labelKey: 'paymentDana' },
    ],
  },
  {
    group: 'paymentQRIS',
    icon: <Smartphone size={20} />,
    methods: [{ id: 'qris', labelKey: 'paymentQRIS' }],
  },
  {
    group: 'paymentRetail',
    icon: <Package size={20} />,
    methods: [
      { id: 'indomaret', labelKey: 'paymentIndomaret' },
      { id: 'alfamart', labelKey: 'paymentAlfamart' },
    ],
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedItems, subtotal, clearCart, loaded } = useCart();

  const [lang] = useState<Lang>('ID');
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [form, setForm] = useState({
    fullName: '', phone: '', province: '', city: '', district: '',
    address: '', postalCode: '',
  });
  const [shipping, setShipping] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('');

  const t = T[lang];

  useEffect(() => { if (loaded) setHydrated(true); }, [loaded]);

  // Redirect if cart empty
  useEffect(() => {
    if (hydrated && selectedItems.length === 0 && !orderPlaced) {
      router.replace('/cart');
    }
  }, [hydrated, selectedItems, orderPlaced, router]);

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const shippingCost = shipping === 'express' ? 150_000 : 0;
  const total = subtotal + shippingCost;

  function canSubmit(): boolean {
    return form.fullName.trim() !== '' && form.phone.trim() !== '' && form.address.trim() !== ''
      && paymentMethod !== '' && !submitting;
  }

  async function handlePlaceOrder() {
    if (!canSubmit()) return;
    setSubmitting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('aceproxy_token') : null;
    const orderPayload = {
      address: `${form.fullName}, ${form.phone}, ${form.address}, ${form.city}, ${form.province}, ${form.postalCode}`,
      paymentMethod,
      shippingMethod: shipping,
      itemIds: selectedItems.map(i => i.productId),
    };

    try {
      // Try backend first
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/trade/order', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const json = await res.json();
        const orderId = json.data?.id || json.data?.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`;
        setOrderNumber(orderId);
        setOrderPlaced(true);
        clearCart();
        setSubmitting(false);
        return;
      }
    } catch {
      // 后端不可用时不静默创建假订单，向用户报告错误
      setSubmitting(false);
      setErrorMessage('Layanan sedang sibuk. Silakan coba lagi dalam beberapa saat. / Service is busy. Please try again shortly.');
      return;
    }

    // 请求已发出但后端返回错误
    setSubmitting(false);
    setErrorMessage('Pembayaran gagal diproses. Silakan coba lagi. / Payment could not be processed. Please try again.');
  }

  if (!hydrated) {
    return <div className="min-h-screen bg-canvas-warm" />;
  }

  // ─── Success State ───
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center px-4">
        <div className="text-center max-w-lg w-full">
          <div className="bg-white border-4 border-black p-10"
            style={{ boxShadow: '8px 8px 0 #000' }}>
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-success bg-success-soft flex items-center justify-center">
              <Check size={40} className="text-success" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em] mb-3">
              {t.success}
            </h1>
            <p className="text-ink-secondary mb-6 leading-relaxed">{t.successMsg}</p>
            <div className="inline-block px-5 py-3 border-3 border-black bg-canvas-warm mb-8">
              <span className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-widest block mb-1">
                {t.orderNumber}
              </span>
              <span className="font-display font-black text-xl text-ink tracking-tight">
                {orderNumber}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/orders" className="btn-brutal">
                <Package size={18} /> {t.viewOrders}
              </Link>
              <Link href="/products" className="btn-brutal-outline">
                <ArrowRight size={18} /> {t.continueShopping}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Checkout Form ───
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
              <div className="flex items-center gap-2.5">
                <Link href="/cart" className="btn-brutal-sm-outline text-[13px] !px-3 !py-1.5">
                  <ArrowLeft size={14} /> Kembali
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-terracotta"><Home size={14} /></Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-terracotta">Keranjang</Link>
            <span>/</span>
            <span className="text-ink">{t.breadcrumb}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em] mb-8">
            {t.heading}
          </h1>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* ─── LEFT: Forms (col-span-2) ─── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ─── Shipping Address ─── */}
              <section className="bg-white border-4 border-black p-5 sm:p-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h2 className="font-display font-black text-lg text-ink uppercase flex items-center gap-2 mb-5 pb-3 border-b-3 border-black">
                  <MapPin size={20} className="text-terracotta" /> {t.stepAddress}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">
                      {t.fullName} <span className="text-error">*</span>
                    </label>
                    <input
                      value={form.fullName}
                      onChange={e => updateForm('fullName', e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full px-4 py-2.5 border-3 border-black text-sm font-medium
                        outline-none focus:border-terracotta bg-canvas-warm" />
                  </div>
                  <div>
                    <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">
                      {t.phone} <span className="text-error">*</span>
                    </label>
                    <input
                      value={form.phone}
                      onChange={e => updateForm('phone', e.target.value)}
                      placeholder={t.phoneExample}
                      className="w-full px-4 py-2.5 border-3 border-black text-sm font-medium
                        outline-none focus:border-terracotta bg-canvas-warm" />
                  </div>
                  <div>
                    <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">{t.province}</label>
                    <input value={form.province} onChange={e => updateForm('province', e.target.value)}
                      placeholder="DKI Jakarta"
                      className="w-full px-4 py-2.5 border-3 border-black text-sm font-medium
                        outline-none focus:border-terracotta bg-canvas-warm" />
                  </div>
                  <div>
                    <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">{t.city}</label>
                    <input value={form.city} onChange={e => updateForm('city', e.target.value)}
                      placeholder="Jakarta Selatan"
                      className="w-full px-4 py-2.5 border-3 border-black text-sm font-medium
                        outline-none focus:border-terracotta bg-canvas-warm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">
                      {t.address} <span className="text-error">*</span>
                    </label>
                    <textarea
                      value={form.address}
                      onChange={e => updateForm('address', e.target.value)}
                      placeholder={t.addressPlaceholder}
                      rows={3}
                      className="w-full px-4 py-2.5 border-3 border-black text-sm font-medium
                        outline-none focus:border-terracotta bg-canvas-warm resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">{t.postalCode}</label>
                    <input value={form.postalCode} onChange={e => updateForm('postalCode', e.target.value)}
                      placeholder="12950"
                      className="w-full px-4 py-2.5 border-3 border-black text-sm font-medium
                        outline-none focus:border-terracotta bg-canvas-warm" />
                  </div>
                </div>
              </section>

              {/* ─── Shipping Method ─── */}
              <section className="bg-white border-4 border-black p-5 sm:p-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h2 className="font-display font-black text-lg text-ink uppercase flex items-center gap-2 mb-4 pb-3 border-b-3 border-black">
                  <Truck size={20} className="text-terracotta" /> {t.shipping}
                </h2>
                <div className="space-y-3">
                  {[
                    { id: 'standard', label: t.shippingStandard, cost: 0, desc: t.shippingDesc },
                    { id: 'express', label: t.shippingExpress, cost: 150000 },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setShipping(opt.id)}
                      className={`w-full flex items-center justify-between p-4 border-3 transition-colors text-left
                        ${shipping === opt.id
                          ? 'border-terracotta bg-terracotta text-white'
                          : 'border-black bg-white hover:bg-canvas-gray'}`}>
                      <div>
                        <div className={`font-display font-bold text-sm uppercase ${shipping === opt.id ? 'text-white' : 'text-ink'}`}>
                          {opt.label}
                        </div>
                        {opt.desc && (
                          <div className={`text-xs font-medium mt-0.5 ${shipping === opt.id ? 'text-white/70' : 'text-ink-mute'}`}>
                            {opt.desc}
                          </div>
                        )}
                      </div>
                      <div className="font-display font-black text-lg">
                        {opt.cost === 0 ? t.free : fmtRp(opt.cost)}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* ─── Payment Method ─── */}
              <section className="bg-white border-4 border-black p-5 sm:p-6"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <h2 className="font-display font-black text-lg text-ink uppercase flex items-center gap-2 mb-4 pb-3 border-b-3 border-black">
                  <CreditCard size={20} className="text-terracotta" /> {t.payment}
                </h2>
                <p className="text-xs text-ink-secondary mb-4 font-medium">{t.paymentDesc}</p>
                <div className="space-y-4">
                  {PAYMENT_GROUPS.map(group => (
                    <div key={group.group}>
                      <div className="flex items-center gap-2 text-xs font-display font-bold text-ink-mute uppercase tracking-wider mb-2">
                        {group.icon} {t[group.group]}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {group.methods.map(m => (
                          <button key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 border-3 text-xs font-display font-bold uppercase
                              transition-colors ${paymentMethod === m.id
                                ? 'border-terracotta bg-terracotta text-white'
                                : 'border-black bg-white hover:bg-canvas-gray text-ink'}`}>
                            <div className={`w-3 h-3 border-2 flex items-center justify-center flex-shrink-0
                              ${paymentMethod === m.id ? 'border-white bg-white' : 'border-black'}`}>
                              {paymentMethod === m.id && <Check size={10} className="text-terracotta" />}
                            </div>
                            {t[m.labelKey]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ─── RIGHT: Order Summary ─── */}
            <div className="mt-6 lg:mt-0">
              <div className="bg-white border-4 border-black p-5 sticky top-20"
                style={{ boxShadow: '6px 6px 0 #000' }}>
                <h2 className="font-display font-black text-lg text-ink uppercase mb-4 pb-3 border-b-3 border-black">
                  {t.summary}
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 border-2 border-black bg-canvas-gray flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : <span className="flex items-center justify-center w-full h-full text-lg">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-ink line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-ink-mute">{item.qty}× {fmtRp(item.priceIdr)}</p>
                      </div>
                      <div className="text-xs font-display font-black text-ink flex-shrink-0">
                        {fmtRp(item.priceIdr * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t-3 border-black pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.items}</span>
                    <span className="font-display font-black text-ink">{selectedItems.reduce((s, i) => s + i.qty, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.subtotal}</span>
                    <span className="font-display font-black text-ink">{fmtRp(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.shippingFee}</span>
                    <span className="font-display font-black text-ink">
                      {shippingCost === 0 ? t.free : fmtRp(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-secondary font-bold">{t.consolidation}</span>
                    <span className="font-display font-black text-success uppercase text-xs">{t.free}</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between py-4 mt-2 border-t-4 border-black">
                  <span className="font-display font-black text-base text-ink uppercase">{t.total}</span>
                  <span className="font-display font-black text-2xl text-terracotta">{fmtRp(total)}</span>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3 mb-3 bg-error/10 border-2 border-error text-error text-sm font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Place Order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!canSubmit()}
                  className={`btn-brutal w-full text-base ${!canSubmit() ? 'opacity-40 pointer-events-none' : ''}`}>
                  {submitting ? (
                    <><RefreshCw size={18} className="animate-spin" /> {t.placingOrder}</>
                  ) : (
                    <>{t.placeOrder} <ArrowRight size={20} /></>
                  )}
                </button>

                {/* Trust Note */}
                <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-canvas-warm border-2 border-black">
                  <ShieldCheck size={16} className="text-ocean flex-shrink-0" />
                  <p className="text-[11px] font-medium text-ink-secondary leading-tight">{t.trustNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-ink text-white border-t-4 border-black mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="text-center">
              <p className="text-xs text-white/40 font-bold uppercase">© 2026 AceProxy</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
