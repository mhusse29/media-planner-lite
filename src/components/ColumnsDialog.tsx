import { useEffect } from "react";

export type ColumnDef = { key: string; label: string; visible: boolean };

export default function ColumnsDialog({
  open, onClose, cols, setCols, storageKey = "mpl_columns_v1",
}: {
  open: boolean;
  onClose: () => void;
  cols: ColumnDef[];
  setCols: (c: ColumnDef[]) => void;
  storageKey?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setCols(JSON.parse(saved)); } catch {}
    }
  }, [open, setCols, storageKey]);

  const toggle = (key: string) => {
    const next = cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c);
    setCols(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  if (!open) return null;

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50,
      display:"flex", alignItems:"center", justifyContent:"center"
    }} onClick={onClose}>
      <div
        className="app-card"
        style={{ width: 420, padding:16, background: "var(--card-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight:700, marginBottom:8, color: "var(--text)" }}>Columns</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {cols.map(c => (
            <label key={c.key} className="app-card--inner" style={{ 
              padding:8, 
              display:"flex", 
              alignItems:"center", 
              gap:8,
              cursor: "pointer"
            }}>
              <input 
                type="checkbox" 
                checked={c.visible} 
                onChange={() => toggle(c.key)}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ color:"var(--text)" }}>{c.label}</span>
            </label>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
          <button className="columns-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
