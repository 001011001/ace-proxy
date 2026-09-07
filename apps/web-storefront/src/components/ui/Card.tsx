import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 是否启用 hover 阴影放大效果 */
  interactive?: boolean;
  /** 内边距尺寸 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-sm2',
  md: 'p-lg2',
  lg: 'p-xl2',
};

/** Card — Neo-Brutalism 卡片（粗边框 + 硬阴影） */
export function Card({ children, interactive = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-sm border-3 border-ink bg-white shadow-brutal-md',
        interactive && 'transition-all duration-150 hover:shadow-brutal-lg',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b-3 border-ink pb-sm2 font-display text-heading-lg', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-md2', className)} {...props}>
      {children}
    </div>
  );
}
