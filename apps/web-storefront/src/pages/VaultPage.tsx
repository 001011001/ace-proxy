import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Landmark, ArrowLeft, TrendingUp, Receipt } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';

export default function VaultPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const credits = Number(user.credits ?? 0);
  const totalSpend = Number(user.totalSpend ?? 0);

  return (
    <div className="mx-auto max-w-3xl px-lg2 py-xl2">
      {/* 面包屑 */}
      <Link
        to="/account"
        className="mb-lg2 inline-flex items-center gap-1 font-body text-body-sm font-bold text-ink-mute hover:text-terracotta"
      >
        <ArrowLeft size={16} />
        {t('account.title')}
      </Link>

      <h1 className="font-display text-display-md uppercase tracking-tight">
        {t('account.vaultTitle')}
      </h1>
      <p className="mt-sm2 font-body text-body-md text-ink-mute">{t('account.vaultDesc')}</p>

      {/* 余额卡 */}
      <div className="mt-xl2 overflow-hidden rounded-sm border-3 border-ink bg-ink shadow-brutal-lg">
        <div className="p-xl2">
          <p className="flex items-center gap-2 font-body text-caption font-bold uppercase tracking-widest text-gray-300">
            <Landmark size={16} />
            {t('account.balance')}
          </p>
          <p className="mt-md2 font-display text-display-md text-terracotta">
            {formatPrice(credits)}
          </p>
        </div>

        {/* 累计消费 */}
        <div className="flex items-center justify-between border-t-3 border-ink bg-canvas-warm px-xl2 py-md2">
          <span className="flex items-center gap-2 font-body text-body-sm font-bold text-ink">
            <TrendingUp size={16} className="text-terracotta" />
            Total Pengeluaran
          </span>
          <span className="font-mono text-body-md font-bold text-ink">
            {formatPrice(totalSpend)}
          </span>
        </div>
      </div>

      {/* 充值 */}
      <div className="mt-lg2 rounded-sm border-3 border-dashed border-ink bg-canvas-warm p-lg2 text-center">
        <p className="font-body text-body-sm text-ink-mute">
          Fitur top up segera hadir. Kredit otomatis bertambah dari cashback setiap pesanan.
        </p>
        <Button variant="primary" size="md" className="mt-md2" disabled>
          {t('account.topUp')}
        </Button>
      </div>

      {/* 交易记录 */}
      <div className="mt-huge">
        <h2 className="mb-lg2 flex items-center gap-2 border-b-3 border-ink pb-sm2 font-display text-heading-lg">
          <Receipt size={20} className="text-terracotta" />
          {t('account.transactions')}
        </h2>

        <EmptyState
          icon={<Receipt size={40} />}
          title={t('account.noTransactions')}
          description="Riwayat transaksi akan muncul setelah Anda melakukan pemesanan."
          actionLabel={t('cart.startShopping')}
          onAction={() => navigate('/products')}
        />
      </div>
    </div>
  );
}
