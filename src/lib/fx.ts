// src/lib/fx.ts
export type Cur = 'USD'|'EGP'|'AED'|'SAR'|'EUR';
export type Rates = Record<Cur, number | null>;

const KEY = 'mpl_fx_usd_per_v2';       // units per 1 USD
const KEY_TS = 'mpl_fx_usd_per_ts_v2'; // cache timestamp (ms)

// Default: pegs where sensible, null where you should decide.
export const DEFAULT_RATES: Rates = {
  USD: 1,
  AED: 3.6725,        // market peg
  SAR: 3.75,          // market peg
  EGP: null,          // you set
  EUR: null,          // you set/fetch
};

export function loadRates(): Rates {
  try { return { ...DEFAULT_RATES, ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; }
  catch { return { ...DEFAULT_RATES }; }
}
export function saveRates(r: Rates){ localStorage.setItem(KEY, JSON.stringify(r)); }
export function loadTs(): number { return Number(localStorage.getItem(KEY_TS) || 0); }
export function saveTs(ms: number){ localStorage.setItem(KEY_TS, String(ms)); }

// Pegs preset: keep user overrides except overwrite AED/SAR to pegs, USD=1.
export function applyPegs(current: Rates): Rates {
  return { ...current, USD:1, AED:3.6725, SAR:3.75 };
}

// --- Converters (math runs in USD) ---
export function toUSD(amount: number, cur: Cur, r = loadRates()): number {
  const rate = r[cur];
  return rate ? amount / rate : amount; // if missing, treat as already-USD
}
export function fromUSD(usd: number, cur: Cur, r = loadRates()): number {
  const rate = r[cur];
  return rate ? usd * rate : usd;
}

// --- Live provider (pluggable) ---
export type LiveFxProvider = () => Promise<Partial<Rates>>;

/** Example provider: exchangerate.host (free, USD base). Swap for your server if needed. */
export const hostProvider: LiveFxProvider = async () => {
  const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EGP,AED,SAR,EUR');
  if (!res.ok) throw new Error('FX fetch failed');
  const data = await res.json();
  const q = (k: string) => (data?.rates?.[k] ?? null);
  return { USD:1, EGP:q('EGP'), AED:q('AED'), SAR:q('SAR'), EUR:q('EUR') };
};

// Merge and persist incoming live rates (keeps existing if provider omits).
export async function refreshRates(provider: LiveFxProvider, ttlMs = 6*60*60*1000): Promise<Rates> {
  const now = Date.now();
  const last = loadTs();
  const current = loadRates();
  if (now - last < ttlMs) return current; // fresh enough

  try {
    const live = await provider();
    const merged: Rates = { ...current, ...live };
    saveRates(merged); saveTs(now);
    return merged;
  } catch {
    // keep current on failure
    return current;
  }
}

// Simple guard: do we have a rate defined for the selected currency?
export function hasRate(cur: Cur, usd_per = loadRates()): boolean {
  return !!usd_per[cur];
}
