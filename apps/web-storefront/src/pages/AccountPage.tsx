import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Landmark, ClipboardList, LogOut, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AccountPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initials = user.email.charAt(0).toUpperCase();

  const menuItems = [
    {
      icon: ClipboardList,
      label: t('nav.orders'),
      href: '/orders',
      desc: 'Lacak pesanan & riwayat',
    },
    {
      icon: Landmark,
      label: t('account.vault'),
      href: '/account/vault',
      desc: 'Saldo kredit & transaksi',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-lg2 py-xl2">
      <h1 className="font-display text-display-md uppercase tracking-tight">{t('account.title')}</h1>

      {/* 资料卡 */}
      <div className="mt-xl2 rounded-sm border-3 border-ink bg-white p-lg2 shadow-brutal-md">
        <div className="flex items-center gap-lg2">
          {/* 头像 */}
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border-3 border-ink bg-terracotta font-display text-heading-xl text-white shadow-brutal-sm">
            {initials}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-heading-md font-bold">{user.email}</p>
            <div className="mt-sm2 flex flex-wrap gap-2">
              {user.level && <Badge tone="terracotta">{user.level}</Badge>}
              {user.role && <Badge tone="ocean">{user.role}</Badge>}
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="mt-lg2 grid grid-cols-2 gap-md2 border-t-3 border-ink pt-md2 sm:grid-cols-3">
          <div>
            <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
              {t('account.credits')}
            </p>
            <p className="font-display text-heading-lg text-terracotta">
              {formatPrice(Number(user.credits ?? 0))}
            </p>
          </div>
          <div>
            <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
              {t('account.level')}
            </p>
            <p className="font-display text-heading-lg">{user.level || '-'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="font-body text-micro font-bold uppercase tracking-widest text-ink-mute">
              {t('account.memberSince')}
            </p>
            <p className="font-body text-body-md font-bold">
              {user.createdAt ? formatDate(user.createdAt) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <ul className="mt-xl2 space-y-md2">
        {menuItems.map(({ icon: Icon, label, href, desc }) => (
          <li key={href}>
            <Link
              to={href}
              className="flex items-center gap-md2 rounded-sm border-3 border-ink bg-white p-md2 shadow-brutal-md transition-all hover:-translate-y-0.5 hover:shadow-brutal-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-3 border-ink bg-canvas-warm">
                <Icon size={20} className="text-terracotta" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body text-body-md font-bold">{label}</p>
                <p className="font-body text-body-sm text-ink-mute">{desc}</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-ink-mute" />
            </Link>
          </li>
        ))}
      </ul>

      {/* 退出 */}
      <div className="mt-xl2 border-t-3 border-ink pt-lg2">
        <Button variant="outline" size="md" onClick={logout} fullWidth>
          <LogOut size={16} />
          {t('nav.logout')}
        </Button>
      </div>

      {/* 头像说明（调试用，无害） */}
      <p className="mt-md2 flex items-center justify-center gap-1 text-center font-body text-micro text-ink-mute">
        <UserIcon size={12} />
        ID: {user.id}
      </p>
    </div>
  );
}
