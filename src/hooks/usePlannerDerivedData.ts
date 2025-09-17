import { useMemo } from 'react';
import type { Platform } from '../lib/assumptions';
import { PLATFORM_LABELS, formatCurrency, formatNumber } from '../lib/utils';
import { calculateResults, calculateTotals } from '../lib/math';
import { generateRecommendations } from '../lib/recommendations';
import { deriveDisplayWeights } from '../utils/split';
import { fmt } from '../utils/format';
import type { PlannerState } from './usePlannerState';

export type ResultsRow = {
  platform: string;
  name: string;
  budget: string;
  impr: string;
  reach: string;
  clicks: string | number;
  leads: string | number;
  cpl: string | number;
  views?: string | number;
  eng?: string | number;
  ctr: string;
  cpc: string | number;
  cpm: string | number;
};

export type DerivedData = {
  results: ReturnType<typeof calculateResults>;
  totals: ReturnType<typeof calculateTotals>;
  recommendations: ReturnType<typeof generateRecommendations>;
  platformNames: Record<string, string>;
  rowsFmt: ResultsRow[];
  totalsFmt: Partial<ResultsRow> & { roas: string };
  donutData: Array<{ name: string; value: number; platform: string }>;
  centerValue: string;
  centerLabel: string;
  barsData: Array<{ name: string; value: number; platform: Platform }>;
};

export type PlannerDerivedDataArgs = PlannerState;

export const usePlannerDerivedData = (state: PlannerDerivedDataArgs): DerivedData => {
  const {
    totalBudget,
    selectedPlatforms,
    goal,
    market,
    leadToSalePercent,
    revenuePerSale,
    manualSplit,
    platformWeights,
    includeAll,
    manualCPL,
    platformCPLs,
    currency,
    mode,
  } = state;

  const results = useMemo(
    () =>
      calculateResults({
        totalBudget,
        selectedPlatforms,
        goal,
        market,
        leadToSalePercent,
        revenuePerSale,
        manualSplit,
        platformWeights,
        includeAll,
        manualCPL,
        platformCPLs,
      }),
    [
      totalBudget,
      selectedPlatforms,
      goal,
      market,
      leadToSalePercent,
      revenuePerSale,
      manualSplit,
      platformWeights,
      includeAll,
      manualCPL,
      platformCPLs,
    ]
  );

  const totals = useMemo(() => calculateTotals(results), [results]);
  const recommendations = useMemo(() => generateRecommendations(results), [results]);

  const platformNames = useMemo(() => {
    const map: Record<string, string> = {};
    selectedPlatforms.forEach((platform) => {
      map[platform] = PLATFORM_LABELS[platform] || platform;
    });
    return map;
  }, [selectedPlatforms]);

  const rowsFmt = useMemo(
    () =>
      results.map<ResultsRow>((r) => ({
        platform: r.platform,
        name: PLATFORM_LABELS[r.platform] || r.platform,
        budget: `${fmt(r.budget, 0)} ${currency}`,
        impr: fmt(r.impressions, 0),
        reach: fmt(r.reach, 0),
        clicks: fmt(r.clicks, 0),
        leads: fmt(r.leads, 0),
        cpl: fmt(r.cpl, 2),
        views: r.views ? fmt(r.views, 0) : '—',
        eng: r.engagements ? fmt(r.engagements, 0) : '—',
        ctr: `${fmt((r.ctr || 0) * 100, 2)}%`,
        cpc: fmt(r.cpc, 2),
        cpm: fmt(r.cpm, 2),
      })),
    [currency, results]
  );

  const totalsFmt = useMemo(
    () => ({
      budget: `${fmt(totals.budget, 0)} ${currency}`,
      impr: fmt(totals.impressions, 0),
      reach: fmt(totals.reach, 0),
      clicks: fmt(totals.clicks, 0),
      leads: fmt(totals.leads, 0),
      cpl: fmt(totals.cpl, 2),
      views: totals.views ? fmt(totals.views, 0) : '—',
      eng: totals.engagements ? fmt(totals.engagements, 0) : '—',
      ctr: '—',
      cpc: '—',
      cpm: '—',
      roas: totals.roas ? `${fmt(totals.roas, 2)}x` : '—',
    }),
    [currency, totals]
  );

  const chartData = useMemo(() => {
    const manualOn = mode === 'manual';
    const manualPct: Record<string, number> = selectedPlatforms.reduce((acc, platform) => {
      acc[platform] = Math.max(0, platformWeights[platform] ?? 0);
      return acc;
    }, {} as Record<string, number>);

    const autoWeights: Record<string, number> = selectedPlatforms.reduce((acc, platform) => {
      const result = results.find((r) => r.platform === platform);
      acc[platform] = Math.max(0, result?.weight ?? 0);
      return acc;
    }, {} as Record<string, number>);

    const { weights, manualSum } = deriveDisplayWeights(
      selectedPlatforms as unknown as string[],
      manualOn,
      manualPct,
      autoWeights,
      includeAll
    );

    const donutData = selectedPlatforms
      .map((platform) => ({
        name: PLATFORM_LABELS[platform] || platform,
        value: Math.round((weights[platform] ?? 0) * 100),
        platform,
      }))
      .filter((item) => item.value > 0 || selectedPlatforms.length === 1);

    const centerValue = `${fmt(totals.budget || 0, 0)} ${currency}`;
    const centerLabel = manualOn
      ? manualSum === 100
        ? 'Manual split'
        : `Manual split (normalized from ${Math.round(manualSum)}%)`
      : includeAll
      ? 'Auto split (≥10% each)'
      : 'Auto split';

    const barsData = results.map((r) => ({
      name: PLATFORM_LABELS[r.platform] || r.platform,
      value: Math.round(r.impressions || 0),
      platform: r.platform,
    }));

    return { donutData, centerValue, centerLabel, barsData };
  }, [currency, includeAll, mode, results, selectedPlatforms, totals.budget, platformWeights]);

  return {
    results,
    totals,
    recommendations,
    platformNames,
    rowsFmt,
    totalsFmt,
    donutData: chartData.donutData,
    centerValue: chartData.centerValue,
    centerLabel: chartData.centerLabel,
    barsData: chartData.barsData,
  };
};

export const summarizeTotals = (totals: ReturnType<typeof calculateTotals>, currency: string) => ({
  totalBudget: formatCurrency(totals.budget, currency),
  totalClicks: formatNumber(totals.clicks),
  totalLeads: formatNumber(totals.leads),
  roas: Number.isFinite(totals?.roas) ? `${totals.roas?.toFixed(2)}x` : '—',
});

