import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RATES, refreshRates, saveRates, loadRates, type Rates } from './fx';

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
});
