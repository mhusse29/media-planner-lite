import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

type AnimatedCounterProps = {
  value: number | null | undefined;
  formatter?: (value: number) => string;
  fallback?: string;
  className?: string;
};

export function AnimatedCounter({ value, formatter, fallback = '—', className }: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();

  const display = useMemo(() => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }
    return formatter ? formatter(value) : new Intl.NumberFormat('en-US').format(value);
  }, [value, formatter, fallback]);

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return <span className={className}>{display}</span>;
  }

  return (
    <motion.span
      key={`${display}-${value}`}
      className={className}
      initial={prefersReducedMotion ? { opacity: 0.7 } : { scale: 0.96, opacity: 0.7 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {display}
    </motion.span>
  );
}
