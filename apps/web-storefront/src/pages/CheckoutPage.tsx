import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, MapPin, AlertCircle, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FullPageLoader } from '@/components/ui/Loader';
import { useCartStore, selectCartTotal } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { tradeApi, paymentApi, ApiError } from '@/lib/api';
import { formatPrice, formatCNY } from '@/lib/utils';
import type { PaymentMethod } from '@/types/api';

/** CNY → IDR 参考汇率（用于订单 amounts 的单位换算展示） */
const CNY_TO_IDR = 2200;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore(selectCartTotal);
  const user = useAuthStore((s) => s.user);

  // 收货地址
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // 支付
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [fees, setFees] = useState<{ serviceFee: number; level?: string; badge?: string } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 空购物车 → 引导去购物
  useEffect(() => {
    if (items.length === 0) navigate('/products', { replace: true });
  }, [items.length, navigate]);

  // 加载支付方式 + 精算费用
  useEffect(() => {
    if (subtotal <= 0) return;

    paymentApi
      .methods()
      .then((res) => {
        setMethods(res || []);
        if (res?.[0]?.code) setSelectedMethod(res[0].code);
      })
      .catch(() => {
        /* 支付方式加载失败不阻断下单，用户可直接提交 */
      });

    tradeApi
      .calculateFees(subtotal)
      .then((res) => {
        setFees({
          serviceFee: Number(res?.serviceFee ?? 0),
          level: res?.level as string | undefined,
          badge: res?.badge as string | undefined,
        });
      })
      .catch(() => {
        /* 费用计算失败 → 按 0 处理，下单仍可继续 */
      });
  }, [subtotal]);

  const serviceFee = fees?.serviceFee ?? 0;
  const total = subtotal + serviceFee;

  // 采购成本合计（CNY，用于 amounts.cost）
  const costCnyTotal = items.reduce((sum, item) => sum + item.costCny * item.quantity, 0);

  const isFormValid = !!(fullName.trim() && phone.trim() && address.trim() && city.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError(t('checkout.required'));
      return;
    }
    if (!termsAccepted) {
      setError(t('checkout.required'));
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. 创建订单
      const order = await tradeApi.createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        amounts: {
          total, // IDR
          cost: costCnyTotal, // CNY
          shipping: 0, // 运费由后端拆单时核算
          serviceFee: serviceFee / CNY_TO_IDR, // 转 CNY（订单字段单位）
        },
        destination: city.trim() || 'JKT',
        terms_accepted: true,
      });

      const orderId = order?.orderId || order?.id;
      if (!orderId) throw new Error('Order creation succeeded but no order ID returned');

      // 2. 创建支付发票
      const invoice = await paymentApi.createInvoice({
        orderId,
        amount: total,
        description: `AceProxy Order ${orderId}`,
        paymentMethods: selectedMethod ? [selectedMethod] : undefined,
      });

      // 3. 清空购物车并跳转支付页
      clear();
      const payUrl = invoice?.invoiceUrl || invoice?.url;
      if (payUrl) {
        window.location.href = payUrl;
      } else {
        navigate(`/orders/${orderId}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return <FullPageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-lg2 py-xl2">
      <h1 className="mb-xl2 font-display text-display-md uppercase tracking-tight">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-xl2 lg:grid-cols-3">
        {/* ══════ 左：地址 + 支付 ══════ */}
        <div className="space-y-xl2 lg:col-span-2">
          {/* 收货地址 */}
          <div className="rounded-sm border-3 border-ink bg-white p-lg2 shadow-brutal-md">
            <h2 className="mb-md2 flex items-center gap-2 border-b-3 border-ink pb-sm2 font-display text-heading-lg">
              <MapPin size={20} className="text-terracotta" />
              {t('checkout.shippingAddress')}
            </h2>

            <div className="grid gap-md2 sm:grid-cols-2">
              <div>
                <label className="mb-xs block font-body text-caption font-bold uppercase tracking-wide">
                  {t('checkout.fullName')} *
                </label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-xs block font-body text-caption font-bold uppercase tracking-wide">
                  {t('checkout.phone')} *
                </label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-xs block font-body text-caption font-bold uppercase tracking-wide">
                  {t('checkout.address')} *
                </label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div>
                <label className="mb-xs block font-body text-caption font-bold uppercase tracking-wide">
                  {t('checkout.city')} *
                </label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div>
                <label className="mb-xs block font-body text-caption font-bold uppercase tracking-wide">
                  {t('checkout.postalCode')}
                </label>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 支付方式 */}
          <div className="rounded-sm border-3 border-ink bg-white p-lg2 shadow-brutal-md">
            <h2 className="mb-md2 flex items-center gap-2 border-b-3 border-ink pb-sm2 font-display text-heading-lg">
              <CreditCard size={20} className="text-terracotta" />
              {t('checkout.paymentMethod')}
            </h2>

            {methods.length > 0 ? (
              <div className="grid gap-sm2 sm:grid-cols-2">
                {methods.map((m) => (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => setSelectedMethod(m.code)}
                    className={`rounded-sm border-3 border-ink p-md2 text-left transition-all ${
                      selectedMethod === m.code
                        ? 'bg-terracotta text-white shadow-brutal-sm'
                        : 'bg-white hover:bg-canvas-warm'
                    }`}
                  >
                    <p className="font-body text-body-sm font-bold">{m.name}</p>
                    {m.type && (
                      <p
                        className={`font-body text-micro ${
                          selectedMethod === m.code ? 'text-white/80' : 'text-ink-mute'
                        }`}
                      >
                        {m.type}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-body text-body-sm text-ink-mute">{t('common.loading')}</p>
            )}
          </div>

          {/* 条款 */}
          <label className="flex cursor-pointer items-start gap-3 rounded-sm border-3 border-ink bg-canvas-warm p-md2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-terracotta"
            />
            <span className="font-body text-body-sm">
              <ShieldCheck size={14} className="mr-1 inline text-success" />
              {t('checkout.title')} — AceProxy adalah layanan jasa titip internasional. Barang
              dibeli sesuai instruksi Anda dan tidak dapat ditukar atau dikembalikan.
            </span>
          </label>
        </div>

        {/* ══════ 右：订单摘要 ══════ */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm border-3 border-ink bg-canvas-warm p-lg2 shadow-brutal-md">
            <h2 className="border-b-3 border-ink pb-sm2 font-display text-heading-lg">
              {t('checkout.orderSummary')}
            </h2>

            {/* 商品清单 */}
            <ul className="mt-md2 space-y-sm2">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-2">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xs border-2 border-ink bg-white">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-body-sm font-bold">{item.name}</p>
                    <p className="font-body text-micro text-ink-mute">× {item.quantity}</p>
                  </div>
                  <span className="font-mono text-body-sm font-bold">
                    {formatPrice(item.priceIdr * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* 费用 */}
            <div className="mt-md2 space-y-sm2 border-t-3 border-ink pt-md2">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-ink-mute">{t('cart.subtotal')}</span>
                <span className="font-mono text-body-sm font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-ink-mute">
                  {t('arbibot.breakdownService')}
                </span>
                <span className="font-mono text-body-sm font-bold">{formatPrice(serviceFee)}</span>
              </div>
              {/* 采购成本（CNY）— 透明化展示 */}
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-ink-mute">
                  {t('product.sourcePrice')}
                </span>
                <span className="font-mono text-body-sm text-ink-mute">
                  {formatCNY(costCnyTotal)}
                </span>
              </div>
            </div>

            {/* 会员等级 */}
            {fees?.badge && (
              <div className="mt-md2">
                <Badge tone="terracotta">{fees.badge}</Badge>
              </div>
            )}

            {/* 总计 */}
            <div className="mt-md2 flex items-center justify-between border-t-3 border-ink pt-md2">
              <span className="font-display text-heading-md">{t('cart.total')}</span>
              <span className="font-display text-heading-xl text-price-red">
                {formatPrice(total)}
              </span>
            </div>

            {/* 错误 */}
            {error && (
              <div className="mt-md2 flex items-start gap-2 rounded-sm border-3 border-ink bg-error-soft p-md2">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
                <p className="font-body text-body-sm text-error">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              className="mt-lg2"
              isLoading={isSubmitting}
              disabled={!isFormValid || !termsAccepted}
            >
              {isSubmitting ? t('checkout.processing') : t('checkout.placeOrder')}
            </Button>

            {user?.email && (
              <p className="mt-md2 text-center font-body text-micro text-ink-mute">
                {t('account.email')}: {user.email}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
