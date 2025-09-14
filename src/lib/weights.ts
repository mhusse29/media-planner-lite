import type { Platform, Goal } from './assumptions';

export const GOAL_WEIGHTS: Record<Goal, Record<Platform, number>> = {
  AWARENESS: {
    FACEBOOK: 0.22,
    INSTAGRAM: 0.23,
    TIKTOK: 0.20,
    YOUTUBE: 0.20,
    GOOGLE_DISPLAY: 0.10,
    GOOGLE_SEARCH: 0.03,
    LINKEDIN: 0.02
  },
  LEADS: {
    GOOGLE_SEARCH: 0.45,
    FACEBOOK: 0.25,
    INSTAGRAM: 0.10,
    GOOGLE_DISPLAY: 0.05,
    YOUTUBE: 0.00,
    TIKTOK: 0.05,
    LINKEDIN: 0.10
  },
  TRAFFIC: {
    GOOGLE_SEARCH: 0.40,
    FACEBOOK: 0.22,
    INSTAGRAM: 0.15,
    GOOGLE_DISPLAY: 0.08,
    YOUTUBE: 0.08,
    TIKTOK: 0.05,
    LINKEDIN: 0.02
  }
};
