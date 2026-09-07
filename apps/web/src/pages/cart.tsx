import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCart, CartItem } from '@/hooks/useCart';
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft,
  Package, Home, ShieldCheck, Truck, X, CheckSquare, Square,
} from 'lucide-react';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

function fmtRp(n: number): string {
  return `Rp ${n.toLocaleString()}`;
}

// ─── Translation ───
type Lang = 'ID' | 'EN' | 'ZH';
const T: Record<Lang, any> = {
  ID: {
    title: 'Keranjang — AceProxy',
    heading: 'Keranjang Belanja',
    empty: 'Keranjang Anda kosong.',
    emptyDesc: 'Tambahkan produk dari halaman produk untuk mulai belanja.',
    emptyAction: 'Mulai Belanja',
    product: 'Produk',
    price: 'Harga',
    qty: 'Jumlah',
    subtotal: 'Subtotal',
    selectAll: 'Pilih Semua',
    deselectAll: 'Hapus Pilihan',
    delete: 'Hapus',
    checkout: 'Checkout',
    continueShopping: 'Lanjut Belanja',
    summary: 'Ringkasan Pesanan',
    totalItems: 'Total Barang',
    totalPrice: 'Total Harga',
    estimatedShipping: 'Estimasi Pengiriman',
    shippingCalc: 'Dihitung saat checkout',
    freeConsolidation: 'Konsolidasi Gratis',
    feesNote: 'Pajak & bea masuk dihitung saat checkout',
    trustNote: 'Pembayaran aman dengan escrow Xendit',
    perItem: '/item',
  },
  EN: {
    title: 'Cart — AceProxy',
    heading: 'Shopping Cart',
    empty: 'Your cart is empty.',
    emptyDesc: 'Add products from the product page to start shopping.',
    emptyAction: 'Start Shopping',
    product: 'Product',
    price: 'Price',
    qty: 'Qty',
    subtotal: 'Subtotal',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    delete: 'Remove',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    summary: 'Order Summary',
    totalItems: 'Total Items',
    totalPrice: 'Total Price',
    estimatedShipping: 'Est. Shipping',
    shippingCalc: 'Calculated at checkout',
    freeConsolidation: 'Free Consolidation',
    feesNote: 'Tax & duties calculated at checkout',
    trustNote: 'Secure payment with Xendit escrow',
    perItem: '/item',
  },
  ZH: {
    title: '购物车 — AceProxy',
    heading: '购物车',
    empty: '购物车是空的。',
    emptyDesc: '从商品页面添加商品开始购物。',
    emptyAction: '去购物',
    product: '商品',
    price: '单价',
    qty: '数量',
    subtotal: '小计',
    selectAll: '全选',
    deselectAll: '取消全选',
    delete: '删除',
    checkout: '去结算',
    continueShopping: '继续购物',
    summary: '订单摘要',
    totalItems: '商品总数',
    totalPrice: '总价',
    estimatedShipping: '预估运费',
    shippingCalc: '结算时计算',
    freeConsolidation: '免费集运',
    feesNote: '税费于结算时计算',
    trustNote: 'Xendit托管支付，安全可靠',
    perItem: '/件',
  },
};

export default function CartPage() {
  const {
    items, loaded, selectedItems, subtotal, allSelected,
    updateQty, removeItem, toggleSelect, selectAll,
  } = useCart();

  const [lang, setLang] = useState<Lang>('ID');
  const [hydrated, setHydrated] = useState(false);
  const t = T[lang];

  useEffect(() => { if (loaded) setHydrated(true); }, [loaded]);

  // Prevent SSR mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-canvas-warm flex items-center justify-center">
        <div className="text-center py-28 bg-white border-4 border-black px-10" style={{ boxShadow: '6px 6px 0 #000' }}>
          <ShoppingCart size={40} className="animate-pulse mx-auto mb-5 text-terracotta" />
          <p className="font-bold text-ink-mute">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>{t.title}</title></Head>

      <div className="min-h-screen bg-canvas-warm font-body">

        {/* ─── Header ─── */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">A</div>
                <span className="font-display font-black text-lg text-ink tracking-tight hidden sm:block">ACEPROXY</span>
              </Link>
              <div className="flex items-center gap-2.5">
                <Link href="/cart" className="relative p-2 border-3 border-black bg-terracotta transition-colors">
                  <ShoppingCart size={20} className="text-white" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-white text-[10px] font-display font-black flex items-center justify-center border-2 border-black">
                    {items.length}
                  </span>
                </Link>
                <Link href="/account" className="btn-brutal-sm text-[13px] !px-4 !py-2">Akun</Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-terracotta transition-colors"><Home size={14} /></Link>
            <span>/</span>
            <span className="text-ink">{t.heading}</span>
          </div>

          {/* ─── Empty State ─── */}
          {items.length === 0 && (
            <div className="text-center py-28 bg-white border-4 border-black" style={{ boxShadow: '6px 6px 0 #000' }}>
              <Package size={60} className="mx-auto mb-6 text-ink-mute" />
              <h2 className="font-display text-2xl font-black text-ink uppercase mb-3">{t.empty}</h2>
              <p className="text-ink-secondary mb-8 max-w-sm mx-auto">{t.emptyDesc}</p>
              <Link href="/products" className="btn-brutal">
                <ArrowRight size={20} /> {t.emptyAction}
              </Link>
            </div>
          )}

          {/* ─── Cart Content ─── */}
          {items.length > 0 && (
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* LEFT: Items List (col-span-2) */}
              <div className="lg:col-span-2">
                {/* Select All Bar */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => selectAll(!allSelected)}
                    className="flex items-center gap-2 px-3 py-1.5 border-3 border-black bg-white
                      font-display font-bold text-xs uppercase hover:bg-canvas-gray transition-colors"
                    style={{ boxShadow: '3px 3px 0 #000' }}>
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    {allSelected ? t.deselectAll : t.selectAll}
                  </button>
                  <span className="text-xs font-display font-bold text-ink-mute uppercase">
                    {selectedItems.length} / {items.length} {t.totalItems.toLowerCase()}
                  </span>
                </div>

                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id}
                      className="bg-white border-4 border-black p-4 flex gap-4 items-center
                        transition-all duration-150"
                      style={{ boxShadow: '4px 4px 0 #000' }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className="flex-shrink-0 text-ink-mute hover:text-terracotta transition-colors">
                        {item.selected
                          ? <CheckSquare size={22} className="text-terracotta" />
                          : <Square size={22} />}
                      </button>

                      {/* Image */}
                      <Link href={`/products/${item.productId}`} className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-3 border-black overflow-hidden bg-canvas-gray
                        hover:border-terracotta transition-colors">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-2xl">📦</span>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-display font-bold text-sm text-ink line-clamp-2 leading-snug
                            hover:text-terracotta transition-colors mb-1">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="text-lg font-display font-black text-terracotta">
                          {fmtRp(item.priceIdr)}
                          <span className="text-[10px] font-body text-ink-mute font-normal ml-1">{t.perItem}</span>
                        </div>

                        {/* Mobile Qty + Delete Row */}
                        <div className="flex items-center justify-between mt-2 sm:hidden">
                          <div className="flex items-center border-2 border-black bg-white">
                            <button onClick={() => updateQty(item.id, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center border-r-2 border-black hover:bg-canvas-gray">
                              <Minus size={14} /></button>
                            <div className="w-10 text-center font-display font-black text-sm">{item.qty}</div>
                            <button onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center border-l-2 border-black hover:bg-canvas-gray">
                              <Plus size={14} /></button>
                          </div>
                          <span className="font-display font-black text-sm">
                            {fmtRp(item.priceIdr * item.qty)}
                          </span>
                          <button onClick={() => removeItem(item.id)}
                            className="p-2 border-2 border-black bg-white hover:bg-error hover:text-white hover:border-error transition-colors">
                            <Trash2 size={16} /></button>
                        </div>
                      </div>

                      {/* Desktop Qty Controls */}
                      <div className="hidden sm:flex items-center border-3 border-black bg-white"
                        style={{ boxShadow: '3px 3px 0 #000' }}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-9 h-9 flex items-center justify-center border-r-3 border-black
                            hover:bg-canvas-gray transition-colors font-display font-black">
                          <Minus size={16} /></button>
                        <div className="w-12 text-center font-display font-black">{item.qty}</div>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-9 h-9 flex items-center justify-center border-l-3 border-black
                            hover:bg-canvas-gray transition-colors font-display font-black">
                          <Plus size={16} /></button>
                      </div>

                      {/* Desktop Item Total + Delete */}
                      <div className="hidden sm:block text-right flex-shrink-0 w-28">
                        <div className="font-display font-black text-base text-ink">
                          {fmtRp(item.priceIdr * item.qty)}
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="mt-1.5 text-[10px] font-display font-bold text-error uppercase
                            hover:text-ink transition-colors flex items-center gap-1 justify-end">
                          <Trash2 size={12} /> {t.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link href="/products"
                    className="inline-flex items-center gap-2 px-4 py-2.5 border-3 border-black
                      font-display font-bold text-sm uppercase
                      hover:bg-canvas-gray transition-colors bg-white"
                    style={{ boxShadow: '3px 3px 0 #000' }}>
                    <ArrowLeft size={16} /> {t.continueShopping}
                  </Link>
                </div>
              </div>

              {/* RIGHT: Summary Sidebar */}
              <div className="mt-6 lg:mt-0">
                <div className="bg-white border-4 border-black p-5 sticky top-20"
                  style={{ boxShadow: '6px 6px 0 #000' }}>
                  <h3 className="font-display font-black text-lg text-ink uppercase tracking-[-0.01em] mb-5 border-b-3 border-black pb-3">
                    {t.summary}
                  </h3>

                  {/* Total Items */}
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-bold text-ink-secondary">{t.totalItems}</span>
                    <span className="font-display font-black text-ink">
                      {selectedItems.reduce((s, i) => s + i.qty, 0)}
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between py-2 text-sm border-t-2 border-dashed border-black/10">
                    <span className="font-bold text-ink-secondary">{t.totalPrice}</span>
                    <span className="font-display font-black text-ink">{fmtRp(subtotal)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between py-2 text-sm border-t-2 border-dashed border-black/10">
                    <span className="font-bold text-ink-secondary">{t.estimatedShipping}</span>
                    <span className="text-xs text-ink-mute italic">{t.shippingCalc}</span>
                  </div>

                  {/* Free Consolidation Note */}
                  <div className="flex items-center gap-2 py-2 text-[11px] font-bold text-ocean uppercase tracking-wider">
                    <Truck size={14} /> {t.freeConsolidation}
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between py-4 border-t-4 border-black mt-2">
                    <span className="font-display font-black text-base text-ink uppercase">{t.totalPrice}</span>
                    <span className="font-display font-black text-2xl text-terracotta">{fmtRp(subtotal)}</span>
                  </div>

                  {/* Checkout Button */}
                  <Link href="/checkout"
                    className={`btn-brutal w-full text-base mt-4 ${selectedItems.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                    {t.checkout} <ArrowRight size={20} />
                  </Link>

                  {/* Trust Note */}
                  <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-canvas-warm border-2 border-black">
                    <ShieldCheck size={16} className="text-ocean flex-shrink-0" />
                    <p className="text-[11px] font-medium text-ink-secondary leading-tight">{t.trustNote}</p>
                  </div>

                  {/* Fees Note */}
                  <p className="text-[10px] text-ink-mute text-center mt-3 font-medium">
                    {t.feesNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── You Might Also Like ─── */}
          {items.length > 0 && (
            <div className="mt-10">
              <PersonalizedRecommendations
                title={lang === 'ZH' ? '你可能还想要' : lang === 'EN' ? 'You Might Also Like' : 'Mungkin Anda Juga Suka'}
                variant="cart"
                limit={3}
              />
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <footer className="bg-ink text-white border-t-4 border-black mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-display font-black text-sm bg-terracotta text-white">A</div>
                  <span className="font-display font-black text-lg tracking-tight">ACEPROXY</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">Belanja langsung dari pabrik China.</p>
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">Layanan</h4>
                <ul className="space-y-2">
                  <li><Link href="/products" className="text-sm text-white/70 hover:text-terracotta font-bold">Produk</Link></li>
                  <li><Link href="/arbibot" className="text-sm text-white/70 hover:text-terracotta font-bold">ArbiBot</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-terracotta uppercase tracking-wider mb-4">Kontak</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="font-bold">WhatsApp: +62 812-xxxx-xxxx</li>
                  <li className="font-bold">Email: support@aceproxy.id</li>
                </ul>
              </div>
            </div>
            <div className="mt-10 pt-5 border-t-2 border-white/10 text-center">
              <p className="text-xs text-white/40 font-bold uppercase">© 2026 AceProxy</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
