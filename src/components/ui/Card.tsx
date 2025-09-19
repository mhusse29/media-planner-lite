import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export type CardProps = HTMLAttributes<HTMLElement>;

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { className, ...props },
  ref
) {
  return (
    <section
      ref={ref}
      className={cn(
        'isolate space-y-3 rounded-2xl bg-surface-2 p-4 md:p-5 ring-1 ring-white/10 shadow-soft',
        className
      )}
      {...props}
    />
  );
});

export const microTitleClass =
  'text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60';
