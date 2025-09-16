import { describe, it, expect } from 'vitest';
import { calculateResults, calculatePlatformWeights, calculateTotals } from './math';
import type { Platform } from './assumptions';

describe('Media Plan Calculations', () => {
  const basePlatforms: Platform[] = ['FACEBOOK', 'GOOGLE_SEARCH', 'INSTAGRAM'];
  
  // Test 1: Budget sum equals input (within float tolerance)
  it('should calculate budget sum equal to total budget', () => {
    const totalBudget = 10000;
    const results = calculateResults({
      totalBudget,
      selectedPlatforms: basePlatforms,
      goal: 'LEADS',
      market: 'Egypt',
      leadToSalePercent: 20,
      revenuePerSale: 800,
      manualSplit: false,
      includeAll: false,
      manualCPL: false
    });

    const totalCalculatedBudget = results.reduce((sum, r) => sum + r.budget, 0);
    expect(Math.abs(totalCalculatedBudget - totalBudget)).toBeLessThan(0.01);
  });

  // Test 2: "Include all" assigns ≥10% to zero-weight selected platforms
  it('should assign at least 10% to zero-weight platforms when includeAll is true', () => {
    const platforms: Platform[] = ['FACEBOOK', 'YOUTUBE', 'INSTAGRAM'];
    const weights = calculatePlatformWeights(
      platforms,
      'LEADS', // YouTube has 0 weight for LEADS
      false,
      undefined,
      true // includeAll
    );

    expect(weights.YOUTUBE).toBeGreaterThanOrEqual(0.10);
    
    // Check normalization
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    expect(Math.abs(total - 1)).toBeLessThan(0.001);
  });

  it('should distribute equally when calculated weights sum to zero', () => {
    const platforms: Platform[] = ['YOUTUBE'];
    const weights = calculatePlatformWeights(
      platforms,
      'LEADS',
      false,
      undefined,
      false
    );

    expect(weights.YOUTUBE).toBe(1);

    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    expect(Math.abs(total - 1)).toBeLessThan(0.001);
  });

  // Test 3: Manual % split honors user inputs and normalizes
  it('should normalize manual splits to fractional weights even if inputs total less than 100', () => {
    const platforms: Platform[] = ['FACEBOOK', 'GOOGLE_SEARCH'];
    const manualWeights = {
      FACEBOOK: 30,
      GOOGLE_SEARCH: 50
    };
    
    const weights = calculatePlatformWeights(
      platforms,
      'LEADS',
      true, // manual split
      manualWeights as any
    );

    // Should convert 80 total input points into fractional weights summing to 1
    expect(weights.FACEBOOK).toBeCloseTo(30 / 80, 5);
    expect(weights.GOOGLE_SEARCH).toBeCloseTo(50 / 80, 5);
    
    const total = weights.FACEBOOK + weights.GOOGLE_SEARCH;
    expect(Math.abs(total - 1)).toBeLessThan(0.001);
  });

  it('should distribute manual weights equally when total is non-positive', () => {
    const platforms: Platform[] = ['FACEBOOK', 'INSTAGRAM'];
    const manualWeights = {
      FACEBOOK: 0,
      INSTAGRAM: 0
    } as Record<Platform, number>;

    const weights = calculatePlatformWeights(
      platforms,
      'LEADS',
      true,
      manualWeights
    );

    expect(weights.FACEBOOK).toBeCloseTo(0.5, 5);
    expect(weights.INSTAGRAM).toBeCloseTo(0.5, 5);

    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    expect(Math.abs(total - 1)).toBeLessThan(0.001);
  });

  // Test 4: Views present for Facebook, Instagram, YouTube, TikTok, LinkedIn
  it('should calculate views for platforms with VTR', () => {
    const platforms: Platform[] = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'LINKEDIN'];
    const results = calculateResults({
      totalBudget: 10000,
      selectedPlatforms: platforms,
      goal: 'AWARENESS',
      market: 'Egypt',
      leadToSalePercent: 20,
      revenuePerSale: 800,
      manualSplit: false,
      includeAll: false,
      manualCPL: false
    });

    const platformsWithViews = results.filter(r => r.views !== undefined);
    expect(platformsWithViews.map(r => r.platform)).toEqual(
      expect.arrayContaining(['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'LINKEDIN'])
    );
    
    platformsWithViews.forEach(result => {
      expect(result.views).toBeGreaterThan(0);
    });
  });

  // Test 5: Google Search uses CPC logic; Google Display uses CPM logic
  it('should use correct pricing model for Google platforms', () => {
    const results = calculateResults({
      totalBudget: 10000,
      selectedPlatforms: ['GOOGLE_SEARCH', 'GOOGLE_DISPLAY'],
      goal: 'TRAFFIC',
      market: 'Egypt',
      leadToSalePercent: 20,
      revenuePerSale: 800,
      manualSplit: false,
      includeAll: false,
      manualCPL: false
    });

    const searchResult = results.find(r => r.platform === 'GOOGLE_SEARCH');
    const displayResult = results.find(r => r.platform === 'GOOGLE_DISPLAY');

    // Google Search should have clicks = budget / CPC
    expect(searchResult!.clicks).toBeCloseTo(searchResult!.budget / 6, 1); // CPC = 6
    
    // Google Display should have impressions = (budget / CPM) * 1000
    expect(displayResult!.impressions).toBeCloseTo((displayResult!.budget / 14) * 1000, 1); // CPM = 14
  });

  // Test 6: Manual CPL ON: Leads = Budget ÷ CPL
  it('should calculate leads based on manual CPL when enabled', () => {
    const manualCPL = 25;
    const results = calculateResults({
      totalBudget: 10000,
      selectedPlatforms: ['FACEBOOK'],
      goal: 'LEADS',
      market: 'Egypt',
      leadToSalePercent: 20,
      revenuePerSale: 800,
      manualSplit: false,
      includeAll: false,
      manualCPL: true,
      platformCPLs: { FACEBOOK: manualCPL } as any
    });

    const fbResult = results[0];
    expect(fbResult.leads).toBeCloseTo(fbResult.budget / manualCPL, 1);
    expect(fbResult.cpl).toBeCloseTo(manualCPL, 1);
  });
});

describe('Totals Calculation', () => {
  it('should calculate correct totals including ROAS and CAC', () => {
    const results = calculateResults({
      totalBudget: 10000,
      selectedPlatforms: ['FACEBOOK', 'GOOGLE_SEARCH'],
      goal: 'LEADS',
      market: 'Egypt',
      leadToSalePercent: 20,
      revenuePerSale: 800,
      manualSplit: false,
      includeAll: false,
      manualCPL: false
    });

    const totals = calculateTotals(results);
    
    expect(totals.budget).toBe(10000);
    expect(totals.roas).toBe(totals.revenue / totals.budget);
    expect(totals.cac).toBe(totals.budget / totals.sales);
    expect(totals.cpl).toBe(totals.budget / totals.leads);
  });
});
