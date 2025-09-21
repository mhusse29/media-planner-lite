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
        'planner-card space-y-3',
        className
      )}
      {...props}
    />
  );
});

export const microTitleClass =
  'text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60';
