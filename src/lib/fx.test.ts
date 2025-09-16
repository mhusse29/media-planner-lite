import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RATES,
  alias,
  applyPegs,
  fromUSD,
  hasRate,
  hostProvider,
  loadRates,
  loadTs,
  refreshRates,
  saveRates,
  saveTs,
  toUSD,
  type LiveFxProvider,
  type Rates,
} from './fx';

const TTL = 6 * 60 * 60 * 1000;
const START_TIME = new Date('2024-01-01T00:00:00.000Z');
const STORAGE_KEY = 'mpl_fx_usd_per_v2';

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
};

beforeEach(() => {
  vi.stubGlobal('localStorage', createLocalStorageMock());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('storage helpers', () => {
  it('returns defaults when nothing is stored', () => {
    const rates = loadRates();

    expect(rates).toEqual(DEFAULT_RATES);
    expect(rates).not.toBe(DEFAULT_RATES);
  });

  it('merges saved overrides with defaults', () => {
    const overrides: Rates = {
      ...DEFAULT_RATES,
      EGP: 31.2,
      AED: 3.61,
      EUR: 0.93,
      SER: 42,
    };
    saveRates(overrides);

    const loaded = loadRates();

    expect(loaded).toEqual(overrides);
    expect(loaded.AED).toBe(3.61);
    expect(loaded.USD).toBe(1);
  });

  it('falls back to defaults when stored JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json');

    const rates = loadRates();

    expect(rates).toEqual(DEFAULT_RATES);
  });

  it('persists timestamps as numbers', () => {
    const ts = START_TIME.getTime();
    saveTs(ts);

    expect(loadTs()).toBe(ts);
  });
});

describe('currency helpers', () => {
  it('aliases SER to SAR and leaves other codes intact', () => {
    expect(alias('SER')).toBe('SAR');
    expect(alias('EGP')).toBe('EGP');
  });

  it('applies pegs while preserving other overrides', () => {
    const current: Rates = {
      ...DEFAULT_RATES,
      USD: 0.5,
      AED: 3.8,
      SAR: 3.6,
      SER: 12,
      EGP: 30,
      EUR: 0.92,
    };

    const pegged = applyPegs(current);

    expect(pegged.USD).toBe(1);
    expect(pegged.AED).toBe(3.6725);
    expect(pegged.SAR).toBe(3.75);
    expect(pegged.SER).toBe(12);
    expect(pegged.EGP).toBe(30);
  });

  it('converts to and from USD using aliases', () => {
    const rates: Rates = {
      ...DEFAULT_RATES,
      SAR: 3.75,
      SER: null,
    };

    expect(toUSD(7.5, 'SER', rates)).toBeCloseTo(2);
    expect(fromUSD(2, 'SER', rates)).toBeCloseTo(7.5);
  });

  it('treats missing rates as already USD', () => {
    const rates: Rates = {
      ...DEFAULT_RATES,
      EGP: null,
    };

    expect(toUSD(100, 'EGP', rates)).toBe(100);
    expect(fromUSD(100, 'EGP', rates)).toBe(100);
  });

  it('checks rate availability with alias awareness', () => {
    saveRates({
      ...DEFAULT_RATES,
      EGP: null,
    });

    expect(hasRate('SAR')).toBe(true);
    expect(hasRate('SER')).toBe(true);
    expect(hasRate('EGP')).toBe(false);
  });
});

describe('hostProvider', () => {
  it('fetches live rates and normalises missing fields', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        rates: {
          EGP: 31.1,
          AED: 3.61,
          SAR: 3.74,
        },
      }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const live = await hostProvider();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.exchangerate.host/latest?base=USD&symbols=EGP,AED,SAR,EUR',
    );
    expect(live).toEqual({
      USD: 1,
      EGP: 31.1,
      AED: 3.61,
      SAR: 3.74,
      EUR: null,
    });
  });
});

describe('refreshRates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_TIME);
  });

  it('merges live SAR rates while retaining existing values', async () => {
    const seeded: Rates = { ...DEFAULT_RATES, EGP: 50, SAR: 3.6 };
    saveRates(seeded);

    const provider = vi.fn().mockResolvedValue({ SAR: 3.71 });
    const merged = await refreshRates(provider, 0);

    expect(provider).toHaveBeenCalledTimes(1);
    expect(merged.SAR).toBe(3.71);
    expect(merged.EGP).toBe(50);

    const persisted = loadRates();
    expect(persisted.SAR).toBe(3.71);
    expect(persisted.EGP).toBe(50);
  });

  it('merges live rates, updates timestamp, and skips provider within TTL', async () => {
    const stored: Rates = {
      ...DEFAULT_RATES,
      AED: 3.5,
      SAR: 3.7,
      EGP: 30.5,
      EUR: 0.9,
      SER: 42,
    };
    saveRates(stored);

    const staleStamp = Date.now() - TTL - 1;
    saveTs(staleStamp);

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          rates: {
            EGP: 31.1,
            AED: 3.6123,
            SAR: 3.76,
            EUR: 0.95,
          },
        }),
      } as unknown as Response);

    vi.stubGlobal('fetch', fetchMock);

    const merged = await refreshRates(hostProvider, TTL);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(merged).toEqual({
      ...stored,
      USD: 1,
      EGP: 31.1,
      AED: 3.6123,
      SAR: 3.76,
      EUR: 0.95,
    });
    expect(merged.SER).toBe(42);
    expect(loadRates()).toEqual(merged);

    const now = Date.now();
    expect(loadTs()).toBe(now);

    vi.setSystemTime(now + TTL / 2);

    const cached = await refreshRates(hostProvider, TTL);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cached).toEqual(merged);
  });

  it('keeps stored rates when provider rejects', async () => {
    const stored: Rates = {
      ...DEFAULT_RATES,
      EGP: 29.9,
      EUR: 0.88,
      SER: 12,
    };
    saveRates(stored);

    const previousTs = Date.now() - TTL - 1;
    saveTs(previousTs);

    const failingProvider: LiveFxProvider = vi.fn(() =>
      Promise.reject(new Error('failed')),
    );

    const result = await refreshRates(failingProvider, TTL);

    expect(failingProvider).toHaveBeenCalledTimes(1);
    expect(result).toEqual(stored);
    expect(loadRates()).toEqual(stored);
    expect(loadTs()).toBe(previousTs);
  });
});
