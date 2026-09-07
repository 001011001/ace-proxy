import { ReactNode } from 'react';

/* ────────────────────────────────────────────────
   Skeleton Primitives — Brutalist loading states
   Hard-border pulse blocks consistent with the
   .card-brutal design language.
   ──────────────────────────────────────────────── */

const basePulse =
  'bg-canvas-gray border-2 border-black animate-pulse';

/** Generic block skeleton */
export function SkeletonBlock({
  className = '',
  rounded = false,
}: {
  className?: string;
  rounded?: boolean;
}) {
  return (
    <div className={`${basePulse} ${rounded ? 'rounded-full' : ''} ${className}`} />
  );
}

/** Product card skeleton — matches .card-brutal layout */
export function SkeletonProductCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white border-4 border-black overflow-hidden ${className}`}
      style={{ boxShadow: '3px 3px 0 #000' }}
    >
      <div className={`aspect-square bg-canvas-gray border-b-4 border-black ${''}`} />
      <div className="p-3">
        <div className={`h-3 w-3/4 mb-2 ${basePulse}`} />
        <div className={`h-3 w-1/2 mb-3 ${basePulse}`} />
        <div className="flex items-center justify-between">
          <div className={`h-5 w-1/3 ${basePulse}`} />
          <div className={`h-4 w-8 rounded-full ${basePulse}`} />
        </div>
      </div>
    </div>
  );
}

/** Grid of product-card skeletons */
export function SkeletonProductGrid({
  count = 8,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

/** Text line skeleton */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${basePulse} h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** Generic full-section loading wrapper */
export function SkeletonSection({
  title = true,
  children,
}: {
  title?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="py-10">
      {title && (
        <div className="mb-6 flex items-center gap-2">
          <div className={`w-5 h-5 ${basePulse}`} />
          <div className={`h-6 w-40 ${basePulse}`} />
        </div>
      )}
      {children}
    </section>
  );
}
