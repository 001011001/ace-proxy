import { useTranslation } from 'react-i18next';
import { Camera, ShieldCheck, PackageCheck } from 'lucide-react';

/**
 * TrustCard — 信任保证卡
 *
 * 三条 AceProxy 核心承诺，对应后端真实能力：
 * - 拍照 QC → VisionQCService（不是空话，有 AI 管线支撑）
 * - 退款保障 → 小额秒赔自动化
 * - 免费集运 → SmartSplitterService 合并发货
 */
export function TrustCard() {
  const { t } = useTranslation();

  const items = [
    {
      icon: <Camera size={22} />,
      title: t('product.trustQc'),
      desc: t('product.trustQcDesc'),
    },
    {
      icon: <ShieldCheck size={22} />,
      title: t('product.trustRefund'),
      desc: t('product.trustRefundDesc'),
    },
    {
      icon: <PackageCheck size={22} />,
      title: t('product.trustShipping'),
      desc: t('product.trustShippingDesc'),
    },
  ];

  return (
    <div className="overflow-hidden rounded-sm border-3 border-ink bg-white shadow-brutal-md">
      <div className="border-b-3 border-ink bg-ink px-lg2 py-sm2">
        <h3 className="font-display text-heading-sm uppercase tracking-wide text-white">
          {t('product.trustTitle')}
        </h3>
      </div>

      <ul className="divide-y-3 divide-ink">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 p-lg2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-3 border-ink bg-terracotta text-white shadow-brutal-sm">
              {item.icon}
            </span>
            <div>
              <h4 className="font-body text-body-md font-extrabold">{item.title}</h4>
              <p className="mt-xs font-body text-body-sm text-ink-mute">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
