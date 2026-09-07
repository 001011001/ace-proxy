import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ────────────────────────────────────────────────
   Toast System — Brutalist styling, cross-page UX
   - Global provider + useToast() hook
   - Auto-dismiss + manual close
   - Hard-shadow square cards with colored left edge
   ──────────────────────────────────────────────── */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
}

interface ToastOptions {
  variant?: ToastVariant;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: ToastOptions) => string;
  success: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  error: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  warning: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  info: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<
  ToastVariant,
  { border: string; bar: string; icon: ReactNode; iconColor: string }
> = {
  success: {
    border: 'border-success',
    bar: 'bg-success',
    iconColor: 'text-success',
    icon: <CheckCircle2 size={20} className="text-success" />,
  },
  error: {
    border: 'border-error',
    bar: 'bg-error',
    iconColor: 'text-error',
    icon: <XCircle size={20} className="text-error" />,
  },
  warning: {
    border: 'border-warning',
    bar: 'bg-warning',
    iconColor: 'text-warning',
    icon: <AlertTriangle size={20} className="text-warning" />,
  },
  info: {
    border: 'border-ocean',
    bar: 'bg-ocean',
    iconColor: 'text-ocean',
    icon: <Info size={20} className="text-ocean" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message: string, opts: ToastOptions = {}): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: ToastItem = {
        id,
        variant: opts.variant ?? 'info',
        title: opts.title,
        message,
        duration: opts.duration ?? 3500,
      };
      setToasts(prev => [...prev, item]);
      if (item.duration > 0) {
        const timer = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (m, o) => push(m, o),
      success: (m, o) => push(m, { ...o, variant: 'success' }),
      error: (m, o) => push(m, { ...o, variant: 'error' }),
      warning: (m, o) => push(m, { ...o, variant: 'warning' }),
      info: (m, o) => push(m, { ...o, variant: 'info' }),
      dismiss,
    }),
    [push, dismiss],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(t => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Viewport — top-right on desktop, top-center on mobile */}
      <div className="fixed top-3 right-3 z-[9999] flex flex-col gap-2 w-[calc(100vw-1.5rem)] max-w-[360px] pointer-events-none">
        {toasts.map(t => {
          const cfg = VARIANT_CONFIG[t.variant];
          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto bg-white border-4 ${cfg.border} shadow-[6px_6px_0_#000] flex overflow-hidden animate-[toast-in_0.18s_ease-out]`}
            >
              <div className={`w-1.5 shrink-0 ${cfg.bar}`} />
              <div className="flex-1 flex items-start gap-2.5 p-3 min-w-0">
                <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p className="font-display font-bold text-sm text-ink uppercase tracking-[-0.01em] leading-tight">
                      {t.title}
                    </p>
                  )}
                  <p className="text-sm text-ink-secondary leading-snug break-words">
                    {t.message}
                  </p>
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center border-2 border-black bg-white hover:bg-canvas-gray transition-colors"
                  aria-label="关闭"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op fallback so components don't crash outside provider
    return {
      toast: () => '',
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
      dismiss: () => {},
    };
  }
  return ctx;
}
