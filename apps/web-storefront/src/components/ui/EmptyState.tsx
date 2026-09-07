import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** 空状态 / 错误状态统一展示 */
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-sm border-3 border-dashed border-ink bg-white px-xl2 py-huge text-center">
      {icon && <div className="text-terracotta">{icon}</div>}
      <h3 className="font-display text-heading-xl text-ink">{title}</h3>
      {description && <p className="max-w-md font-body text-body-md text-ink-mute">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-sm2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
