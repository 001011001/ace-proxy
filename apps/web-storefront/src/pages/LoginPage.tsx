import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { login, register, isAuthenticated, isLoading } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 已登录用户直接跳走（避免停留在登录页）
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 客户端基础校验（后端 MinLength(6)）
    if (password.length < 6) {
      setError(t('auth.passwordMin', { defaultValue: 'Password minimal 6 karakter' }));
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('auth.loginFailed');
      setError(message);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-lg2 py-huge">
      <div className="w-full max-w-md">
        <Card padding="lg" className="animate-slide-up">
          {/* Logo */}
          <div className="mb-lg2 flex items-center justify-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-sm border-3 border-ink bg-terracotta font-display text-heading-lg text-white shadow-brutal-sm">
              A
            </span>
          </div>

          <h1 className="text-center font-display text-heading-xl">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h1>

          <form onSubmit={handleSubmit} className="mt-xl2 flex flex-col gap-md2">
            <div>
              <label className="mb-xs block font-body text-body-sm font-bold uppercase tracking-wide">
                {t('auth.emailLabel')}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-xs block font-body text-body-sm font-bold uppercase tracking-wide">
                {t('auth.passwordLabel')}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {mode === 'register' && (
                <p className="mt-xs font-body text-micro text-ink-mute">
                  {t('auth.passwordMin', { defaultValue: 'Minimal 6 karakter' })}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-sm border-3 border-ink bg-error-soft p-md2">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-error" />
                <p className="font-body text-body-sm text-error">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              {mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
            </Button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-lg2 border-t-3 border-ink pt-md2 text-center">
            <p className="font-body text-body-sm text-ink-mute">
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold text-terracotta underline hover:text-terracotta-press"
              >
                {mode === 'login' ? t('auth.registerBtn') : t('auth.loginBtn')}
              </button>
            </p>
          </div>

          <div className="mt-md2 text-center">
            <Link to="/" className="font-body text-body-sm text-ink-mute hover:text-terracotta">
              {t('common.back')} →
            </Link>
          </div>
        </Card>

        {/* 开发提示 */}
        <div className="mt-lg2 flex items-center justify-center gap-2 rounded-sm border-3 border-ink bg-canvas-warm p-md2">
          <LogIn size={16} className="text-terracotta" />
          <p className="font-body text-micro text-ink-mute">
            {t('auth.loginTitle')} — AceProxy
          </p>
        </div>
      </div>
    </div>
  );
}
