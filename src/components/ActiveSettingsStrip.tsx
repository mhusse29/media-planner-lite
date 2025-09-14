import { useMemo } from "react";

type PctMap = Record<string, number>;

export function ActiveSettingsStrip({
  mode,
  includeAll,
  manualCpl,
  selected,
  pctMap,
  hideManualCplPill = false
}:{
  mode: 'auto' | 'manual';
  includeAll: boolean;
  manualCpl: boolean;
  selected: string[];
  pctMap: PctMap;
  hideManualCplPill?: boolean;
}){
  const sumPct = useMemo(() => {
    if (mode !== 'manual') return null;
    return selected.reduce((s, k) => s + Math.max(0, pctMap[k] ?? 0), 0);
  }, [mode, selected, pctMap]);

  const pills: {label: string; variant?: 'ok' | 'warn' | 'off'}[] = [];

  // Mode pill
  pills.push({ label: mode === 'auto' ? 'Mode: Auto split' : 'Mode: Manual split' });

  // Include-all (only meaningful in auto)
  pills.push({
    label: `Include all: ${includeAll ? 'On' : 'Off'}`,
    variant: mode === 'auto' ? (includeAll ? 'ok' : 'off') : 'off'
  });

  // Manual CPL
  if (!hideManualCplPill) {
    pills.push({ label: `Manual CPL: ${manualCpl ? 'On' : 'Off'}`, variant: manualCpl ? 'ok' : 'off' });
  }

  // Platforms selected
  pills.push({ label: `Platforms: ${selected.length}`, variant: selected.length > 0 ? 'ok' : 'warn' });

  // Sum when manual
  if (sumPct !== null) {
    const sumOk = Math.abs(sumPct - 100) < 0.01;
    pills.push({
      label: `Sum: ${sumPct.toFixed(2)}%`,
      variant: sumOk ? 'ok' : 'warn'
    });
  }

  return (
    <div className="statusStrip" role="status" aria-live="polite">
      {pills.map((p, i) => (
        <div key={i} className={`statusPill ${p.variant ?? ''}`}>
          <span className="dot" />
          <span>{p.label}</span>
        </div>
      ))}
    </div>
  );
}
