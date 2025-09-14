import type { Platform, Goal, Market, Currency } from './assumptions';

export interface AppState {
  totalBudget: number;
  currency: Currency;
  market: Market;
  goal: Goal;
  niche: string;
  leadToSalePercent: number;
  revenuePerSale: number;
  selectedPlatforms: Platform[];
  manualSplit: boolean;
  platformWeights: Record<Platform, number>;
  includeAll: boolean;
  manualCPL: boolean;
  platformCPLs: Record<Platform, number>;
}

const STORAGE_KEY = 'media-plan-lite-state';

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function loadState(): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return null;
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
}
