/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FxManager } from './FxManager';
import { saveRates, DEFAULT_RATES } from '../lib/fx';

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

describe('FxManager', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    saveRates(DEFAULT_RATES);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('only shows supported currencies', () => {
    render(<FxManager onClose={() => {}} />);

    expect(screen.getByText('USD per USD')).toBeInTheDocument();
    expect(screen.queryByText('SER per USD')).toBeNull();
  });
});
