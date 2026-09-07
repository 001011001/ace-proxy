import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-terracotta text-white hover:bg-terracotta-press',
  secondary: 'bg-white text-ink hover:bg-canvas-warm',
  outline: 'bg-transparent text-ink hover:bg-canvas-warm',
  ghost: 'bg-transparent text-ink border-transparent shadow-none hover:bg-canvas-gray active:shadow-none',
  danger: 'bg-error text-white hover:bg-red-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-body-sm',
  md: 'px-6 py-3 text-heading-sm',
  lg: 'px-8 py-4 text-heading-md',
};

/**
 * Button — Neo-Brutalism 按钮
 * 粗黑边框 + 硬阴影，按压时位移并缩小阴影（物理按压感）
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading = false, fullWidth, className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-pill border-3 border-ink',
          'font-body font-extrabold uppercase tracking-wide',
          'shadow-brutal-md transition-all duration-150',
          'active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-sm-press',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-brutal-md',
          variant !== 'ghost' && 'border-ink',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
