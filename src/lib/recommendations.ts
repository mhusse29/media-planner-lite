import type { PlatformResult } from './math';
import { CHANNEL_ASSUMPTIONS } from './assumptions';

export interface Recommendation {
  platform: string;
  text: string;
  type: 'warning' | 'suggestion';
}

export function generateRecommendations(results: PlatformResult[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const result of results) {
    const assumptions = CHANNEL_ASSUMPTIONS[result.platform];
    
    // Low CTR check
    if (result.ctr < 0.01) {
      recommendations.push({
        platform: result.platform,
        text: "Try fresher creatives, clearer headline, or tighter audience.",
        type: 'warning'
      });
    }

    // High CPC check (1.3x assumed)
    if (assumptions.CPC && result.cpc > assumptions.CPC * 1.3) {
      recommendations.push({
        platform: result.platform,
        text: "Refine keywords/audience or adjust bid strategy.",
        type: 'warning'
      });
    }

    // High CPL check
    const expectedCPL = result.cpc / assumptions.convRate;
    if (result.cpl > expectedCPL * 1.5) {
      recommendations.push({
        platform: result.platform,
        text: "Improve lead form/offer; retarget engaged users.",
        type: 'suggestion'
      });
    }

    // Platform-specific checks
    switch (result.platform) {
      case 'YOUTUBE':
        if (result.views && result.impressions > 0 && (result.views / result.impressions) < 0.15) {
          recommendations.push({
            platform: result.platform,
            text: "Hook in first 3 seconds; tighten targeting.",
            type: 'warning'
          });
        }
        break;

      case 'TIKTOK':
        if (result.views && result.impressions > 0 && (result.views / result.impressions) < 0.12) {
          recommendations.push({
            platform: result.platform,
            text: "Shorter video with a strong hook.",
            type: 'warning'
          });
        }
        break;

      case 'GOOGLE_DISPLAY':
        if (result.ctr < 0.003) {
          recommendations.push({
            platform: result.platform,
            text: "Use tighter audiences, responsive display with video, and exclude poor placements.",
            type: 'suggestion'
          });
        }
        break;

      case 'LINKEDIN':
        // Check if LinkedIn CPL is > 2x Meta average
        const metaResults = results.filter(r => r.platform === 'FACEBOOK' || r.platform === 'INSTAGRAM');
        if (metaResults.length > 0) {
          const avgMetaCPL = metaResults.reduce((sum, r) => sum + r.cpl, 0) / metaResults.length;
          if (result.cpl > avgMetaCPL * 2) {
            recommendations.push({
              platform: result.platform,
              text: "Narrow targeting or shift budget to high-intent channels.",
              type: 'suggestion'
            });
          }
        }
        break;
    }
  }

  return recommendations;
}
