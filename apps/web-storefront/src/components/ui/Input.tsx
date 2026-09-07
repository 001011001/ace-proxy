import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Input — Neo-Brutalism 输入框 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-sm border-3 border-ink bg-white px-4 py-3',
        'font-body text-body-md text-ink placeholder:text-ink-mute',
        'focus:border-terracotta focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-canvas-gray',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

/** Textarea */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-sm border-3 border-ink bg-white px-4 py-3',
        'font-body text-body-md text-ink placeholder:text-ink-mute',
        'focus:border-terracotta focus:outline-none',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

/** Select */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full cursor-pointer rounded-sm border-3 border-ink bg-white px-4 py-3',
        'font-body text-body-md text-ink',
        'focus:border-terracotta focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
