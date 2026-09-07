import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Link2, TrendingUp, AlertTriangle, ShieldCheck, Ban, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { arbibotApi, ApiError } from '@/lib/api';
import { formatPrice, formatCNY, cn } from '@/lib/utils';
import type { ArbiBotAnalysis } from '@/types/api';

/** 风险状态视觉映射 */
const RISK_STYLES = {
  CLEAN: { tone: 'success' as const, icon: ShieldCheck, key: 'arbibot.riskClean' },
  WARNING: { tone: 'warning' as const, icon: AlertTriangle, key: 'arbibot.riskWarning' },
  BLOCKED: { tone: 'error' as const, icon: Ban, key: 'arbibot.riskBlocked' },
} as const;

export default function ArbiBotPage() {
  const { t } = useTranslation();

  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ArbiBotAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await arbibotApi.analyze(trimmed);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('arbibot.errorInvalid'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      e.preventDefault();
      void handleAnalyze();
    }
  };

  const risk = result ? RISK_STYLES[result.riskStatus] : null;
  const RiskIcon = risk?.icon;

  return (
    <div className="mx-auto max-w-4xl px-lg2 py-huge">
      {/* 页头 */}
      <div className="text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-sm border-3 border-ink bg-terracotta text-white shadow-brutal-md">
          <Calculator size={30} />
        </span>
        <h1 className="mt-lg2 font-display text-display-md uppercase tracking-tight">
          {t('arbibot.title')}
        </h1>
        <p className="mx-auto mt-md2 max-w-xl font-body text-body-md text-ink-mute">
          {t('arbibot.subtitle')}
        </p>
      </div>

      {/* 输入区 */}
      <div className="mt-huge rounded-sm border-3 border-ink bg-white p-xl2 shadow-brutal-md">
        <div className="flex flex-col gap-md2 sm:flex-row">
          <div className="relative flex-1">
            <Link2
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('arbibot.placeholder')}
              className="pl-12"
              disabled={isAnalyzing}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleAnalyze()}
            isLoading={isAnalyzing}
            disabled={!url.trim()}
            className="shrink-0"
          >
            {isAnalyzing ? t('arbibot.analyzing') : t('arbibot.analyze')}
          </Button>
        </div>

        <p className="mt-md2 border-t-3 border-ink pt-md2 font-body text-body-sm text-ink-mute">
          {t('arbibot.howItWorks')}
        </p>
      </div>

      {/* 加载中骨架 */}
      {isAnalyzing && (
        <div className="mt-xl2 flex flex-col items-center gap-3 rounded-sm border-3 border-dashed border-ink bg-white py-huge">
          <Loader2 size={32} className="animate-spin text-terracotta" />
          <p className="font-body text-body-sm uppercase tracking-widest text-ink-mute">
            {t('arbibot.analyzing')}
          </p>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="mt-xl2 flex items-start gap-3 rounded-sm border-3 border-ink bg-error-soft p-lg2 shadow-brutal-md">
          <AlertTriangle size={22} className="shrink-0 text-error" />
          <div>
            <h3 className="font-display text-heading-md text-error">{t('common.error')}</h3>
            <p className="mt-xs font-body text-body-sm text-error">{error}</p>
          </div>
        </div>
      )}

      {/* 结果 */}
      {result && !isAnalyzing && (
        <div className="mt-xl2 animate-slide-up">
          <div className="overflow-hidden rounded-sm border-3 border-ink bg-white shadow-brutal-lg">
            {/* 结果头 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink bg-ink px-lg2 py-md2">
              <h2 className="font-display text-heading-lg text-white">{t('arbibot.resultTitle')}</h2>
              {risk && RiskIcon && (
                <Badge tone={risk.tone}>
                  <RiskIcon size={12} />
                  {t(risk.key)}
                </Badge>
              )}
            </div>

            {/* 风险原因 */}
            {result.riskReason && (
              <div className="border-b-3 border-ink bg-warning-soft px-lg2 py-md2">
                <p className="font-body text-body-sm text-ink-secondary">{result.riskReason}</p>
              </div>
            )}

            {/* 核心价格对比 */}
            <div className="grid gap-lg2 p-xl2 sm:grid-cols-3">
              <div className="rounded-sm border-3 border-ink bg-canvas-gray p-md2">
                <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                  {t('arbibot.sourcePrice')}
                </p>
                <p className="mt-sm2 font-display text-heading-lg">{formatCNY(result.sourcePriceCNY)}</p>
              </div>

              <div className="rounded-sm border-3 border-ink bg-canvas-gray p-md2">
                <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                  {t('arbibot.allInPrice')}
                </p>
                <p className="mt-sm2 font-display text-heading-lg text-price-red">
                  {formatPrice(result.allInPriceIDR)}
                </p>
              </div>

              <div
                className={cn(
                  'rounded-sm border-3 border-ink p-md2',
                  result.arbitrageGapPct > 0 ? 'bg-success-soft' : 'bg-canvas-gray',
                )}
              >
                <p className="flex items-center gap-1 font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                  <TrendingUp size={12} />
                  {t('arbibot.arbitrageGap')}
                </p>
                <p className="mt-sm2 font-display text-heading-lg text-success">
                  {(result.arbitrageGapPct * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 费用明细 */}
            <div className="border-t-3 border-ink p-xl2">
              <h3 className="font-display text-heading-md">{t('arbibot.breakdown')}</h3>

              <ul className="mt-md2 divide-y-2 divide-dashed divide-ink">
                <li className="flex items-center justify-between py-sm2">
                  <span className="font-body text-body-sm text-ink-mute">
                    {t('arbibot.breakdownSource')}
                  </span>
                  <span className="font-mono text-body-sm font-bold">
                    {formatPrice(result.breakdown.sourceCost)}
                  </span>
                </li>
                <li className="flex items-center justify-between py-sm2">
                  <span className="font-body text-body-sm text-ink-mute">
                    {t('arbibot.breakdownShipping')}
                  </span>
                  <span className="font-mono text-body-sm font-bold">
                    {formatPrice(result.breakdown.shippingEstimate)}
                  </span>
                </li>
                <li className="flex items-center justify-between py-sm2">
                  <span className="font-body text-body-sm text-ink-mute">
                    {t('arbibot.breakdownService')}
                  </span>
                  <span className="font-mono text-body-sm font-bold">
                    {formatPrice(result.breakdown.serviceFee)}
                  </span>
                </li>
                <li className="flex items-center justify-between py-sm2">
                  <span className="font-body text-body-sm text-ink-mute">
                    {t('arbibot.breakdownRisk')}
                  </span>
                  <span className="font-mono text-body-sm font-bold">
                    {formatPrice(result.breakdown.riskPool)}
                  </span>
                </li>
              </ul>
            </div>

            {/* 匹配到的货源链接 */}
            {result.matchedSourceUrl && (
              <div className="border-t-3 border-ink bg-canvas-warm p-lg2">
                <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
                  Matched source
                </p>
                <a
                  href={result.matchedSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-xs block break-all font-mono text-body-sm text-terracotta hover:underline"
                >
                  {result.matchedSourceUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
