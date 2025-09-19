import { useEffect, useMemo, useState, useId, useRef, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Currency, Platform } from '../lib/assumptions';
import { PLATFORM_LABELS, cn } from '../lib/utils';
import { Tooltip } from './ui/Tooltip';
import { PlatformGlyph } from './PlatformGlyph';
import { Card, microTitleClass } from './ui/Card';

const PLATFORM_SUMMARY_CODES: Record<Platform, string> = {
  FACEBOOK: 'FB',
  INSTAGRAM: 'IG',
  GOOGLE_SEARCH: 'GSearch',
  GOOGLE_DISPLAY: 'GDisplay',
  YOUTUBE: 'YT',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
};

type PercentRecord = Record<Platform, number>;

type Props = {
  platforms: Platform[];
  selectedPlatforms: Platform[];
  platformWeights: PercentRecord;
  setPlatformWeights: Dispatch<SetStateAction<PercentRecord>>;
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  enforceMinEach: boolean;
  onEnforceMinEachChange: (value: boolean) => void;
  onPlatformToggle: (platform: Platform) => void;
  currency: Currency;
  manualCpl: boolean;
  platformCPLs: Record<Platform, number>;
  setPlatformCPLs: Dispatch<SetStateAction<Record<Platform, number>>>;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildEqualDistribution(keys: Platform[], minEach: number) {
  const count = keys.length;
  const result: Record<Platform, number> = {} as Record<Platform, number>;
  if (!count) return result;
  if (minEach <= 0) {
    const base = Math.floor(100 / count);
    let remainder = 100 - base * count;
    keys.forEach((key) => {
      result[key] = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
    });
    return result;
  }
  const required = minEach * count;
  if (required >= 100) {
    const base = Math.floor(100 / count);
    let remainder = 100 - base * count;
    keys.forEach((key) => {
      result[key] = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
    });
    return result;
  }
  const remainder = 100 - required;
  const baseAdd = Math.floor(remainder / count);
  let leftover = remainder - baseAdd * count;
  keys.forEach((key) => {
    result[key] = minEach + baseAdd + (leftover > 0 ? 1 : 0);
    if (leftover > 0) leftover -= 1;
  });
  return result;
}

function normalizeWithMinimum(
  values: PercentRecord,
  keys: Platform[],
  minEach: number
) {
  const count = keys.length;
  if (!count) return {} as PercentRecord;
  const safe = keys.map((key) => Math.max(0, values[key] ?? 0));
  const total = safe.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return buildEqualDistribution(keys, minEach);
  }
  if (minEach * count >= 100) {
    return buildEqualDistribution(keys, minEach);
  }
  const floats = keys.map((key, index) => ({
    key,
    value: (safe[index] / total) * 100,
  }));
  const base: Record<Platform, number> = {} as Record<Platform, number>;
  keys.forEach((key) => {
    base[key] = minEach;
  });
  const remainder = 100 - minEach * count;
  if (remainder <= 0) {
    return roundToIntegers(base, minEach);
  }
  const extras = floats.map((entry) => ({
    key: entry.key,
    extra: Math.max(0, entry.value - minEach),
  }));
  const extraTotal = extras.reduce((sum, entry) => sum + entry.extra, 0);
  if (extraTotal <= 0) {
    const evenAdd = remainder / count;
    keys.forEach((key) => {
      base[key] += evenAdd;
    });
    return roundToIntegers(base, minEach);
  }
  keys.forEach((key) => {
    const entry = extras.find((item) => item.key === key);
    if (!entry) return;
    const share = remainder * (entry.extra / extraTotal);
    base[key] += share;
  });
  return roundToIntegers(base, minEach);
}

function roundToIntegers(map: Record<Platform, number>, minEach: number) {
  const entries = Object.entries(map) as [Platform, number][];
  if (!entries.length) return {} as PercentRecord;
  const items = entries.map(([key, value]) => {
    const floor = Math.floor(value);
    return {
      key,
      value,
      floor,
      frac: value - floor,
    };
  });
  const total = items.reduce((sum, item) => sum + item.floor, 0);
  let remainder = 100 - total;
  if (remainder > 0) {
    items.sort((a, b) => b.frac - a.frac);
    let index = 0;
    while (remainder > 0) {
      const item = items[index % items.length];
      item.floor += 1;
      remainder -= 1;
      index += 1;
    }
  } else if (remainder < 0) {
    items.sort((a, b) => a.frac - b.frac);
    let index = 0;
    while (remainder < 0 && index < items.length * 4) {
      const item = items[index % items.length];
      if (item.floor > minEach) {
        item.floor -= 1;
        remainder += 1;
      }
      index += 1;
    }
  }
  const result: Record<Platform, number> = {} as Record<Platform, number>;
  items.forEach((item) => {
    result[item.key] = item.floor;
  });
  const sum = Object.values(result).reduce((acc, value) => acc + value, 0);
  if (sum !== 100 && items.length > 0) {
    const diff = 100 - sum;
    const direction = diff > 0 ? 1 : -1;
    const sorted = [...items].sort((a, b) =>
      direction > 0 ? b.frac - a.frac : a.frac - b.frac
    );
    let remaining = Math.abs(diff);
    let index = 0;
    while (remaining > 0 && index < sorted.length * 4) {
      const key = sorted[index % sorted.length].key;
      if (direction < 0 && result[key] <= minEach) {
        index += 1;
        continue;
      }
      result[key] += direction;
      remaining -= 1;
      index += 1;
    }
  }
  return result;
}

export function ChannelsSplitsCard({
  platforms,
  selectedPlatforms,
  platformWeights,
  setPlatformWeights,
  mode,
  onModeChange,
  enforceMinEach,
  onEnforceMinEachChange,
  onPlatformToggle,
  currency,
  manualCpl,
  platformCPLs,
  setPlatformCPLs,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const minEach = enforceMinEach ? 10 : 0;
  const selectedCount = selectedPlatforms.length;
  const titleId = useId();
  const drawerId = `${titleId}-drawer`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (mode !== 'manual' || selectedCount === 0) {
      setDrawerOpen(false);
    }
  }, [mode, selectedCount]);

  useEffect(() => {
    if (mode === 'manual' && selectedCount === 0) {
      onModeChange('auto');
    }
  }, [mode, selectedCount, onModeChange]);

  useEffect(() => {
    if (drawerOpen) {
      const focusable = drawerRef.current?.querySelector<HTMLElement>(
        'input,button,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  const sum = useMemo(
    () =>
      selectedPlatforms.reduce(
        (acc, platform) => acc + Math.max(0, platformWeights[platform] ?? 0),
        0
      ),
    [selectedPlatforms, platformWeights]
  );

  const summaryLabel = useMemo(() => {
    if (mode !== 'manual' || selectedCount === 0) return '';
    if (sum === 0) return 'Splits: —';
    const parts = selectedPlatforms.map((platform) => {
      const value = Math.max(0, platformWeights[platform] ?? 0);
      const code =
        PLATFORM_SUMMARY_CODES[platform] ||
        PLATFORM_LABELS[platform] ||
        platform;
      return `${code} ${Math.round(value)}%`;
    });
    return `Splits: ${parts.join(' • ')}`;
  }, [mode, platformWeights, selectedCount, selectedPlatforms, sum]);

  const minViolation = enforceMinEach
    ? selectedPlatforms.some((platform) => (platformWeights[platform] ?? 0) < 10)
    : false;

  const toggleDrawer = () => {
    setDrawerOpen((open) => !open);
  };

  const updateValue = (platform: Platform, nextValue: number) => {
    const value = clampPercent(nextValue);
    setPlatformWeights((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const updateCpl = (platform: Platform, raw: string) => {
    setPlatformCPLs((prev) => {
      const next = { ...prev } as Record<Platform, number>;
      if (!raw) {
        delete next[platform];
        return next;
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        delete next[platform];
        return next;
      }
      next[platform] = value;
      return next;
    });
  };

  const applyDistribution = (distribution: Record<Platform, number>) => {
    setPlatformWeights((prev) => {
      const next = { ...prev } as Record<Platform, number>;
      selectedPlatforms.forEach((platform) => {
        if (distribution[platform] !== undefined) {
          next[platform] = clampPercent(distribution[platform]);
        }
      });
      return next;
    });
  };

  const equalize = () => {
    if (!selectedCount) return;
    const distribution = buildEqualDistribution(selectedPlatforms, minEach);
    applyDistribution(distribution);
  };

  const normalize = () => {
    if (!selectedCount) return;
    const distribution = normalizeWithMinimum(
      platformWeights,
      selectedPlatforms,
      minEach
    );
    applyDistribution(distribution);
  };

  const clear = () => {
    if (!selectedCount) return;
    const distribution: Record<Platform, number> = {} as Record<Platform, number>;
    selectedPlatforms.forEach((platform) => {
      distribution[platform] = 0;
    });
    applyDistribution(distribution);
  };

  const handleModeChange = (nextMode: 'auto' | 'manual') => {
    if (nextMode === mode) return;
    if (nextMode === 'manual' && selectedCount === 0) return;
    onModeChange(nextMode);
  };

  const disabledManual = selectedCount === 0;
  const helperText =
    mode === 'auto' ? 'Auto allocates by model CPL.' : 'Adjust % per channel.';
  const openManual = mode === 'manual' && selectedCount > 0;

  const pillButtonClass =
    'inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium text-white/70 ring-1 ring-white/10 transition-colors duration-200 hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <Card aria-labelledby={`${titleId}-title`}>
      <header className="space-y-1">
        <span id={`${titleId}-title`} className={microTitleClass}>
          Channels &amp; Splits
        </span>
        <p className="text-[13px] text-white/70">
          Pick channels and (optional) edit manual splits.
        </p>
      </header>

      <div className="space-y-3">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Channels
          </span>
          <div className="flex flex-wrap gap-2 md:gap-3" role="group" aria-label="Select channels">
            {platforms.map((platform) => {
              const active = selectedPlatforms.includes(platform);
              return (
                <Tooltip key={platform} content={PLATFORM_LABELS[platform] || platform}>
                  <button
                    type="button"
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-white/70 ring-1 ring-white/10 transition-colors duration-200 hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                      active && 'bg-brand/10 text-brand-100 ring-brand/30'
                    )}
                    aria-pressed={active}
                    aria-label={PLATFORM_LABELS[platform] || platform}
                    onClick={() => onPlatformToggle(platform)}
                  >
                    <PlatformGlyph platform={platform} />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Mode
          </span>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="inline-flex h-9 items-center rounded-full bg-surface-3/70 p-1 ring-1 ring-white/10">
                <button
                  type="button"
                  className={cn(
                    'inline-flex h-7 items-center rounded-full px-3 text-xs font-medium text-white/70 transition-colors duration-200',
                    mode === 'auto' && 'bg-brand/10 text-brand-100 shadow-[0_0_0_1px_rgba(107,112,255,0.24)]'
                  )}
                  onClick={() => handleModeChange('auto')}
                >
                  Auto
                </button>
                <button
                  type="button"
                  className={cn(
                    'inline-flex h-7 items-center rounded-full px-3 text-xs font-medium text-white/70 transition-colors duration-200',
                    mode === 'manual' && 'bg-brand/10 text-brand-100 shadow-[0_0_0_1px_rgba(107,112,255,0.24)]',
                    disabledManual && 'opacity-40'
                  )}
                  onClick={() => handleModeChange('manual')}
                  disabled={disabledManual}
                >
                  Manual
                </button>
              </div>
              <p className="text-[12px] text-white/60">{helperText}</p>
            </div>
            {disabledManual && (
              <p className="text-[12px] text-amber-300">Select at least one channel.</p>
            )}
          </div>
        </div>

        {openManual && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                ref={triggerRef}
                type="button"
                className={cn(
                  pillButtonClass,
                  'items-center',
                  drawerOpen && 'bg-brand/10 text-brand-100 ring-brand/30'
                )}
                onClick={toggleDrawer}
                aria-expanded={drawerOpen}
                aria-controls={drawerId}
              >
                Splits
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    drawerOpen && '-rotate-180'
                  )}
                />
              </button>
              {!drawerOpen && summaryLabel && (
                <span
                  className="inline-flex h-8 items-center rounded-full bg-surface-3/70 px-3 text-xs text-white/70 ring-1 ring-white/10"
                  aria-live="polite"
                >
                  {summaryLabel}
                </span>
              )}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {openManual && drawerOpen && (
            <motion.div
              ref={drawerRef}
              key="splits-drawer"
              id={drawerId}
              className="overflow-hidden rounded-2xl border border-white/10 bg-surface-3/70 p-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="space-y-4">
                <div className="grid gap-3">
                  {selectedPlatforms.map((platform) => {
                    const value = Math.max(0, platformWeights[platform] ?? 0);
                    const cplValue = platformCPLs[platform];
                    return (
                      <div
                        key={platform}
                        className="grid gap-3 rounded-2xl bg-surface-2/60 p-3 ring-1 ring-white/5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_90px_150px]"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                          <PlatformGlyph platform={platform} />
                          <span>{PLATFORM_LABELS[platform] || platform}</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={value}
                            onChange={(event) =>
                              updateValue(platform, Number(event.target.value))
                            }
                            aria-label={`${PLATFORM_LABELS[platform] || platform} split`}
                            className="h-1.5 w-full accent-brand"
                          />
                        </div>
                        <div className="flex items-center">
                          <div className="flex h-9 w-full items-center justify-between rounded-xl bg-surface-2/80 px-3 text-sm text-white/80 ring-1 ring-white/10 transition focus-within:ring-2 focus-within:ring-brand/40">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              value={Number.isFinite(value) ? value : 0}
                              onChange={(event) =>
                                updateValue(platform, Number(event.target.value))
                              }
                              aria-label={`${PLATFORM_LABELS[platform] || platform} percent`}
                              className="w-full bg-transparent text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span className="text-xs text-white/50">%</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              'flex h-9 w-full items-center gap-2 rounded-xl bg-surface-2/80 px-3 text-sm ring-1 ring-white/10 transition focus-within:ring-2 focus-within:ring-brand/40',
                              manualCpl ? 'text-white/80' : 'text-white/40'
                            )}
                          >
                            <span className="text-xs font-semibold uppercase text-white/50">
                              {currency}
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={Number.isFinite(cplValue) ? cplValue : ''}
                              onChange={(event) =>
                                updateCpl(platform, event.target.value)
                              }
                              placeholder="Auto"
                              aria-label={`${PLATFORM_LABELS[platform] || platform} CPL override`}
                              className="w-full bg-transparent text-right outline-none placeholder:text-white/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:text-white/40"
                              disabled={!manualCpl}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!manualCpl && (
                  <p className="text-[12px] text-white/50">
                    CPL overrides follow model defaults until Manual CPL is enabled.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={cn(
                      'flex w-full flex-col gap-2 text-xs text-white/70 sm:w-auto',
                      sum !== 100 && 'text-amber-300'
                    )}
                  >
                    <span className="font-semibold">Sum: {sum}%</span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 sm:w-40">
                      <div
                        className={cn(
                          'h-full rounded-full bg-brand',
                          sum !== 100 && 'bg-amber-300'
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, sum))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button type="button" className={pillButtonClass} onClick={equalize} disabled={!selectedCount}>
                      Equal split
                    </button>
                    <button type="button" className={pillButtonClass} onClick={normalize} disabled={!selectedCount}>
                      Normalize
                    </button>
                    <button type="button" className={pillButtonClass} onClick={clear} disabled={!selectedCount}>
                      Clear
                    </button>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      pillButtonClass,
                      enforceMinEach && 'bg-brand/10 text-brand-100 ring-brand/30'
                    )}
                    onClick={() => onEnforceMinEachChange(!enforceMinEach)}
                    aria-pressed={enforceMinEach}
                  >
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full bg-brand transition-opacity',
                          enforceMinEach ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </span>
                    Min 10% each
                  </button>
                </div>

                {minViolation && (
                  <p className="text-[12px] text-rose-300" role="alert">
                    Raise each channel to at least 10% when Min 10% each is on.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export default ChannelsSplitsCard;
