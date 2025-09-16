export type Platform = 
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'GOOGLE_SEARCH'
  | 'GOOGLE_DISPLAY'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'LINKEDIN';

export type Goal = 'LEADS' | 'TRAFFIC' | 'AWARENESS';
export type Market = 'Egypt' | 'Saudi Arabia' | 'UAE' | 'Europe';
export type Currency = 'EGP' | 'USD' | 'AED' | 'SAR' | 'EUR';

export interface ChannelAssumptions {
  CPM?: number;
  CPC?: number;
  CTR: number;
  ER?: number;
  VTR?: number;
  convRate: number;
}

export const CHANNEL_ASSUMPTIONS: Record<Platform, ChannelAssumptions> = {
  FACEBOOK: { CPM: 21, CTR: 0.011, ER: 0.016, VTR: 0.18, convRate: 0.035 },
  INSTAGRAM: { CPM: 23, CTR: 0.009, ER: 0.018, VTR: 0.22, convRate: 0.032 },
  GOOGLE_SEARCH: { CPC: 6, CTR: 0.030, convRate: 0.070 },
  GOOGLE_DISPLAY: { CPM: 14, CTR: 0.004, ER: 0.006, VTR: 0.12, convRate: 0.020 },
  YOUTUBE: { CPM: 18, CTR: 0.008, VTR: 0.25, convRate: 0.020 },
  TIKTOK: { CPM: 15, CTR: 0.009, ER: 0.012, VTR: 0.18, convRate: 0.030 },
  LINKEDIN: { CPM: 45, CTR: 0.006, ER: 0.020, VTR: 0.15, convRate: 0.045 }
};

export const MARKET_UPLIFT = 1.3;
export const FREQUENCY = 1.6;

export interface NicheAssumptions {
  l2s: number; // Lead to Sale percentage
  rev: number; // Revenue per sale
}

export const NICHE_DEFAULTS: Record<string, NicheAssumptions> = {
  'Accessories (E-commerce)': { l2s: 8, rev: 700 },
  'Fashion (E-commerce)': { l2s: 10, rev: 900 },
  'Clinics / Beauty': { l2s: 30, rev: 1200 },
  'Real Estate': { l2s: 2, rev: 50000 },
  'Restaurants / Cafés': { l2s: 30, rev: 200 },
  'Education / Courses': { l2s: 15, rev: 3000 },
  'B2B Services': { l2s: 10, rev: 5000 },
  'Local Services': { l2s: 40, rev: 600 },
  'Generic': { l2s: 20, rev: 800 }
};
