import { useMemo, useState } from 'react';
import { fmt, isFiniteNumber } from '../utils/format';
import { ResultsHeader } from '../components/ResultsHeader';

type Row = {
  platform?: string; name?: string;
  budget: number; impressions: number; reach: number; clicks: number; leads: number;
  CPL_eff: number; views?: number; engagements?: number; CTR_eff: number; CPC_eff: number; CPM_eff: number;
};

type Column = { key: keyof Row; label: string; align?: 'left'|'right'; lock?: boolean };

const BASE_COLS: Column[] = [
  { key: 'name', label: 'Platform', align: 'left', lock: true },
  { key: 'budget', label: 'Budget', align: 'right' },
  { key: 'impressions', label: 'Impr.', align: 'right' },
  { key: 'reach', label: 'Reach', align: 'right' },
  { key: 'clicks', label: 'Clicks', align: 'right' },
  { key: 'leads', label: 'Leads', align: 'right' },
  { key: 'CPL_eff', label: 'CPL', align: 'right' },
  { key: 'views', label: 'Views', align: 'right' },
  { key: 'engagements', label: 'Eng.', align: 'right' },
  { key: 'CTR_eff', label: 'CTR', align: 'right' },
  { key: 'CPC_eff', label: 'CPC', align: 'right' },
  { key: 'CPM_eff', label: 'CPM', align: 'right' },
];

export function ResultsTable({
  rows, totals, currency, totalBudget
}: { rows: Row[]; totals: any; currency: string; totalBudget: number }) {
  const [query,setQuery]=useState('');
  const [sortBy,setSortBy]=useState<string>('budget');
  const [dir,setDir]=useState<'asc'|'desc'>('desc');
  const [visible,setVisible]=useState<Record<string,boolean>>(()=>Object.fromEntries(BASE_COLS.map(c=>[c.key,true])));
  const [helpKey, setHelpKey] = useState<string | null>(null);

  const cols = BASE_COLS.filter(c=> (c.lock || visible[c.key as string]));

  const filtered = useMemo(()=>{
    const q=query.trim().toLowerCase();
    let arr = rows.map(r => ({...r, name: r.name || r.platform || ''}));
    if(q) arr = arr.filter(r => (r.name as string).toLowerCase().includes(q));
    return arr;
  },[rows,query]);

  const sorted = useMemo(()=>{
    const mul = dir==='asc'?1:-1;
    return [...filtered].sort((a:any,b:any)=>{
      const av=a[sortBy] ?? 0, bv=b[sortBy] ?? 0;
      return av>bv?mul:av<bv?-mul:0;
    });
  },[filtered,sortBy,dir,cols]);

  const budgetShare = (b:number)=> totalBudget>0 ? b/totalBudget : 0;

  const switchSort=(k:string)=>{ if(sortBy!==k){setSortBy(k);setDir('desc')} else setDir(d=>d==='desc'?'asc':'desc') };

  const derive = (r:any) => {
    const imp = Number(r.impressions) || 0;
    const clk = Number(r.clicks) || 0;
    const lds = Number(r.leads) || 0;
    const bud = Number(r.budget) || 0;

    const CTR = (r.CTR_eff ?? (imp > 0 ? clk / imp : null));
    const CPC = (r.CPC_eff ?? (clk > 0 ? bud / clk : null));
    const CPM = (r.CPM_eff ?? (imp > 0 ? (bud / imp) * 1000 : null));
    const CPL = (r.CPL_eff ?? (lds > 0 ? bud / lds : null));

    return { CTR, CPC, CPM, CPL };
  };

  const COL_HELP: Record<string,string> = {
    name: "Advertising platform/source.",
    budget: "Ad spend allocated to this platform (in your chosen currency).",
    impressions: "Total times ads were displayed.",
    reach: "Estimated unique people who saw an ad.",
    clicks: "Number of ad clicks.",
    leads: "Qualified leads captured (form submits, calls, etc.).",
    CPL_eff: "Cost per Lead = Spend ÷ Leads.",
    views: "Video views (platform-defined threshold, e.g., 3s/30s).",
    engagements: "Interactions (likes, comments, shares, saves, etc.).",
    CTR_eff: "Click-through Rate = Clicks ÷ Impressions.",
    CPC_eff: "Cost per Click = Spend ÷ Clicks.",
    CPM_eff: "Cost per 1,000 Impressions = Spend ÷ Impressions × 1,000.",
  };

  const helpLabel = helpKey ? ((cols.find(c=>c.key===helpKey as any)?.label) || helpKey) : null;
  const helpText  = helpKey ? (COL_HELP[helpKey] || '') : null;

  return (
    <div className={`stickyFirst`}>
      <ResultsHeader
        query={query} setQuery={setQuery}
        columns={BASE_COLS as any}
        visible={visible} setVisible={setVisible}
        helpKeyLabel={helpLabel} helpText={helpText}
      />

      <div className="tableWrapPro">
        <table className="table tableSticky">
          <thead onMouseLeave={()=> setHelpKey(null)}>
            <tr className="theadRow">
              {cols.map(c=>(
                <th key={c.key as string} className={(c.align??'right')==='left'?'text-left':'text-right'}>
                  <button
                    className={
                      'thChip ' +
                      (sortBy===c.key ? ('active ' + (dir==='asc' ? 'asc' : 'desc')) : '')
                    }
                    onClick={()=>switchSort(c.key as string)}
                    onMouseEnter={()=> setHelpKey(c.key as string)}
                    onFocus={()=> setHelpKey(c.key as string)}
                    aria-describedby="column-help"
                  >
                    {c.label}
                    {c.key!=='name' && <span className="arrow" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r,i)=>(
              <tr key={i}>
                {cols.map(c=>{
                  const raw:any = (r as any)[c.key as any];
                  let node: any = raw;

                  if(c.key==='budget'){
                    const share = budgetShare(r.budget);
                    node = (
                      <div className="progressCell">
                        <span className="badgeTiny">{fmt(r.budget,0)} {currency}</span>
                        <div className="progressBar"><div className="progressInner" style={{width:`${Math.min(100,Math.round(share*100))}%`}}/></div>
                      </div>
                    );
                  }
                  else if (c.key === 'CPL_eff') {
                    const { CPL } = derive(r);
                    node = CPL != null ? fmt(CPL, 2) : '—';
                  }
                  else if(c.key==='CTR_eff'){
                    const { CTR } = derive(r);
                    node = CTR != null ? <span className={`tag ${CTR < 0.01 ? 'warn' : CTR >= 0.02 ? 'good' : ''}`}>{fmt(CTR*100,2)}%</span> : '—';
                  }
                  else if(c.key==='CPC_eff'){
                    const { CPC } = derive(r);
                    node = CPC != null ? <span className={`tag ${(CPC||0) > 5 ? 'warn' : ''}`}>{fmt(CPC,2)}</span> : '—';
                  }
                  else if(c.key==='CPM_eff'){
                    const { CPM } = derive(r);
                    node = CPM != null ? fmt(CPM,2) : '—';
                  }
                  else if(c.key==='views' || c.key==='engagements' || c.key==='impressions' || c.key==='reach' || c.key==='clicks' || c.key==='leads'){
                    node = isFiniteNumber(raw) ? fmt(raw,0) : '—';
                  }
                  else if(c.key==='name'){
                    node = <span className="tnum">{r.name}</span>;
                  }

                  const cls = `tnum ${(c.align??'right')==='left'?'text-left':'text-right'}`;
                  return <td key={String(c.key)} className={cls}>{node}</td>;
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {cols.map(c=>{
                let v:any = '';
                if(c.key==='name') v='Total';
                else if(c.key==='budget') v=`${fmt(totals.budget||0,0)} {currency}`;
                else if(c.key==='impressions') v=fmt(totals.impressions||0,0);
                else if(c.key==='reach') v=fmt(totals.reach||0,0);
                else if(c.key==='clicks') v=fmt(totals.clicks||0,0);
                else if(c.key==='leads') v=fmt(totals.leads||0,0);
                else if(c.key==='CPL_eff') v=fmt(totals.CPL_total ?? 0,2);
                else if(c.key==='views') v= isFiniteNumber(totals.views) ? fmt(totals.views,0) : '—';
                else if(c.key==='engagements') v= isFiniteNumber(totals.engagements) ? fmt(totals.engagements,0) : '—';
                return <td key={String(c.key)} className={(c.align??'right')==='left'?'text-left':'text-right'}>{v}</td>;
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}


