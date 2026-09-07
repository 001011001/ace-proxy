import { cn } from '@/lib/utils';

/** 全页加载器（首屏 / 路由守卫校验会话时用） */
export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-ink border-t-terracotta" />
      <p className="font-body text-body-sm uppercase tracking-widest text-ink-mute">
        {label || 'Loading...'}
      </p>
    </div>
  );
}

/** 骨架块 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-sm bg-canvas-gray', className)} />;
}

/** 商品卡片骨架（列表/首页网格用） */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-sm border-3 border-ink bg-white p-sm2 shadow-brutal-md">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-md2 h-4 w-3/4" />
      <Skeleton className="mt-sm2 h-4 w-1/2" />
      <Skeleton className="mt-md2 h-10 w-full rounded-pill" />
    </div>
  );
}

/** 商品网格骨架 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-lg2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
