import { useCallback, useEffect, useState } from 'react';
import type { Currency, Goal, Market, Platform } from '../lib/assumptions';
import { NICHE_DEFAULTS } from '../lib/assumptions';
import type { AppState } from '../lib/storage';
import { loadState, saveState } from '../lib/storage';

export type PlannerState = {
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
  mode: 'auto' | 'manual';
};

export type PlannerStateApi = PlannerState & {
  setTotalBudget: (value: number) => void;
  setCurrency: (value: Currency) => void;
  setMarket: (value: Market) => void;
  setGoal: (value: Goal) => void;
  setNiche: (value: string) => void;
  setLeadToSalePercent: (value: number) => void;
  setRevenuePerSale: (value: number) => void;
  setSelectedPlatforms: (value: Platform[]) => void;
  setManualSplit: (value: boolean) => void;
  setPlatformWeights: (value: Record<Platform, number>) => void;
  setIncludeAll: (value: boolean) => void;
  setManualCPL: (value: boolean) => void;
  setPlatformCPLs: (value: Record<Platform, number>) => void;
  setMode: (value: 'auto' | 'manual') => void;
  handleNicheChange: (niche: string) => void;
  togglePlatform: (platform: Platform) => void;
  updatePlatformWeights: (next: Record<string, number>) => void;
};

const DEFAULT_PLATFORMS: Platform[] = ['FACEBOOK', 'GOOGLE_SEARCH'];

export const usePlannerState = (): PlannerStateApi => {
  const [totalBudget, setTotalBudget] = useState(10000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [market, setMarket] = useState<Market>('Egypt');
  const [goal, setGoal] = useState<Goal>('LEADS');
  const [niche, setNiche] = useState('Generic');
  const [leadToSalePercent, setLeadToSalePercent] = useState(20);
  const [revenuePerSale, setRevenuePerSale] = useState(800);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [manualSplit, setManualSplit] = useState(false);
  const [platformWeights, setPlatformWeights] = useState<Record<Platform, number>>({} as Record<Platform, number>);
  const [includeAll, setIncludeAll] = useState(false);
  const [manualCPL, setManualCPL] = useState(false);
  const [platformCPLs, setPlatformCPLs] = useState<Record<Platform, number>>({} as Record<Platform, number>);
  const [mode, setMode] = useState<'auto' | 'manual'>(manualSplit ? 'manual' : 'auto');

  useEffect(() => {
    const savedState = loadState();
    if (!savedState) return;

    const applyIfDefined = <T,>(value: T | undefined, setter: (v: T) => void) => {
      if (value !== undefined) setter(value);
    };

    applyIfDefined(savedState.totalBudget, setTotalBudget);
    applyIfDefined(savedState.currency as Currency | undefined, setCurrency);
    applyIfDefined(savedState.market as Market | undefined, setMarket);
    applyIfDefined(savedState.goal as Goal | undefined, setGoal);
    applyIfDefined(savedState.niche, setNiche);
    applyIfDefined(savedState.leadToSalePercent, setLeadToSalePercent);
    applyIfDefined(savedState.revenuePerSale, setRevenuePerSale);
    applyIfDefined(savedState.selectedPlatforms as Platform[] | undefined, setSelectedPlatforms);
    applyIfDefined(savedState.manualSplit, setManualSplit);
    applyIfDefined(savedState.platformWeights as Record<Platform, number> | undefined, setPlatformWeights);
    applyIfDefined(savedState.includeAll, setIncludeAll);
    applyIfDefined(savedState.manualCPL, setManualCPL);
    applyIfDefined(savedState.platformCPLs as Record<Platform, number> | undefined, setPlatformCPLs);
  }, []);

  useEffect(() => setMode(manualSplit ? 'manual' : 'auto'), [manualSplit]);
  useEffect(() => setManualSplit(mode === 'manual'), [mode]);

  useEffect(() => {
    if (mode === 'manual' && includeAll) {
      setIncludeAll(false);
    }
  }, [mode, includeAll]);

  useEffect(() => {
    const state: AppState = {
      totalBudget,
      currency,
      market,
      goal,
      niche,
      leadToSalePercent,
      revenuePerSale,
      selectedPlatforms,
      manualSplit,
      platformWeights,
      includeAll,
      manualCPL,
      platformCPLs,
    };
    saveState(state);
  }, [
    totalBudget,
    currency,
    market,
    goal,
    niche,
    leadToSalePercent,
    revenuePerSale,
    selectedPlatforms,
    manualSplit,
    platformWeights,
    includeAll,
    manualCPL,
    platformCPLs,
  ]);

  const handleNicheChange = useCallback((newNiche: string) => {
    setNiche(newNiche);
    const defaults = NICHE_DEFAULTS[newNiche];
    if (defaults) {
      setLeadToSalePercent(defaults.l2s);
      setRevenuePerSale(defaults.rev);
    }
  }, []);

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const updatePlatformWeights = useCallback((next: Record<string, number>) => {
    setPlatformWeights((prev) => {
      const updated = { ...prev } as Record<Platform, number>;
      Object.entries(next).forEach(([key, value]) => {
        updated[key as Platform] = Math.max(0, Number(value) || 0);
      });
      return updated;
    });
  }, []);

  return {
    totalBudget,
    currency,
    market,
    goal,
    niche,
    leadToSalePercent,
    revenuePerSale,
    selectedPlatforms,
    manualSplit,
    platformWeights,
    includeAll,
    manualCPL,
    platformCPLs,
    mode,
    setTotalBudget,
    setCurrency,
    setMarket,
    setGoal,
    setNiche,
    setLeadToSalePercent,
    setRevenuePerSale,
    setSelectedPlatforms,
    setManualSplit,
    setPlatformWeights,
    setIncludeAll,
    setManualCPL,
    setPlatformCPLs,
    setMode,
    handleNicheChange,
    togglePlatform,
    updatePlatformWeights,
  };
};

