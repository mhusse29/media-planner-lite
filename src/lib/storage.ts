import type { Platform, Goal, Market, Currency } from './assumptions';
import { CHANNEL_ASSUMPTIONS } from './assumptions';

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

const VALID_PLATFORMS = Object.keys(CHANNEL_ASSUMPTIONS) as Platform[];
const PLATFORM_SET = new Set<string>(VALID_PLATFORMS);

function sanitizePlatformList(value: unknown): Platform[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<Platform>();
  const platforms: Platform[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    if (!PLATFORM_SET.has(entry)) continue;
    const platform = entry as Platform;
    if (seen.has(platform)) continue;
    seen.add(platform);
    platforms.push(platform);
  }
  return platforms;
}

function sanitizeNumberRecord(source: unknown): Record<Platform, number> {
  const sanitized: Record<Platform, number> = {} as Record<Platform, number>;
  if (!source || typeof source !== 'object') return sanitized;
  const record = source as Record<string, unknown>;
  for (const platform of VALID_PLATFORMS) {
    const value = record[platform];
    const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : null;
    if (numeric === null) continue;
    if (!Number.isFinite(numeric)) continue;
    sanitized[platform] = numeric;
  }
  return sanitized;
}

export function saveState(state: AppState) {
  try {
    const sanitized: AppState = {
      ...state,
      selectedPlatforms: sanitizePlatformList(state.selectedPlatforms),
      platformWeights: sanitizeNumberRecord(state.platformWeights),
      platformCPLs: sanitizeNumberRecord(state.platformCPLs),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function loadState(): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const raw = JSON.parse(stored) as Partial<AppState> | null;
      if (!raw || typeof raw !== 'object') {
        return null;
      }

      const next: Partial<AppState> = {};

      if (typeof raw.totalBudget === 'number' && Number.isFinite(raw.totalBudget)) {
        next.totalBudget = raw.totalBudget;
      }
      if (typeof raw.currency === 'string') {
        next.currency = raw.currency as Currency;
      }
      if (typeof raw.market === 'string') {
        next.market = raw.market as Market;
      }
      if (typeof raw.goal === 'string') {
        next.goal = raw.goal as Goal;
      }
      if (typeof raw.niche === 'string') {
        next.niche = raw.niche;
      }
      if (typeof raw.leadToSalePercent === 'number' && Number.isFinite(raw.leadToSalePercent)) {
        next.leadToSalePercent = raw.leadToSalePercent;
      }
      if (typeof raw.revenuePerSale === 'number' && Number.isFinite(raw.revenuePerSale)) {
        next.revenuePerSale = raw.revenuePerSale;
      }

      if (typeof raw.manualSplit === 'boolean') {
        next.manualSplit = raw.manualSplit;
      }
      if (typeof raw.includeAll === 'boolean') {
        next.includeAll = raw.includeAll;
      }
      if (typeof raw.manualCPL === 'boolean') {
        next.manualCPL = raw.manualCPL;
      }

      if ('selectedPlatforms' in raw) {
        next.selectedPlatforms = sanitizePlatformList(raw.selectedPlatforms as unknown);
      }

      if ('platformWeights' in raw) {
        next.platformWeights = sanitizeNumberRecord(raw.platformWeights);
      }

      if ('platformCPLs' in raw) {
        next.platformCPLs = sanitizeNumberRecord(raw.platformCPLs);
      }

      return next;
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
