export type Weights = Record<string, number>; // 0..1 each, sum ~1
export type Percents = Record<string, number>; // 0..100 as entered

// Normalize a map to sum 1. If all zero, return equal splits over "keys".
export function normalizeToUnit(weights: Record<string, number>, keys: string[]): Weights {
  const entries = keys.map(k => [k, Math.max(0, weights[k] ?? 0)]) as [string, number][];
  const sum = entries.reduce((s, [,v]) => s + v, 0);
  if (sum <= 0) {
    const eq = 1 / Math.max(1, keys.length);
    const out: Weights = {};
    keys.forEach(k => { out[k] = eq; });
    return out;
  }
  const out: Weights = {};
  entries.forEach(([k, v]) => { out[k] = v / sum; });
  return out;
}

// Build final weights depending on manual/auto mode.
// - selected: platform codes to include (e.g., ['FACEBOOK','INSTAGRAM',...])
// - manualOn: if true, use "manualPct" (0..100 per selected)
// - autoWeights: your existing auto weights (0..1 per platform)
// - includeAllMin10: when true, clamp manual entries to ≥10% and enforce ≥10% in auto mode
export function deriveDisplayWeights(
  selected: string[],
  manualOn: boolean,
  manualPct: Percents,
  autoWeights: Weights,
  includeAllMin10: boolean
): { weights: Weights; manualSum: number } {

  if (manualOn) {
    const pct: Record<string, number> = {};
    const adjusted: Record<string, number> = {};
    let sum = 0;
    const minEach = includeAllMin10 ? 10 : 0;
    selected.forEach(k => {
      const v = Math.max(0, manualPct[k] ?? 0);
      pct[k] = v;
      adjusted[k] = includeAllMin10 ? Math.max(minEach, v) : v;
      sum += v;
    });
    // Normalize (handles sum 0 by equal split)
    const weights = normalizeToUnit(adjusted, selected);
    return { weights, manualSum: sum };
  }

  // AUTO mode
  const base: Record<string, number> = {};
  selected.forEach(k => { base[k] = Math.max(0, autoWeights[k] ?? 0); });

  let weights = normalizeToUnit(base, selected);

  if (includeAllMin10) {
    // Enforce >=10% for each selected platform, then renormalize the rest
    const min = 0.10;
    const enforced: Record<string, number> = {};
    let lockedSum = 0;
    const toFill: string[] = [];
    selected.forEach(k => {
      if (weights[k] < min) { enforced[k] = min; lockedSum += min; }
      else toFill.push(k);
    });
    const remaining = Math.max(0, 1 - lockedSum);
    if (toFill.length > 0) {
      const slice = remaining / toFill.length;
      toFill.forEach(k => { enforced[k] = slice; });
    } else if (lockedSum > 0) {
      // all clamped to min; renormalize evenly
      const eq = 1 / Math.max(1, selected.length);
      selected.forEach(k => { enforced[k] = eq; });
    }
    weights = enforced;
  }

  return { weights, manualSum: -1 }; // manualSum not relevant in auto mode
}


