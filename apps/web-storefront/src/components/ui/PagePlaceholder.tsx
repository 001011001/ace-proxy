import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  phase: string;
}

/**
 * 页面占位 — Phase 0 用于打通路由
 * Phase 1 / 2 会替换为完整实现
 */
export function PagePlaceholder({ title, description, icon, phase }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl px-lg2 py-huge">
      <div className="rounded-sm border-3 border-ink bg-white p-xl2 shadow-brutal-md">
        <div className="mb-md2 text-terracotta">{icon}</div>
        <h1 className="font-display text-display-md text-ink">{title}</h1>
        {description && <p className="mt-md2 font-body text-body-md text-ink-mute">{description}</p>}
        <div className="mt-lg2 inline-flex items-center gap-2 rounded-pill border-3 border-ink bg-canvas-warm px-4 py-2">
          <span className="font-body text-body-sm font-bold uppercase tracking-wide text-ink-mute">
            {phase}
          </span>
        </div>
        <div className="mt-xl2">
          <Link to="/" className="font-body text-body-sm font-bold text-terracotta underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
