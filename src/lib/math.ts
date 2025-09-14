import type { Platform, Market, Goal } from './assumptions';
import { CHANNEL_ASSUMPTIONS, MARKET_UPLIFT, FREQUENCY } from './assumptions';
import { GOAL_WEIGHTS } from './weights';

export interface PlatformResult {
  platform: Platform;
  budget: number;
  impressions: number;
  clicks: number;
  views?: number;
  engagements: number;
  reach: number;
  leads: number;
  sales: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpl: number;
  cac: number;
  weight: number;
}

export interface CalculationInputs {
  totalBudget: number;
  selectedPlatforms: Platform[];
  goal: Goal;
  market: Market;
  leadToSalePercent: number;
  revenuePerSale: number;
  manualSplit: boolean;
  platformWeights?: Record<Platform, number>;
  includeAll: boolean;
  manualCPL: boolean;
  platformCPLs?: Record<Platform, number>;
}

export function calculatePlatformWeights(
  selectedPlatforms: Platform[],
  goal: Goal,
  manualSplit: boolean,
  manualWeights?: Record<Platform, number>,
  includeAll: boolean = false
): Record<Platform, number> {
  if (manualSplit && manualWeights) {
    // Normalize manual weights to sum to 100%
    const total = Object.values(manualWeights).reduce((sum, w) => sum + w, 0);
    const normalized: Record<Platform, number> = {} as any;
    
    for (const platform of selectedPlatforms) {
      normalized[platform] = (manualWeights[platform] || 0) / total;
    }
    
    return normalized;
  }

  const baseWeights = GOAL_WEIGHTS[goal];
  const weights: Record<Platform, number> = {} as any;
  
  // Get weights for selected platforms
  for (const platform of selectedPlatforms) {
    weights[platform] = baseWeights[platform] || 0;
  }

  // Apply "include all" logic
  if (includeAll) {
    const MIN_WEIGHT = 0.10;
    for (const platform of selectedPlatforms) {
      if (weights[platform] === 0) {
        weights[platform] = MIN_WEIGHT;
      }
    }
  }

  // Normalize to sum to 1
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (total > 0) {
    for (const platform of selectedPlatforms) {
      weights[platform] = weights[platform] / total;
    }
  }

  return weights;
}

export function calculateResults(inputs: CalculationInputs): PlatformResult[] {
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
    platformCPLs
  } = inputs;

  const weights = calculatePlatformWeights(
    selectedPlatforms,
    goal,
    manualSplit,
    platformWeights,
    includeAll
  );

  const results: PlatformResult[] = [];
  const marketUplift = market === 'Egypt' ? 1 : MARKET_UPLIFT;

  for (const platform of selectedPlatforms) {
    const assumptions = CHANNEL_ASSUMPTIONS[platform];
    const weight = weights[platform] || 0;
    const budget = totalBudget * weight;

    let impressions = 0;
    let clicks = 0;

    // Apply market uplift to CPM/CPC
    if (assumptions.CPC) {
      const cpc = assumptions.CPC * marketUplift;
      clicks = budget / cpc;
      impressions = clicks / assumptions.CTR;
    } else if (assumptions.CPM) {
      const cpm = assumptions.CPM * marketUplift;
      impressions = (budget / cpm) * 1000;
      clicks = impressions * assumptions.CTR;
    }

    // Calculate other metrics
    const views = assumptions.VTR ? impressions * assumptions.VTR : undefined;
    const engagements = impressions * (assumptions.ER || 0.010);
    const reach = impressions / FREQUENCY;

    // Calculate leads
    let leads = 0;
    if (manualCPL && platformCPLs?.[platform] && platformCPLs[platform] > 0) {
      leads = budget / platformCPLs[platform];
    } else {
      leads = clicks * assumptions.convRate;
    }

    // Calculate sales and revenue
    const sales = leads * (leadToSalePercent / 100);
    const revenue = sales * revenuePerSale;

    // Calculate effective metrics
    const ctr = clicks > 0 ? clicks / impressions : 0;
    const cpc = clicks > 0 ? budget / clicks : 0;
    const cpm = impressions > 0 ? (budget / impressions) * 1000 : 0;
    const cpl = leads > 0 ? budget / leads : 0;
    const cac = sales > 0 ? budget / sales : 0;

    results.push({
      platform,
      budget,
      impressions,
      clicks,
      views,
      engagements,
      reach,
      leads,
      sales,
      revenue,
      ctr,
      cpc,
      cpm,
      cpl,
      cac,
      weight
    });
  }

  return results;
}

export function calculateTotals(results: PlatformResult[]) {
  const totals = {
    budget: 0,
    impressions: 0,
    clicks: 0,
    engagements: 0,
    reach: 0,
    leads: 0,
    sales: 0,
    revenue: 0
  };

  for (const result of results) {
    totals.budget += result.budget;
    totals.impressions += result.impressions;
    totals.clicks += result.clicks;
    totals.engagements += result.engagements;
    totals.reach += result.reach;
    totals.leads += result.leads;
    totals.sales += result.sales;
    totals.revenue += result.revenue;
  }

  return {
    ...totals,
    ctr: totals.clicks > 0 ? totals.clicks / totals.impressions : 0,
    cpc: totals.clicks > 0 ? totals.budget / totals.clicks : 0,
    cpm: totals.impressions > 0 ? (totals.budget / totals.impressions) * 1000 : 0,
    cpl: totals.leads > 0 ? totals.budget / totals.leads : 0,
    cac: totals.sales > 0 ? totals.budget / totals.sales : 0,
    roas: totals.budget > 0 ? totals.revenue / totals.budget : 0
  };
}
