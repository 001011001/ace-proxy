import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, PackageCheck, Check, Circle } from 'lucide-react';

import { useOrderTimeline, getStatusMeta } from '@/hooks/useOrders';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Loader';
import { formatDate, formatDateTime, cn } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: nodes, isLoading, error } = useOrderTimeline(id);

  const timeline = nodes ?? [];
  const lastNode = timeline[timeline.length - 1];
  const currentStatus = lastNode?.node ?? 'PENDING';
  const meta = getStatusMeta(currentStatus);

  return (
    <div className="mx-auto max-w-3xl px-lg2 py-xl2">
      {/* 面包屑 */}
      <Link
        to="/orders"
        className="mb-lg2 inline-flex items-center gap-1 font-body text-body-sm font-bold text-ink-mute hover:text-terracotta"
      >
        <ArrowLeft size={16} />
        {t('orders.title')}
      </Link>

      {/* 订单头 */}
      <div className="rounded-sm border-3 border-ink bg-white p-lg2 shadow-brutal-md">
        <div className="flex flex-wrap items-start justify-between gap-md2">
          <div>
            <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
              {t('orders.orderId')}
            </p>
            <p className="break-all font-mono text-body-md font-bold">{id}</p>
          </div>
          <div className="text-right">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            {lastNode && (
              <p className="mt-sm2 font-body text-micro text-ink-mute">
                {formatDate(lastNode.time)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 时间线 */}
      <div className="mt-xl2">
        <h2 className="mb-lg2 font-display text-heading-xl">{t('orders.timeline')}</h2>

        {isLoading && (
          <div className="space-y-md2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {error && (
          <EmptyState icon={<PackageCheck size={48} />} title={t('common.error')} description={error} />
        )}

        {!isLoading && !error && timeline.length === 0 && (
          <EmptyState
            icon={<PackageCheck size={48} />}
            title={t('common.empty')}
            description="Belum ada riwayat pengiriman untuk pesanan ini."
          />
        )}

        {timeline.length > 0 && (
          <ol className="relative border-l-4 border-ink pl-lg2">
            {timeline.map((node, idx) => {
              const isLast = idx === timeline.length - 1;
              return (
                <li key={node.id} className={cn('relative pb-xl2', isLast && 'pb-0')}>
                  {/* 节点圆点 */}
                  <span
                    className={cn(
                      'absolute -left-[26px] flex h-6 w-6 items-center justify-center rounded-full border-3 border-ink',
                      isLast ? 'bg-terracotta text-white' : 'bg-white',
                    )}
                  >
                    {isLast ? <Check size={14} /> : <Circle size={10} className="fill-ink" />}
                  </span>

                  {/* 内容 */}
                  <div
                    className={cn(
                      'rounded-sm border-3 border-ink p-md2',
                      isLast ? 'bg-canvas-warm shadow-brutal-sm' : 'bg-white',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-body text-body-md font-bold">{node.label}</p>
                      <span className="font-mono text-micro text-ink-mute">
                        {formatDateTime(node.time)}
                      </span>
                    </div>
                    <p className="mt-xs font-mono text-micro uppercase tracking-widest text-ink-mute">
                      {node.node}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* 底部操作 */}
      <div className="mt-huge flex justify-center">
        <Link to="/products">
          <Button variant="secondary" size="md">
            {t('cart.startShopping')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
