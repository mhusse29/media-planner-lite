import { useMemo, useState } from 'react';
import { fmt } from '../utils/format';

type Row = {
  platform?: string; name?: string;
  budget: number; impressions: number; reach: number; clicks: number; leads: number;
  CPL_eff?: number; views?: number; engagements?: number; CTR_eff?: number; CPC_eff?: number; CPM_eff?: number;
  cpl?: number; ctr?: number; cpc?: number; cpm?: number;
};

const COLS = [
  { key: 'name', label: 'Platform', align: 'left' as const, fmt: undefined },
  { key: 'budget', label: 'Budget', fmt: (v: number) => fmt(v, 0), align: 'right' as const },
  { key: 'impressions', label: 'Impr.', fmt: (v: number) => fmt(v, 0), align: 'right' as const },
  { key: 'reach', label: 'Reach', fmt: (v: number) => fmt(v, 0), align: 'right' as const },
  { key: 'clicks', label: 'Clicks', fmt: (v: number) => fmt(v, 0), align: 'right' as const },
  { key: 'leads', label: 'Leads', fmt: (v: number) => fmt(v, 0), align: 'right' as const },
  { key: 'cpl', label: 'CPL', fmt: (v: number) => fmt(v ?? 0, 2), align: 'right' as const },
  { key: 'views', label: 'Views', fmt: (v: number) => (v ?? 0) ? fmt(v, 0) : '—', align: 'right' as const },
  { key: 'engagements', label: 'Eng.', fmt: (v: number) => (v ?? 0) ? fmt(v, 0) : '—', align: 'right' as const },
  { key: 'ctr', label: 'CTR', fmt: (v: number) => fmt((v ?? 0) * 100, 2) + '%', align: 'right' as const },
  { key: 'cpc', label: 'CPC', fmt: (v: number) => fmt(v ?? 0, 2), align: 'right' as const },
  { key: 'cpm', label: 'CPM', fmt: (v: number) => fmt(v ?? 0, 2), align: 'right' as const },
] as const;

export function ResultsTablePro({ rows, totals, currency }: { rows: Row[]; totals: any; currency: string }) {
  const [sortBy, setSortBy] = useState<string>('budget');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const data = useMemo(() => {
    const arr = rows.map((r) => ({ ...r, name: r.name || r.platform || '' }));
    const col = COLS.find((c) => c.key === sortBy);
    if (!col) return arr;
    const mul = dir === 'asc' ? 1 : -1;
    return [...arr].sort((a: any, b: any) => {
      const av = a[sortBy] ?? 0; const bv = b[sortBy] ?? 0;
      return av > bv ? mul : av < bv ? -mul : 0;
    });
  }, [rows, sortBy, dir]);

  const switchSort = (k: string) => {
    if (sortBy !== k) { setSortBy(k); setDir('desc'); }
    else setDir((d) => (d === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="tableWrapPro">
      <table className="table tableSticky">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th key={c.key} className={c.align === 'left' ? 'text-left' : 'text-right'}>
                <button className="thBtn" onClick={() => switchSort(c.key as string)}>
                  {c.label}{c.key !== 'name' && (
                    <span className={`sortArrow ${sortBy === c.key ? (dir === 'asc' ? 'sortAsc' : 'sortDesc') : ''}`} />
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              {COLS.map((c) => {
                const raw: any = (r as any)[c.key as any];
                const text = c.key === 'budget' ? `${fmt(raw, 0)} ${currency}` : (c.fmt ? c.fmt(raw) : raw);
                const cls = `tnum ${c.align === 'left' ? 'text-left' : 'text-right'}`;
                return <td key={String(c.key)} className={cls} style={c.align === 'left' ? { paddingLeft: 12 } : {}}>{text}</td>;
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="tnum text-right">{fmt(totals.budget || 0, 0)} {currency}</td>
            <td className="tnum text-right">{fmt(totals.impressions || 0, 0)}</td>
            <td className="tnum text-right">{fmt(totals.reach || 0, 0)}</td>
            <td className="tnum text-right">{fmt(totals.clicks || 0, 0)}</td>
            <td className="tnum text-right">{fmt(totals.leads || 0, 0)}</td>
            <td className="tnum text-right">{fmt((totals.CPL_total ?? totals.cpl ?? 0), 2)}</td>
            <td className="tnum text-right">{totals.views ? fmt(totals.views, 0) : '—'}</td>
            <td className="tnum text-right">{totals.engagements ? fmt(totals.engagements, 0) : '—'}</td>
            <td className="tnum text-right"></td>
            <td className="tnum text-right"></td>
            <td className="tnum text-right"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
