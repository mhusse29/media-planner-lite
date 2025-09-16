import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RATES,
  hostProvider,
  loadRates,
  loadTs,
  refreshRates,
  saveRates,
  saveTs,
  type LiveFxProvider,
  type Rates
} from './fx';

const TTL = 6 * 60 * 60 * 1000;
const START_TIME = new Date('2024-01-01T00:00:00.000Z');

describe('refreshRates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_TIME);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('merges live rates with stored rates, updates timestamp, and skips provider within TTL', async () => {
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

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rates: {
          EGP: 31.1,
          AED: 3.6123,
          SAR: 3.76,
          EUR: 0.95,
        },
      }),
    });
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

    const currentTime = Date.now();
    expect(loadTs()).toBe(currentTime);

    vi.setSystemTime(currentTime + TTL / 2);
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

    const failingProvider: LiveFxProvider = vi.fn(() => Promise.reject(new Error('failed')));

    const result = await refreshRates(failingProvider, TTL);

    expect(failingProvider).toHaveBeenCalledTimes(1);
    expect(result).toEqual(stored);
    expect(loadRates()).toEqual(stored);
    expect(loadTs()).toBe(previousTs);
  });
});
