import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, User, LogOut, Globe, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useCartStore, selectCartCount } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n';
import { cn } from '@/lib/utils';

/** 顶部导航 — Neo-Brutalism sticky header */
export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = useCartStore(selectCartCount);
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // 路由变化时关闭移动菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLangOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.arbibot'), href: '/arbibot' },
    { label: t('nav.orders'), href: '/orders' },
  ];

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleLanguageChange = (code: LanguageCode) => {
    void i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 border-b-3 border-ink bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-lg2 py-md2">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-sm border-3 border-ink bg-terracotta font-display text-heading-md text-white shadow-brutal-sm transition-transform group-hover:rotate-6">
            A
          </span>
          <span className="font-display text-heading-xl tracking-tight">AceProxy</span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'rounded-pill border-3 border-transparent px-4 py-2 font-body text-body-sm font-bold uppercase tracking-wide transition-all',
                isActive(item.href)
                  ? 'border-ink bg-terracotta text-white shadow-brutal-sm'
                  : 'text-ink hover:border-ink hover:bg-canvas-warm',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {/* 语言切换 */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsLangOpen((v) => !v)}
              className="flex items-center gap-1 rounded-pill border-3 border-ink bg-white px-3 py-2 font-body text-body-sm font-bold shadow-brutal-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              aria-label="Change language"
            >
              <Globe size={16} />
              <span>{currentLang.flag}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-sm border-3 border-ink bg-white shadow-brutal-md">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-3 text-left font-body text-body-sm transition-colors hover:bg-canvas-warm',
                      i18n.language === lang.code && 'bg-terracotta-soft font-bold',
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 购物车 */}
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 rounded-pill border-3 border-ink bg-white px-4 py-2 font-body text-body-sm font-bold shadow-brutal-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label={t('nav.cart')}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">{t('nav.cart')}</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 animate-pulse-badge items-center justify-center rounded-full border-2 border-ink bg-price-red text-micro font-extrabold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* 账户 / 登录 */}
          {isAuthenticated && user ? (
            <div className="relative group hidden md:block">
              <button
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 rounded-pill border-3 border-ink bg-white px-4 py-2 font-body text-body-sm font-bold shadow-brutal-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <User size={18} />
                <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
              </button>
              {/* 悬停下拉 */}
              <div className="invisible absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-sm border-3 border-ink bg-white opacity-0 shadow-brutal-md transition-all group-hover:visible group-hover:opacity-100">
                <button
                  onClick={() => navigate('/account')}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left font-body text-body-sm hover:bg-canvas-warm"
                >
                  <User size={16} /> {t('account.profile')}
                </button>
                <button
                  onClick={() => navigate('/account/vault')}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left font-body text-body-sm hover:bg-canvas-warm"
                >
                  <Sparkles size={16} /> {t('nav.vault')}
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 border-t-3 border-ink px-4 py-3 text-left font-body text-body-sm text-error hover:bg-error-soft"
                >
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              className="hidden md:inline-flex"
            >
              {t('nav.login')}
            </Button>
          )}

          {/* 移动端汉堡 */}
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="flex items-center justify-center rounded-sm border-3 border-ink bg-white p-2 shadow-brutal-sm md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="border-t-3 border-ink bg-white px-lg2 py-md2 md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'rounded-sm border-3 px-4 py-3 font-body text-body-md font-bold uppercase',
                  isActive(item.href) ? 'border-ink bg-terracotta text-white' : 'border-transparent hover:bg-canvas-warm',
                )}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Button variant="primary" size="md" fullWidth onClick={() => navigate('/login')}>
                {t('nav.login')}
              </Button>
            )}
            {isAuthenticated && (
              <Button variant="outline" size="md" fullWidth onClick={logout}>
                {t('nav.logout')}
              </Button>
            )}
            {/* 移动端语言切换 */}
            <div className="mt-sm2 flex gap-2 border-t-3 border-ink pt-md2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    'flex-1 rounded-sm border-3 border-ink px-2 py-2 font-body text-body-sm font-bold',
                    i18n.language === lang.code ? 'bg-terracotta text-white' : 'bg-white',
                  )}
                >
                  {lang.flag} {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
