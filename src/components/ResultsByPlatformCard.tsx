import { useMemo, useState } from "react";
import AppCard from "../ui/AppCard";

type Row = {
  platform?: string;
  name?: string;
  budget: string;
  impr: string;
  reach: string;
  clicks: string | number;
  leads: string | number;
  cpl: string | number;
  views?: string | number;
  eng?: string | number;
  ctr?: string;
  cpc?: string | number;
  cpm?: string | number;
};

export default function ResultsByPlatformCard({
  rows,
  totals,
  onOpenColumns,
  showInlineKpis = false,
  columns = [
    { key: "budget", label: "Budget", visible: true },
    { key: "impr", label: "Impr.", visible: true },
    { key: "reach", label: "Reach", visible: true },
    { key: "clicks", label: "Clicks", visible: true },
    { key: "leads", label: "Leads", visible: true },
    { key: "cpl", label: "CPL", visible: true },
    { key: "views", label: "Views", visible: true },
    { key: "eng", label: "Eng.", visible: true },
    { key: "ctr", label: "CTR", visible: true },
    { key: "cpc", label: "CPC", visible: true },
    { key: "cpm", label: "CPM", visible: true },
  ],
}: {
  rows: Row[];
  totals: Partial<Row> & { platform?: string; roas?: string | number };
  onOpenColumns?: () => void;
  showInlineKpis?: boolean;
  columns?: { key: string; label: string; visible: boolean }[];
}) {
  const [q, setQ] = useState("");

  const activeCols = columns.filter(c => c.visible);
  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(r => (r.name || r.platform || "").toLowerCase().includes(s));
  }, [q, rows]);

  return (
    <AppCard className="mt-6">
      {showInlineKpis && (
        <div className="kpi-row">
          <div className="kpi-tile"><div className="kpi-label">💰 Total Budget</div><div className="kpi-value">{totals.budget ?? "—"}</div></div>
          <div className="kpi-tile"><div className="kpi-label">👆 Total Clicks</div><div className="kpi-value">{totals.clicks ?? "—"}</div></div>
          <div className="kpi-tile"><div className="kpi-label">🎯 Total Leads</div><div className="kpi-value">{totals.leads ?? "—"}</div></div>
          <div className="kpi-tile"><div className="kpi-label">📈 ROAS</div><div className="kpi-value">{(totals as any).roas ?? "—"}</div></div>
        </div>
      )}

      <div className="table-toolbar">
        <input className="search-input" placeholder="Search platform…" value={q} onChange={(e) => setQ(e.target.value)} />
        {onOpenColumns && (
          <button className="columns-btn" onClick={onOpenColumns}>Columns</button>
        )}
      </div>

      <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead className="table-head">
            <tr>
              <th>Platform</th>
              {activeCols.map(c => (<th key={c.key}>{c.label}</th>))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={(r.name || r.platform || "") + i} className="table-row">
                <td><span className="app-chip" style={{ background:"#1A1C1E" }}>{r.name || r.platform}</span></td>
                {activeCols.map(c => (
                  <td key={c.key}>
                    {c.key === "budget" ? <span className="table-badge">{(r as any)[c.key]}</span> : (r as any)[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="table-row" style={{ background: "rgba(255,255,255,0.02)" }}>
              <td><strong>Total</strong></td>
              {activeCols.map(c => (<td key={c.key}><strong>{(totals as any)[c.key] ?? "—"}</strong></td>))}
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}
