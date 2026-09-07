import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'success' | 'warning' | 'error' | 'terracotta' | 'ocean';

const toneClasses: Record<Tone, string> = {
  default: 'bg-white text-ink',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  terracotta: 'bg-terracotta text-white',
  ocean: 'bg-ocean-soft text-ocean',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** Badge — Neo-Brutalism 徽章（pill 圆角 + 粗边框） */
export function Badge({ children, tone = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border-2 border-ink',
        'px-2 py-1 text-badge font-extrabold uppercase',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
