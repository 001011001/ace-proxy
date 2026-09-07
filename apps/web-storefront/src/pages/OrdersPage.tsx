import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Loader';
import { useOrders, getStatusMeta } from '@/hooks/useOrders';
import { formatPrice, formatDate, cn } from '@/lib/utils';

/** 状态筛选选项 */
const FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'PENDING', label: 'Belum Bayar' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'DELIVERED', label: 'Selesai' },
] as const;

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useOrders({ status: status || undefined, page, limit: PAGE_SIZE });

  const orders = data?.items ?? [];
  const paginationTotal = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-5xl px-lg2 py-xl2">
      {/* 页头 */}
      <h1 className="font-display text-display-md uppercase tracking-tight">{t('orders.title')}</h1>

      {/* 状态筛选 */}
      <div className="mt-lg2 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={cn(
              'rounded-pill border-3 border-ink px-4 py-2 font-body text-body-sm font-bold transition-all',
              status === f.value
                ? 'bg-terracotta text-white shadow-brutal-sm'
                : 'bg-white hover:bg-canvas-warm',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 加载 */}
      {isLoading && (
        <div className="mt-xl2 space-y-md2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="mt-xl2">
          <EmptyState icon={<ClipboardList size={48} />} title={t('common.error')} description={error} />
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="mt-xl2">
          <EmptyState
            icon={<ClipboardList size={48} />}
            title={t('orders.empty')}
            description={t('orders.emptyDesc')}
            actionLabel={t('cart.startShopping')}
            onAction={() => navigate('/products')}
          />
        </div>
      )}

      {/* 订单列表 */}
      {!isLoading && orders.length > 0 && (
        <ul className="mt-xl2 space-y-md2">
          {orders.map((order) => {
            const meta = getStatusMeta(order.status);
            return (
              <li
                key={order.id}
                className="rounded-sm border-3 border-ink bg-white p-lg2 shadow-brutal-md transition-all hover:shadow-brutal-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-md2">
                  {/* 订单号 + 状态 */}
                  <div>
                    <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                      {t('orders.orderId')}
                    </p>
                    <p className="break-all font-mono text-body-sm font-bold">{order.id}</p>
                    <div className="mt-sm2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                  </div>

                  {/* 金额 + 时间 */}
                  <div className="text-right">
                    <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                      {t('orders.total')}
                    </p>
                    <p className="font-display text-heading-lg text-price-red">
                      {formatPrice(Number(order.totalAmount))}
                    </p>
                    <p className="mt-xs font-body text-micro text-ink-mute">
                      {t('orders.placedAt')} {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* 操作 */}
                <div className="mt-md2 flex items-center justify-between border-t-3 border-ink pt-md2">
                  {order.country && (
                    <span className="font-body text-body-sm text-ink-mute">
                      📍 {order.country}
                    </span>
                  )}
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="primary" size="sm">
                      <Truck size={14} />
                      {t('orders.track')}
                    </Button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 分页 */}
      {paginationTotal > 1 && (
        <div className="mt-xl2 flex items-center justify-center gap-md2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="rounded-pill border-3 border-ink bg-white px-4 py-2 font-mono text-body-sm font-bold shadow-brutal-sm">
            {page} / {paginationTotal}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= paginationTotal}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
