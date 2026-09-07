import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AIChatFab } from '@/components/layout/AIChatFab';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

import HomePage from '@/pages/HomePage';
import ProductListPage from '@/pages/ProductListPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ArbiBotPage from '@/pages/ArbiBotPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import AccountPage from '@/pages/AccountPage';
import VaultPage from '@/pages/VaultPage';
import LoginPage from '@/pages/LoginPage';

import { useAuthStore } from '@/stores/authStore';
import { FullPageLoader } from '@/components/ui/Loader';

/** 需要登录才能访问的路由守卫 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { i18n } = useTranslation();
  const hydrate = useAuthStore((s) => s.hydrate);

  // 启动时用本地 token 校验会话（避免刷新后登录态丢失）
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // 同步 <html lang> — 利于 SEO 与无障碍
  useEffect(() => {
    document.documentElement.lang = i18n.language || 'id';
  }, [i18n.language]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Routes>
          {/* ─── 公开路由 ─── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/arbibot" element={<ArbiBotPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ─── 需登录路由 ─── */}
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account/vault"
            element={
              <PrivateRoute>
                <VaultPage />
              </PrivateRoute>
            }
          />

          {/* 兜底 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* 全站悬浮 AI 管家 */}
      <AIChatFab />
    </div>
  );
}
