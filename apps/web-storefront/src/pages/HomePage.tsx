import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Flame, Camera, ShieldCheck, PackageCheck, PartyPopper } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStationHome, useHeroProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

/** 三步流程数据 */
const STEPS = [
  { n: '01', icon: '🔗', key: 'step1' },
  { n: '02', icon: '🤖', key: 'step2' },
  { n: '03', icon: '📦', key: 'step3' },
] as const;

/** 信任点数据 */
const TRUSTS = [
  { icon: Camera, key: 'trust1' },
  { icon: ShieldCheck, key: 'trust2' },
  { icon: PackageCheck, key: 'trust3' },
] as const;

export default function HomePage() {
  const { t } = useTranslation();

  // 站点配置（节日引擎 + 公告 + 货币）
  const { data: station } = useStationHome('jakarta');
  // 爆款商品（含真实图片）
  const { data: products, isLoading, error } = useHeroProducts();

  const heroProducts = products ?? [];

  return (
    <div className="animate-fade-in">
      {/* ══════════ 节日横幅（节日引擎驱动） ══════════ */}
      {station?.activeHoliday && (
        <div className="border-b-3 border-ink bg-terracotta">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-lg2 py-md2">
            <PartyPopper className="text-white" size={20} />
            <p className="font-display text-heading-sm uppercase tracking-wide text-white">
              {station.activeHoliday.festivalName}
            </p>
            {station.activeHoliday.reminderMessage && (
              <span className="hidden font-body text-body-sm text-white/90 sm:inline">
                — {station.activeHoliday.reminderMessage}
              </span>
            )}
            <Badge tone="default" className="ml-2 shrink-0">
              {station.activeHoliday.reminderDays}d
            </Badge>
          </div>
        </div>
      )}

      {/* ══════════ Hero ══════════ */}
      <section className="relative overflow-hidden border-b-3 border-ink bg-canvas-warm">
        {/* 装饰：背景几何网格（有意图的装饰，非毛玻璃） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #000 0 2px, transparent 2px 14px)',
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-xl2 px-lg2 py-huge lg:grid-cols-2 lg:py-massive">
          {/* 左：文案 */}
          <div>
            {/* 公告徽章 */}
            {station?.announcement && (
              <div className="mb-lg2 inline-flex items-center gap-2 rounded-pill border-3 border-ink bg-white px-4 py-2 shadow-brutal-sm">
                <Sparkles size={16} className="text-terracotta" />
                <span className="font-body text-caption font-bold uppercase tracking-wide">
                  {station.announcement}
                </span>
              </div>
            )}

            <h1 className="font-display text-display-lg uppercase leading-[0.9] tracking-tighter text-ink">
              {t('home.heroTitle')}
            </h1>

            <p className="mt-lg2 max-w-lg font-body text-body-lg text-ink-secondary">
              {t('home.heroSubtitle')}
            </p>

            {/* CTA */}
            <div className="mt-xl2 flex flex-wrap gap-md2">
              <Link to="/products">
                <Button variant="primary" size="lg">
                  {t('home.ctaPrimary')}
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/arbibot">
                <Button variant="secondary" size="lg">
                  {t('home.ctaSecondary')}
                </Button>
              </Link>
            </div>

            {/* 统计 — 用真实商品数 */}
            <div className="mt-huge flex flex-wrap gap-xl2 border-t-3 border-ink pt-lg2">
              <div>
                <p className="font-display text-heading-xl text-terracotta">
                  {heroProducts.length > 0 ? `${heroProducts.length}+` : '—'}
                </p>
                <p className="font-body text-caption font-bold uppercase tracking-widest text-ink-mute">
                  {t('home.statProducts')}
                </p>
              </div>
              <div>
                <p className="font-display text-heading-xl text-terracotta">3</p>
                <p className="font-body text-caption font-bold uppercase tracking-widest text-ink-mute">
                  {t('home.statCountries')}
                </p>
              </div>
              <div>
                <p className="font-display text-heading-xl text-terracotta">
                  {station?.currency || 'IDR'}
                </p>
                <p className="font-body text-caption font-bold uppercase tracking-widest text-ink-mute">
                  {station?.regionCode || 'JKT'}
                </p>
              </div>
            </div>
          </div>

          {/* 右：视觉主体 — 堆叠卡片（非通用 hero 图，强化品牌） */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* 主卡 */}
              <div className="rounded-sm border-3 border-ink bg-white p-xl2 shadow-brutal-lg">
                <div className="flex items-center gap-2 border-b-3 border-ink pb-md2">
                  <Flame size={20} className="text-terracotta" />
                  <span className="font-display text-heading-md uppercase">
                    {t('home.heroProducts')}
                  </span>
                </div>

                {heroProducts.slice(0, 3).map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      'flex items-center gap-3 border-b-2 border-dashed border-ink py-md2',
                      i === 2 && 'border-b-0',
                    )}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xs border-2 border-ink bg-canvas-gray">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-body-sm font-bold">{p.name}</p>
                      <p className="font-mono text-caption text-price-red">
                        Rp {Math.round(p.priceIdr).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Badge tone="success" className="shrink-0">
                      -{Math.round(((p.priceIdr - p.costCny) / p.priceIdr) * 100)}%
                    </Badge>
                  </div>
                ))}

                {heroProducts.length === 0 && !isLoading && (
                  <p className="py-md2 text-center font-body text-body-sm text-ink-mute">
                    {t('common.empty')}
                  </p>
                )}
              </div>

              {/* 装饰：偏移色块（硬阴影风格） */}
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-sm border-3 border-ink bg-terracotta"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 爆款区（含 FOMO） ══════════ */}
      <section className="mx-auto max-w-7xl px-lg2 py-huge">
        <div className="mb-xl2 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-display-md uppercase tracking-tight">
              {t('home.heroProducts')}
            </h2>
            <p className="mt-sm2 font-body text-body-md text-ink-mute">
              {t('home.heroProductsDesc')}
            </p>
          </div>
          <Link
            to="/products"
            className="hidden shrink-0 items-center gap-1 font-body text-body-sm font-bold uppercase text-terracotta hover:underline sm:flex"
          >
            {t('common.seeAll')}
            <ArrowRight size={16} />
          </Link>
        </div>

        {error ? (
          <EmptyState
            icon={<Flame size={48} />}
            title={t('common.error')}
            description={error}
          />
        ) : (
          <ProductGrid products={heroProducts} isLoading={isLoading} showGap />
        )}
      </section>

      {/* ══════════ How it works ══════════ */}
      <section className="border-y-3 border-ink bg-ink py-huge text-white">
        <div className="mx-auto max-w-7xl px-lg2">
          <h2 className="text-center font-display text-display-md uppercase tracking-tight">
            {t('home.howItWorks')}
          </h2>

          <div className="mt-huge grid gap-xl2 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                {/* 序号（大号，装饰性） */}
                <span className="font-display text-display-lg leading-none text-terracotta">
                  {step.n}
                </span>
                <div className="mt-md2 text-4xl">{step.icon}</div>
                <h3 className="mt-md2 font-display text-heading-lg">
                  {t(`home.${step.key}Title`)}
                </h3>
                <p className="mt-sm2 font-body text-body-md text-gray-300">
                  {t(`home.${step.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ Trust 区 ══════════ */}
      <section className="mx-auto max-w-7xl px-lg2 py-huge">
        <h2 className="text-center font-display text-display-md uppercase tracking-tight">
          {t('home.trustTitle')}
        </h2>

        <div className="mt-huge grid gap-lg2 md:grid-cols-3">
          {TRUSTS.map(({ icon: Icon, key }, idx) => (
            <div
              key={key}
              className="rounded-sm border-3 border-ink bg-white p-xl2 shadow-brutal-md transition-all hover:-translate-y-1 hover:shadow-brutal-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-sm border-3 border-ink bg-terracotta text-white shadow-brutal-sm">
                <Icon size={22} />
              </span>
              <h3 className="mt-lg2 font-display text-heading-lg">{t(`home.${key}`)}</h3>
              <p className="mt-sm2 font-body text-body-md text-ink-mute">
                {t(`home.${key}Desc`)}
              </p>
              {/* 序号装饰 */}
              <span className="mt-lg2 block font-mono text-caption text-ink-mute">
                0{idx + 1} / 03
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
