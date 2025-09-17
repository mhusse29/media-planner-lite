import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RATES, refreshRates, saveRates, loadRates, loadTs, hostProvider, type Rates } from './fx';

const KEY_TS = 'mpl_fx_usd_per_ts_v2';

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; }
  } as Storage;
};

describe('refreshRates', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('merges live SAR rates while retaining existing values', async () => {
    const seeded: Rates = { ...DEFAULT_RATES, EGP: 50, SAR: 3.6 };
    saveRates(seeded);

    const provider = vi.fn().mockResolvedValue({ SAR: 3.71 });
    const merged = await refreshRates(provider, 0); // ttl=0 -> always refresh

    expect(provider).toHaveBeenCalledTimes(1);
    expect(merged.SAR).toBe(3.71);
    expect(merged.EGP).toBe(50);

    const persisted = loadRates();
    expect(persisted.SAR).toBe(3.71);
    expect(persisted.EGP).toBe(50);
  });

  it('fetches via hostProvider once, updates the timestamp, and serves cached rates within TTL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        rates: {
          EGP: 31.5,
          AED: 3.665,
          SAR: 3.75,
          EUR: 0.92,
        },
      }),
    } as unknown as Response);

    vi.stubGlobal('fetch', fetchMock);

    const ttlMs = 60_000;
    const firstNow = 1_234_567_000;
    const cachedNow = firstNow + ttlMs / 2;

    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(firstNow)
      .mockReturnValueOnce(cachedNow);

    const first = await refreshRates(hostProvider, ttlMs);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://api.exchangerate.host/latest?base=USD&symbols=EGP,AED,SAR,EUR');
    expect(first).toMatchObject({
      USD: 1,
      EGP: 31.5,
      AED: 3.665,
      SAR: 3.75,
      EUR: 0.92,
    });
    expect(loadRates()).toEqual(first);
    expect(loadTs()).toBe(firstNow);

    const second = await refreshRates(hostProvider, ttlMs);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('skips the provider call when cached rates are still fresh', async () => {
    const seeded: Rates = { ...DEFAULT_RATES, EUR: 0.9 };
    saveRates(seeded);

    const ttlMs = 60_000;
    const now = 1_000_000;
    localStorage.setItem(KEY_TS, String(now - ttlMs / 2));
    const provider = vi.fn();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const result = await refreshRates(provider, ttlMs);

    expect(provider).not.toHaveBeenCalled();
    expect(result).toEqual(seeded);
  });

  it('bubbles the provider error while leaving existing rates untouched', async () => {
    const seeded: Rates = { ...DEFAULT_RATES, AED: 3.66 };
    saveRates(seeded);

    const ttlMs = 1;
    const now = 5_000_000;
    localStorage.setItem(KEY_TS, String(now - 10));
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const provider = vi.fn().mockRejectedValue(new Error('network down'));
    await expect(refreshRates(provider, ttlMs)).rejects.toThrow('network down');

    expect(provider).toHaveBeenCalledTimes(1);
    expect(loadRates()).toEqual(seeded);
    expect(localStorage.getItem(KEY_TS)).toBe(String(now - 10));
  });
});
