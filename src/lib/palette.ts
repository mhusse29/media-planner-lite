// src/lib/palette.ts
export type Platform =
  | 'Facebook' | 'Instagram' | 'Google Search' | 'Google Display'
  | 'YouTube' | 'TikTok' | 'LinkedIn';

export const PLATFORM_ORDER: Platform[] = [
  'Facebook','Google Search','Instagram','YouTube','TikTok','Google Display','LinkedIn'
];

// Color-blind-aware, high-contrast on dark backgrounds.
// Hues are spaced; lightness differs so similar hues still separate.
export const PLATFORM_COLORS: Record<Platform, string> = {
  Facebook:       '#2B8CFF', // vivid blue
  Instagram:      '#FF3D71', // magenta-pink
  'Google Search':'#00B368', // green
  'Google Display':'#F9A825',// amber
  YouTube:        '#FF4D4F', // red
  TikTok:         '#00D1C1', // teal
  LinkedIn:       '#1F6FEB', // blue (darker than FB)
};

export const PLATFORM_COLORS_SOFT: Record<Platform, string> = {
  Facebook:       '#A6C8FF',
  Instagram:      '#FF9AB3',
  'Google Search':'#7CD9B1',
  'Google Display':'#FBD47A',
  YouTube:        '#FF9EA0',
  TikTok:         '#92EFE7',
  LinkedIn:       '#9AC0FF',
};

// Fallback
export const FALLBACK = '#9E9E9E';

export function colorFor(name: string): string {
  return (PLATFORM_COLORS as any)[name] || FALLBACK;
}

export function orderPlatforms(names: string[]): string[] {
  const set = new Set(names);
  return PLATFORM_ORDER.filter(p => set.has(p));
}
