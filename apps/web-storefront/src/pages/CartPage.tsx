import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore, selectCartCount, selectCartTotal } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const count = useCartStore(selectCartCount);
  const total = useCartStore(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-lg2 py-huge">
        <EmptyState
          icon={<ShoppingCart size={48} />}
          title={t('cart.empty')}
          description={t('cart.emptyDesc')}
          actionLabel={t('cart.startShopping')}
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-lg2 py-xl2">
      {/* 页头 */}
      <div className="mb-xl2 flex items-end justify-between">
        <div>
          <h1 className="font-display text-display-md uppercase tracking-tight">{t('cart.title')}</h1>
          <p className="mt-sm2 font-body text-body-md text-ink-mute">
            {t('cart.itemCount', { count })}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 size={14} />
          {t('cart.remove')}
        </Button>
      </div>

      <div className="grid gap-xl2 lg:grid-cols-3">
        {/* ─── 商品列表 ─── */}
        <div className="lg:col-span-2">
          <ul className="space-y-md2">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-md2 rounded-sm border-3 border-ink bg-white p-md2 shadow-brutal-md"
              >
                {/* 图片 */}
                <Link
                  to={`/products/${item.productId}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xs border-3 border-ink bg-canvas-warm"
                >
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </Link>

                {/* 信息 */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to={`/products/${item.productId}`}
                    className="line-clamp-2 font-body text-body-md font-bold hover:text-terracotta"
                  >
                    {item.name}
                  </Link>

                  <p className="mt-xs font-mono text-body-sm text-price-red">
                    {formatPrice(item.priceIdr)}
                  </p>

                  {/* 数量 + 删除 */}
                  <div className="mt-auto flex items-center justify-between pt-sm2">
                    <div className="flex items-center rounded-pill border-3 border-ink bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-l-pill hover:bg-canvas-warm"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-mono text-body-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-r-pill hover:bg-canvas-warm disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex items-center gap-1 font-body text-body-sm font-bold text-error hover:underline"
                    >
                      <Trash2 size={14} />
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>

                {/* 小计 */}
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                    {t('cart.total')}
                  </p>
                  <p className="mt-xs font-display text-heading-md">
                    {formatPrice(item.priceIdr * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ─── 汇总 ─── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm border-3 border-ink bg-canvas-warm p-lg2 shadow-brutal-md">
            <h2 className="border-b-3 border-ink pb-sm2 font-display text-heading-lg">
              {t('checkout.orderSummary')}
            </h2>

            <div className="mt-md2 space-y-sm2">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-ink-mute">{t('cart.subtotal')}</span>
                <span className="font-mono text-body-md font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-ink-mute">{t('cart.shipping')}</span>
                <span className="font-body text-body-sm text-ink-mute">{t('cart.shippingNote')}</span>
              </div>
            </div>

            <div className="mt-md2 flex items-center justify-between border-t-3 border-ink pt-md2">
              <span className="font-display text-heading-md">{t('cart.total')}</span>
              <span className="font-display text-heading-xl text-price-red">{formatPrice(total)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-lg2"
              onClick={() => navigate('/checkout')}
            >
              {t('cart.checkout')}
              <ArrowRight size={18} />
            </Button>

            <Link
              to="/products"
              className="mt-md2 block text-center font-body text-body-sm font-bold text-ink-mute hover:text-terracotta"
            >
              {t('common.back')} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
