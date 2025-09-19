import { useEffect, useMemo, useState, useId, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Platform } from '../lib/assumptions';
import { PLATFORM_LABELS } from '../lib/utils';
import { Tooltip } from './ui/Tooltip';
import { PlatformGlyph } from './PlatformGlyph';

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
  let remainder = 100 - minEach * count;
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
  let total = items.reduce((sum, item) => sum + item.floor, 0);
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
  let sum = Object.values(result).reduce((acc, value) => acc + value, 0);
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
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const minEach = enforceMinEach ? 10 : 0;
  const selectedCount = selectedPlatforms.length;
  const titleId = useId();
  const drawerId = `${titleId}-drawer`;

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
    if (!drawerOpen && sum === 0) return 'Splits: —';
    const parts = selectedPlatforms.map((platform) => {
      const value = Math.max(0, platformWeights[platform] ?? 0);
      const code = PLATFORM_SUMMARY_CODES[platform] || PLATFORM_LABELS[platform] || platform;
      return `${code} ${Math.round(value)}`;
    });
    return `Splits: ${parts.join(' • ')}`;
  }, [drawerOpen, mode, platformWeights, selectedCount, selectedPlatforms, sum]);

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
    const distribution = normalizeWithMinimum(platformWeights, selectedPlatforms, minEach);
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
  const helperText = mode === 'auto' ? 'Auto allocates by model CPL.' : 'Adjust % per channel.';

  return (
    <section className="channels-card" aria-labelledby={`${titleId}-title`}>
      <header className="channels-card__head">
        <div className="channels-card__meta">
          <span id={`${titleId}-title`} className="channels-card__title">Channels &amp; Splits</span>
          <span className="channels-card__sub">Pick channels and (optional) edit manual splits.</span>
        </div>
      </header>
      <div className="channels-card__body">
        <div className="channels-row">
          <span className="channels-row__label">CHANNELS</span>
          <div className="channels-pill-grid" role="group" aria-label="Select channels">
            {platforms.map((platform) => {
              const active = selectedPlatforms.includes(platform);
              return (
                <Tooltip key={platform} content={PLATFORM_LABELS[platform] || platform}>
                  <button
                    type="button"
                    className={`channel-pill${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onPlatformToggle(platform)}
                  >
                    <PlatformGlyph platform={platform} />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="channels-row channels-row--mode">
          <div className="channels-mode">
            <span className="channels-row__label">MODE</span>
            <div className="channels-seg" role="group" aria-label="Allocation mode">
              <button
                type="button"
                className={mode === 'auto' ? 'is-active' : ''}
                onClick={() => handleModeChange('auto')}
              >
                Auto
              </button>
              <button
                type="button"
                className={mode === 'manual' ? 'is-active' : ''}
                onClick={() => handleModeChange('manual')}
                disabled={disabledManual}
              >
                Manual
              </button>
            </div>
            <p className="channels-helper">{helperText}</p>
            {disabledManual && (
              <p className="channels-hint">Select at least one channel.</p>
            )}
          </div>
        </div>

        {mode === 'manual' && selectedCount > 0 && (
          <div className="channels-row channels-row--splits">
            <button
              type="button"
              className={`channels-split-trigger${drawerOpen ? ' is-open' : ''}`}
              onClick={toggleDrawer}
              aria-expanded={drawerOpen}
              aria-controls={drawerId}
            >
              <span>Splits</span>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4.47 6.47a.75.75 0 0 1 1.06 0L8 8.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z"
                  fill="currentColor"
                />
              </svg>
            </button>
            {!drawerOpen && (
              <span className="channels-summary" aria-live="polite">{summaryLabel}</span>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {mode === 'manual' && selectedCount > 0 && drawerOpen && (
            <motion.div
              id={drawerId}
              className="channels-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="channels-drawer__grid">
                {selectedPlatforms.map((platform) => {
                  const value = Math.max(0, platformWeights[platform] ?? 0);
                  return (
                    <div key={platform} className="channels-slider-row">
                      <div className="channels-slider__label">
                        <PlatformGlyph platform={platform} />
                        <span>{PLATFORM_LABELS[platform] || platform}</span>
                      </div>
                      <div className="channels-slider__controls">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={value}
                          onChange={(event) => updateValue(platform, Number(event.target.value))}
                          aria-label={`${PLATFORM_LABELS[platform] || platform} split`}
                        />
                        <div className="channels-slider__input">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={value}
                            onChange={(event) => updateValue(platform, Number(event.target.value))}
                            aria-label={`${PLATFORM_LABELS[platform] || platform} percent`}
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="channels-drawer__footer">
                <div className={`channels-sum${sum === 100 ? '' : ' is-warn'}`}>
                  <span>Sum: {sum}%</span>
                  <div className="channels-sum__bar">
                    <div
                      className="channels-sum__fill"
                      style={{ width: `${Math.max(0, Math.min(100, sum))}%` }}
                    />
                  </div>
                </div>
                <div className="channels-drawer__actions">
                  <button type="button" onClick={equalize} disabled={!selectedCount}>
                    Equal split
                  </button>
                  <button type="button" onClick={normalize} disabled={!selectedCount}>
                    Normalize
                  </button>
                  <button type="button" onClick={clear} disabled={!selectedCount}>
                    Clear
                  </button>
                </div>
                <label className="channels-min-toggle">
                  <input
                    type="checkbox"
                    checked={enforceMinEach}
                    onChange={(event) => onEnforceMinEachChange(event.target.checked)}
                  />
                  <span>Min 10% each</span>
                </label>
              </div>

              {minViolation && (
                <p className="channels-error" role="alert">
                  Raise each channel to at least 10% when Min 10% each is on.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default ChannelsSplitsCard;
