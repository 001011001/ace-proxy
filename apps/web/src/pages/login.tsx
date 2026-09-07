import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGoogleLogin } from '@react-oauth/google';
import {
  ArrowLeft, Mail, Key, ArrowRight, Eye, EyeOff,
  ShieldCheck, RefreshCw, Check, Circle, Phone, X, Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
type Lang = 'ID' | 'EN' | 'ZH';
type Mode = 'login' | 'register';

interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
}

// ─── i18n ──────────────────────────────────────────────────
const T: Record<Lang, Record<string, string>> = {
  ID: {
    title: 'Masuk — AceProxy',
    heading: 'Masuk',
    subtitle: 'Masuk ke akun AceProxy Anda',
    registerHeading: 'Daftar',
    registerSubtitle: 'Buat akun baru untuk belanja global',
    email: 'Email',
    emailPlaceholder: 'nama@email.com',
    password: 'Kata Sandi',
    passwordPlaceholder: 'Min. 8 karakter',
    confirmPassword: 'Konfirmasi Kata Sandi',
    confirmPasswordPlaceholder: 'Masukkan ulang kata sandi',
    phoneLabel: 'Nomor HP (opsional)',
    phonePlaceholder: '+62 812 3456 7890',
    displayNameLabel: 'Nama (opsional)',
    displayNamePlaceholder: 'Nama Anda',
    login: 'Masuk',
    logging: 'Memproses...',
    register: 'Daftar',
    registering: 'Mendaftar...',
    switchToRegister: 'Belum punya akun? Daftar di sini',
    switchToLogin: 'Sudah punya akun? Masuk di sini',
    trust: 'Login aman. Data Anda dilindungi.',
    back: 'Kembali',
    errorEmail: 'Email tidak valid',
    errorPassword: 'Kata sandi minimal 8 karakter dengan huruf besar, kecil & angka',
    errorPasswordMismatch: 'Kata sandi tidak cocok',
    errorLogin: 'Gagal masuk. Periksa email & kata sandi.',
    errorRegister: 'Gagal mendaftar. Coba lagi.',
    errorGoogle: 'Gagal login dengan Google. Coba lagi.',
    successLogin: 'Berhasil masuk!',
    successRegister: 'Berhasil mendaftar!',
    orDivider: 'atau',
    googleBtn: 'Lanjutkan dengan Google',
    googleProcessing: 'Menghubungkan...',
    pwMinLength: 'Minimal 8 karakter',
    pwUpper: 'Huruf besar (A-Z)',
    pwLower: 'Huruf kecil (a-z)',
    pwNumber: 'Angka (0-9)',
    pwStrength: 'Kekuatan kata sandi',
    socialLogin: 'Login dengan cara lain',
  },
  EN: {
    title: 'Login — AceProxy',
    heading: 'Sign In',
    subtitle: 'Sign in to your AceProxy account',
    registerHeading: 'Create Account',
    registerSubtitle: 'Create a new account for global shopping',
    email: 'Email',
    emailPlaceholder: 'name@email.com',
    password: 'Password',
    passwordPlaceholder: 'Min. 8 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    phoneLabel: 'Phone Number (optional)',
    phonePlaceholder: '+62 812 3456 7890',
    displayNameLabel: 'Name (optional)',
    displayNamePlaceholder: 'Your name',
    login: 'Sign In',
    logging: 'Processing...',
    register: 'Create Account',
    registering: 'Creating Account...',
    switchToRegister: "Don't have an account? Sign up",
    switchToLogin: 'Already have an account? Sign in',
    trust: 'Secure login. Your data is protected.',
    back: 'Back',
    errorEmail: 'Invalid email address',
    errorPassword: 'Password must be 8+ chars with uppercase, lowercase & number',
    errorPasswordMismatch: 'Passwords do not match',
    errorLogin: 'Login failed. Check your email & password.',
    errorRegister: 'Registration failed. Please try again.',
    errorGoogle: 'Google sign-in failed. Please try again.',
    successLogin: 'Login successful!',
    successRegister: 'Registration successful!',
    orDivider: 'or',
    googleBtn: 'Continue with Google',
    googleProcessing: 'Connecting...',
    pwMinLength: 'At least 8 characters',
    pwUpper: 'Uppercase letter (A-Z)',
    pwLower: 'Lowercase letter (a-z)',
    pwNumber: 'Number (0-9)',
    pwStrength: 'Password strength',
    socialLogin: 'Other ways to sign in',
  },
  ZH: {
    title: '登录 — AceProxy',
    heading: '登录',
    subtitle: '登录您的 AceProxy 账户',
    registerHeading: '创建账户',
    registerSubtitle: '创建新账户，畅享全球购物',
    email: '邮箱',
    emailPlaceholder: 'name@email.com',
    password: '密码',
    passwordPlaceholder: '至少8个字符',
    confirmPassword: '确认密码',
    confirmPasswordPlaceholder: '再次输入密码',
    phoneLabel: '手机号（选填）',
    phonePlaceholder: '+62 812 3456 7890',
    displayNameLabel: '名称（选填）',
    displayNamePlaceholder: '您的名字',
    login: '登录',
    logging: '处理中...',
    register: '注册',
    registering: '注册中...',
    switchToRegister: '还没有账户？点此注册',
    switchToLogin: '已有账户？点此登录',
    trust: '安全登录。您的数据受保护。',
    back: '返回',
    errorEmail: '邮箱格式不正确',
    errorPassword: '密码需要8位以上，含大小写字母和数字',
    errorPasswordMismatch: '两次密码不一致',
    errorLogin: '登录失败。请检查邮箱和密码。',
    errorRegister: '注册失败。请重试。',
    errorGoogle: 'Google 登录失败。请重试。',
    successLogin: '登录成功！',
    successRegister: '注册成功！',
    orDivider: '或者',
    googleBtn: '使用 Google 继续',
    googleProcessing: '连接中...',
    pwMinLength: '至少8个字符',
    pwUpper: '大写字母 (A-Z)',
    pwLower: '小写字母 (a-z)',
    pwNumber: '数字 (0-9)',
    pwStrength: '密码强度',
    socialLogin: '其他登录方式',
  },
};

// ─── Password Strength Checker ─────────────────────────────
function checkPasswordStrength(pw: string): PasswordChecks {
  return {
    minLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /\d/.test(pw),
  };
}

function isPasswordStrong(checks: PasswordChecks): boolean {
  return checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber;
}

// ─── Google G Icon SVG ─────────────────────────────────────
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('ID');
  const [mode, setMode] = useState<Mode>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  // Derived
  const t = T[lang];
  const isRegister = mode === 'register';
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const pwChecks = checkPasswordStrength(password);
  const pwStrong = isPasswordStrong(pwChecks);

  // ─── Google Login (via @react-oauth/google) ──────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        const res = await fetch('/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: tokenResponse.access_token }),
        });
        const json = await res.json();

        if (res.ok && json.code === 0) {
          const token = json.data?.accessToken || json.accessToken;
          if (token) {
            localStorage.setItem('aceproxy_token', token);
            localStorage.setItem('aceproxy_user', JSON.stringify(json.data?.user || {}));
          }
          setSuccess(mode === 'register' ? t.successRegister : t.successLogin);
          setTimeout(() => {
            const redirect = router.query.redirect as string;
            router.push(redirect || '/account');
          }, 800);
        } else {
          setError(json.message || t.errorGoogle);
        }
      } catch {
        setError(t.errorGoogle);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError(t.errorGoogle);
      setGoogleLoading(false);
    },
    flow: 'implicit',
  });

  // ─── Dev Quick Login (skip OAuth) ────────────────────
  async function handleDevLogin() {
    setDevLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@aceproxy.com', displayName: 'Test User' }),
      });
      const json = await res.json();
      if (res.ok && json.user) {
        const token = json.accessToken;
        if (token) {
          localStorage.setItem('aceproxy_token', token);
          localStorage.setItem('aceproxy_user', JSON.stringify(json.user));
        }
        setSuccess(t.successLogin);
        setTimeout(() => {
          const redirect = router.query.redirect as string;
          router.push(redirect || '/account');
        }, 600);
      } else {
        setError(json.message || 'Dev login failed');
      }
    } catch {
      setError('Dev login failed. Is the backend running?');
    } finally {
      setDevLoading(false);
    }
  }

  // ─── Validation ─────────────────────────────────────────
  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate(): boolean {
    if (!validateEmail(email)) {
      setError(t.errorEmail);
      return false;
    }
    if (!pwStrong) {
      setError(t.errorPassword);
      return false;
    }
    if (isRegister && password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      return false;
    }
    return true;
  }

  // ─── Submit ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body: Record<string, string> = { email, password };
    if (isRegister && phone.trim()) body.phone = phone.trim();
    if (isRegister && displayName.trim()) body.displayName = displayName.trim();

    try {
      const res = await fetch(`/api/v1${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok && json.code === 0) {
        const token = json.data?.accessToken || json.accessToken;
        if (token) {
          localStorage.setItem('aceproxy_token', token);
          localStorage.setItem('aceproxy_user', JSON.stringify(json.data?.user || { email }));
        }
        setSuccess(isRegister ? t.successRegister : t.successLogin);
        setTimeout(() => {
          const redirect = router.query.redirect as string;
          router.push(redirect || '/account');
        }, 800);
      } else {
        setError(json.message || (isRegister ? t.errorRegister : t.errorLogin));
      }
    } catch {
      setError(isRegister ? t.errorRegister : t.errorLogin);
    } finally {
      setLoading(false);
    }
  }

  // ─── Password strength bar ───────────────────────────────
  const strengthPercent = (
    (pwChecks.minLength ? 25 : 0) +
    (pwChecks.hasLower ? 25 : 0) +
    (pwChecks.hasUpper ? 25 : 0) +
    (pwChecks.hasNumber ? 25 : 0)
  );

  function getStrengthColor(pct: number): string {
    if (pct >= 100) return 'bg-success';
    if (pct >= 50) return 'bg-warning';
    return 'bg-error';
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>{t.title}</title>
      </Head>
      <div className="min-h-screen bg-canvas-warm font-body flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 border-3 border-black flex items-center justify-center font-display font-black text-base text-white bg-terracotta">
                  A
                </div>
                <span className="font-display font-black text-lg tracking-tight hidden sm:block">
                  ACEPROXY
                </span>
              </Link>
              <div className="flex gap-2">
                {(['ID', 'EN', 'ZH'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 border-2 border-black text-[10px] font-display font-bold
                      ${lang === l ? 'bg-terracotta text-white border-terracotta' : 'bg-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-display font-bold text-ink-mute uppercase tracking-wider mb-8 hover:text-terracotta transition-colors"
            >
              <ArrowLeft size={14} /> {t.back}
            </Link>

            {/* Card */}
            <div
              className="bg-white border-4 border-black p-6 sm:p-8"
              style={{ boxShadow: '8px 8px 0 #000' }}
            >
              {/* Heading */}
              <h1 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-[-0.02em] mb-2">
                {isRegister ? t.registerHeading : t.heading}
              </h1>
              <p className="text-sm text-ink-secondary mb-6">
                {isRegister ? t.registerSubtitle : t.subtitle}
              </p>

              {/* ── Success / Error Banners ── */}
              {success && (
                <div key="success-banner" className="mb-4 px-4 py-3 bg-green-50 border-3 border-success text-sm font-bold text-green-800 flex items-center gap-2">
                  <Check size={16} /> {success}
                </div>
              )}
              {error && (
                <div key="error-banner" className="mb-4 px-4 py-3 bg-red-50 border-3 border-error text-sm font-bold text-red-800 flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => setError('')}
                    className="font-display font-black ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* ──────────────────────────────────────────────
                  SOCIAL LOGIN SECTION
                  ────────────────────────────────────────────── */}
              <div className="mb-5">
                <p className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider mb-3 text-center">
                  {t.socialLogin}
                </p>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={googleLoading}
                  className={`w-full flex items-center justify-center gap-3 px-5 py-3 
                    border-3 border-black bg-white
                    font-display font-bold text-sm uppercase tracking-[-0.01em]
                    transition-all duration-100 ease-out cursor-pointer
                    hover:bg-canvas-gray hover:-translate-y-0.5
                    active:translate-y-0.5
                    ${googleLoading ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  style={{ boxShadow: '3px 3px 0 #000' }}
                >
                  {googleLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {t.googleProcessing}
                    </>
                  ) : (
                    <>
                      <GoogleIcon size={20} />
                      {t.googleBtn}
                    </>
                  )}
                </button>

                {/* Dev Quick Login (only in dev mode) */}
                {isDevMode && (
                  <button
                    type="button"
                    onClick={handleDevLogin}
                    disabled={devLoading}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-3
                      border-2 border-dashed border-ocean bg-ocean/5
                      font-display font-bold text-xs uppercase tracking-wider text-ocean
                      transition-all duration-100 ease-out cursor-pointer
                      hover:bg-ocean/10 hover:-translate-y-0.5
                      active:translate-y-0.5
                      ${devLoading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    {devLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        Dev Quick Login
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* ───── Divider ───── */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t-2 border-dashed border-black/15" />
                <span className="text-[10px] font-display font-bold text-ink-mute uppercase tracking-wider whitespace-nowrap">
                  {t.orDivider}
                </span>
                <div className="flex-1 border-t-2 border-dashed border-black/15" />
              </div>

              {/* ──────────────────────────────────────────────
                  EMAIL LOGIN FORM
                  ────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <label className="block text-xs font-display font-bold uppercase mb-2 text-ink">
                  {t.email}
                </label>
                <div className="relative mb-4">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-11 pr-4 py-3 border-3 border-black text-base font-bold
                      outline-none focus:border-terracotta transition-colors"
                  />
                </div>

                {/* Password */}
                <label className="block text-xs font-display font-bold uppercase mb-2 text-ink">
                  {t.password}
                </label>
                <div className="relative mb-1">
                  <Key
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-11 pr-12 py-3 border-3 border-black text-base font-bold
                      outline-none focus:border-terracotta transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator (always visible when typing) */}
                {password.length > 0 && (
                  <div key="pw-strength" className="mb-4 mt-2">
                    {/* Strength bar */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-none">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(strengthPercent)}`}
                          style={{ width: `${strengthPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-ink-mute tabular-nums">
                        {strengthPercent}%
                      </span>
                    </div>
                    {/* Checkmarks */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      {[
                        { key: 'minLength' as const, label: t.pwMinLength },
                        { key: 'hasUpper' as const, label: t.pwUpper },
                        { key: 'hasLower' as const, label: t.pwLower },
                        { key: 'hasNumber' as const, label: t.pwNumber },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1">
                          {pwChecks[key] ? (
                            <Check size={12} className="text-success flex-shrink-0" />
                          ) : (
                            <Circle size={10} className="text-ink-mute/30 flex-shrink-0 ml-px" />
                          )}
                          <span
                            className={`text-[10px] font-bold leading-tight ${
                              pwChecks[key] ? 'text-success' : 'text-ink-mute'
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Password (register only) */}
                {isRegister && (
                  <div className="mb-4">
                    <label className="block text-xs font-display font-bold uppercase mb-2 text-ink">
                      {t.confirmPassword}
                    </label>
                    <div className="relative">
                      <Key
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
                      />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.confirmPasswordPlaceholder}
                        className={`w-full pl-11 pr-12 py-3 border-3 text-base font-bold
                          outline-none transition-colors
                          ${
                            confirmPassword && confirmPassword !== password
                              ? 'border-error'
                              : confirmPassword && confirmPassword === password
                              ? 'border-success'
                              : 'border-black focus:border-terracotta'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p key="pw-mismatch" className="text-[10px] font-bold text-error mt-1.5 ml-1 flex items-center gap-1">
                        <X size={10} /> {t.errorPasswordMismatch}
                      </p>
                    )}
                    {confirmPassword && confirmPassword === password && (
                      <p key="pw-match" className="text-[10px] font-bold text-success mt-1.5 ml-1 flex items-center gap-1">
                        <Check size={10} /> Passwords match
                      </p>
                    )}
                  </div>
                )}

                {/* Extra fields (register only) */}
                {isRegister && (
                  <>
                    {/* Display Name */}
                    <label className="block text-xs font-display font-bold uppercase mb-2 text-ink">
                      {t.displayNameLabel}
                    </label>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t.displayNamePlaceholder}
                        className="w-full pl-4 pr-4 py-3 border-3 border-black text-base font-bold
                          outline-none focus:border-terracotta transition-colors"
                      />
                    </div>

                    {/* Phone (collapsible) */}
                    {showPhone ? (
                      <div key="phone-input" className="mb-4">
                        <label className="block text-xs font-display font-bold uppercase mb-2 text-ink">
                          {t.phoneLabel}
                        </label>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
                          />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t.phonePlaceholder}
                            className="w-full pl-11 pr-4 py-3 border-3 border-black text-base font-bold
                              outline-none focus:border-terracotta transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        key="phone-toggle"
                        type="button"
                        onClick={() => setShowPhone(true)}
                        className="w-full mb-4 py-2 flex items-center justify-center gap-1.5
                          border-2 border-dashed border-ink-mute/20
                          text-[10px] font-display font-bold uppercase tracking-wider text-ink-mute
                          hover:border-ink hover:text-ink transition-all"
                      >
                        <Phone size={12} /> + {t.phoneLabel}
                      </button>
                    )}
                  </>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2
                    px-8 py-4 border-4 border-black
                    bg-terracotta text-white font-display font-bold text-lg uppercase tracking-[-0.02em]
                    transition-all duration-100 ease-out cursor-pointer
                    hover:translate-x-0.5 hover:translate-y-0.5
                    active:translate-x-1 active:translate-y-1
                    ${loading ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  style={{ boxShadow: '6px 6px 0 #000' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {isRegister ? t.registering : t.logging}
                    </>
                  ) : (
                    <>
                      {isRegister ? t.register : t.login}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Mode */}
              <button
                onClick={() => {
                  setMode(isRegister ? 'login' : 'register');
                  setError('');
                  setSuccess('');
                  setConfirmPassword('');
                }}
                className="w-full py-2 mt-4 text-sm font-display font-bold text-terracotta hover:text-ink transition-colors uppercase"
              >
                {isRegister ? t.switchToLogin : t.switchToRegister}
              </button>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t-2 border-dashed border-black/10">
                <ShieldCheck size={14} className="text-ocean" />
                <span className="text-[10px] font-bold text-ink-mute uppercase tracking-wider">
                  {t.trust}
                </span>
              </div>
            </div>

            {/* Bottom hint */}
            <p className="text-center text-[10px] font-bold text-ink-mute/50 mt-6 uppercase tracking-wider">
              AceProxy © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
