import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, Grid3x3, ShoppingBag, User, Bot, LucideIcon } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

/* ────────────────────────────────────────────────
   MobileBottomNav — fixed bottom tab bar for
   consumer pages. Hidden on desktop (md+) and on
   /admin/* routes. Highlights active route.
   ──────────────────────────────────────────────── */

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  cartBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'catalog', label: '分类', icon: Grid3x3, href: '/products' },
  { id: 'arbibot', label: 'ArbiBot', icon: Bot, href: '/arbibot' },
  { id: 'cart', label: '购物车', icon: ShoppingBag, href: '/cart', cartBadge: true },
  { id: 'account', label: '我的', icon: User, href: '/account' },
];

export default function MobileBottomNav() {
  const router = useRouter();
  const { totalQty } = useCart();
  const pathname = router.pathname;

  // Don't render on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-black
                 grid grid-cols-5 h-16 pb-[env(safe-area-inset-bottom)]"
      aria-label="底部导航"
    >
      {NAV_ITEMS.map(item => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 relative
                        font-display font-bold text-[10px] uppercase tracking-wide
                        transition-colors ${
                          active ? 'text-terracotta bg-terracotta/5' : 'text-ink-mute'
                        }`}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {item.cartBadge && totalQty > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1
                             bg-terracotta text-white border-2 border-black
                             flex items-center justify-center
                             text-[9px] font-display font-bold leading-none"
                >
                  {totalQty > 99 ? '99+' : totalQty}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
