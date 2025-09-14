export const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
