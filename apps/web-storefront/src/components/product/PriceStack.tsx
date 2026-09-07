import { useTranslation } from 'react-i18next';
import { ArrowDown, TrendingDown } from 'lucide-react';
import { formatPrice, formatCNY } from '@/lib/utils';

interface PriceStackProps {
  /** 货源成本（CNY） */
  costCny: number;
  /** 我们的售价（IDR） */
  priceIdr: number;
}

/**
 * PriceStack — 价格透明化堆叠
 *
 * AceProxy 的核心差异点：把"货源价 → 我们的售价 → 你省下多少"摊开给用户看。
 * 这是建立信任的关键视觉（对应 Vault 五层成本透明的商业逻辑）。
 */
export function PriceStack({ costCny, priceIdr }: PriceStackProps) {
  const { t } = useTranslation();

  // 成本 CNY → IDR 粗算展示（1 CNY ≈ 2200 IDR，与后端定价引擎一致）
  const CNY_TO_IDR = 2200;
  const costInIdr = costCny * CNY_TO_IDR;
  const savings = priceIdr - costInIdr;
  const savingsPct = priceIdr > 0 ? Math.round((savings / priceIdr) * 100) : 0;

  return (
    <div className="rounded-sm border-3 border-ink bg-canvas-warm p-lg2 shadow-brutal-md">
      {/* 货源价 */}
      <div className="flex items-center justify-between">
        <span className="font-body text-body-sm font-bold uppercase tracking-wide text-ink-mute">
          {t('product.sourcePrice')}
        </span>
        <div className="text-right">
          <span className="font-mono text-body-md line-through decoration-2 text-ink-mute">
            {formatCNY(costCny)}
          </span>
          <span className="ml-2 font-body text-caption text-ink-mute">
            ≈ {formatPrice(costInIdr)}
          </span>
        </div>
      </div>

      {/* 箭头 */}
      <div className="my-sm2 flex justify-center">
        <ArrowDown size={20} className="text-terracotta" />
      </div>

      {/* 我们的价格 */}
      <div className="flex items-center justify-between border-y-3 border-ink py-sm2">
        <span className="font-body text-body-md font-extrabold uppercase tracking-wide">
          {t('product.ourPrice')}
        </span>
        <span className="font-display text-heading-xl text-price-red">{formatPrice(priceIdr)}</span>
      </div>

      {/* 你省下 */}
      {savings > 0 && (
        <div className="mt-md2 flex items-center justify-between">
          <span className="flex items-center gap-2 font-body text-body-sm font-bold uppercase tracking-wide text-success">
            <TrendingDown size={16} />
            {t('product.youSave')}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-body-md font-bold text-success">
              {formatPrice(savings)}
            </span>
            <span className="rounded-pill border-2 border-ink bg-success px-2 py-0.5 font-display text-badge text-white">
              {savingsPct}%
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
