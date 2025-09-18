import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import AppCard from "../ui/AppCard";

export type ColumnDef = { key: string; label: string; visible: boolean };

export default function ColumnsDialog({
  open, onClose, cols, setCols, storageKey = "mpl_columns_v1",
}: {
  open: boolean;
  onClose: () => void;
  cols: ColumnDef[];
  setCols: Dispatch<SetStateAction<ColumnDef[]>>;
  storageKey?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    const normalizeVisible = (value: unknown): boolean | undefined => {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (typeof value === "string") {
        if (value === "true" || value === "1") return true;
        if (value === "false" || value === "0") return false;
      }
      return undefined;
    };

    try {
      const parsed = JSON.parse(saved);
      const maybeArray = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && "columns" in parsed && Array.isArray((parsed as any).columns)
          ? (parsed as any).columns
          : null;

      if (!maybeArray) return;

      const visibility = new Map<string, boolean>();
      for (const entry of maybeArray) {
        if (!entry || typeof entry !== "object") continue;
        const key = (entry as { key?: unknown }).key;
        if (typeof key !== "string") continue;
        const vis = normalizeVisible((entry as { visible?: unknown }).visible);
        if (vis === undefined) continue;
        visibility.set(key, vis);
      }

      if (visibility.size === 0) return;

      setCols(current => {
        let changed = false;
        const next = current.map(col => {
          const vis = visibility.get(col.key);
          if (vis === undefined || col.visible === vis) return col;
          changed = true;
          return { ...col, visible: vis };
        });
        return changed ? next : current;
      });
    } catch {
      // ignore malformed JSON payloads
    }
  }, [open, setCols, storageKey]);

  const toggle = (key: string) => {
    const next = cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c);
    setCols(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 10, 17, 0.72)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <AppCard
        className="columns-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Select columns to display"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-card__header">
          <span className="app-card__eyebrow">Columns</span>
          <span className="app-card__subtitle">Choose which metrics appear in the channel breakdown.</span>
        </div>
        <div className="columns-grid">
          {cols.map(c => (
            <label key={c.key} className="columns-option">
              <input
                type="checkbox"
                checked={c.visible}
                onChange={() => toggle(c.key)}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        <div className="columns-footer">
          <button className="columns-btn" onClick={onClose}>Done</button>
        </div>
      </AppCard>
    </div>
  );
}
