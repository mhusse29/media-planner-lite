import './styles/theme.css'
import './styles/charts.css'
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Platform, Goal, Market, Currency } from './lib/assumptions';
import { NICHE_DEFAULTS } from './lib/assumptions';
import { calculateResults, calculateTotals } from './lib/math';
import { generateRecommendations } from './lib/recommendations';
// New export API
import type { ExportPayload } from './export';
import type { AppState } from './lib/storage';
import { saveState, loadState } from './lib/storage';
import { Download } from 'lucide-react';
import { PLATFORM_LABELS, formatNumber, formatCurrency } from './lib/utils';
import { BudgetDonutPro, ImpressionsBarsPro } from './components/ChartsPro';
import ResultsByPlatformCard from './components/ResultsByPlatformCard';
import ColumnsDialog from './components/ColumnsDialog';
import type { ColumnDef } from './components/ColumnsDialog';
import RecommendationsCard from './components/RecommendationsCard';
import { fmt } from './utils/format';
import { deriveDisplayWeights } from './utils/split';
import { AllocationCard } from './components/AllocationCard';
import { FxManager } from './components/FxManager';
import { hasRate } from './lib/fx';
import MediaPlannerCard from './components/MediaPlannerCard';

const sanitizeFilename = (name: string) => {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '-');
  const normalized = cleaned.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return normalized;
};

function App() {
  // State management (keeping all existing state)
  const [totalBudget, setTotalBudget] = useState(10000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [market, setMarket] = useState<Market>('Egypt');
  const [goal, setGoal] = useState<Goal>('LEADS');
  const [niche, setNiche] = useState('Generic');
  const [leadToSalePercent, setLeadToSalePercent] = useState(20);
  const [revenuePerSale, setRevenuePerSale] = useState(800);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['FACEBOOK', 'GOOGLE_SEARCH']);
  const [manualSplit, setManualSplit] = useState(false);
  const [platformWeights, setPlatformWeights] = useState<Record<Platform, number>>({} as any);
  const [includeAll, setIncludeAll] = useState(false);
  const [manualCPL, setManualCPL] = useState(false);
  const [platformCPLs, setPlatformCPLs] = useState<Record<Platform, number>>({} as any);
  const [mode, setMode] = useState<'auto'|'manual'>(manualSplit ? 'manual' : 'auto');
  const [showFx, setShowFx] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [cols, setCols] = useState<ColumnDef[]>([
    { key:"budget", label:"Budget", visible:true },
    { key:"impr", label:"Impr.", visible:true },
    { key:"reach", label:"Reach", visible:true },
    { key:"clicks", label:"Clicks", visible:true },
    { key:"leads", label:"Leads", visible:true },
    { key:"cpl", label:"CPL", visible:true },
    { key:"views", label:"Views", visible:true },
    { key:"eng", label:"Eng.", visible:true },
    { key:"ctr", label:"CTR", visible:true },
    { key:"cpc", label:"CPC", visible:true },
    { key:"cpm", label:"CPM", visible:true },
  ]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      if (savedState.totalBudget) setTotalBudget(savedState.totalBudget);
      if (savedState.currency) setCurrency(savedState.currency);
      if (savedState.market) setMarket(savedState.market);
      if (savedState.goal) setGoal(savedState.goal);
      if (savedState.niche) setNiche(savedState.niche);
      if (savedState.leadToSalePercent) setLeadToSalePercent(savedState.leadToSalePercent);
      if (savedState.revenuePerSale) setRevenuePerSale(savedState.revenuePerSale);
      if (savedState.selectedPlatforms) setSelectedPlatforms(savedState.selectedPlatforms);
      if (savedState.manualSplit !== undefined) setManualSplit(savedState.manualSplit);
      if (savedState.platformWeights) setPlatformWeights(savedState.platformWeights);
      if (savedState.includeAll !== undefined) setIncludeAll(savedState.includeAll);
      if (savedState.manualCPL !== undefined) setManualCPL(savedState.manualCPL);
      if (savedState.platformCPLs) setPlatformCPLs(savedState.platformCPLs);
    }
  }, []);

  // Keep mode in sync with manualSplit
  useEffect(() => setMode(manualSplit ? 'manual' : 'auto'), [manualSplit]);
  useEffect(() => setManualSplit(mode === 'manual'), [mode]);

  // When entering manual, auto helper must be off for clarity
  useEffect(() => {
    if (mode === 'manual' && includeAll) setIncludeAll(false);
  }, [mode, includeAll]);

  // Save state on changes
  useEffect(() => {
    const state: AppState = {
      totalBudget,
      currency,
      market,
      goal,
      niche,
      leadToSalePercent,
      revenuePerSale,
      selectedPlatforms,
      manualSplit,
      platformWeights,
      includeAll,
      manualCPL,
      platformCPLs
    };
    saveState(state);
  }, [
    totalBudget,
    currency,
    market,
    goal,
    niche,
    leadToSalePercent,
    revenuePerSale,
    selectedPlatforms,
    manualSplit,
    platformWeights,
    includeAll,
    manualCPL,
    platformCPLs
  ]);

  // Handle niche change
  const handleNicheChange = useCallback((newNiche: string) => {
    setNiche(newNiche);
    const defaults = NICHE_DEFAULTS[newNiche];
    if (defaults) {
      setLeadToSalePercent(defaults.l2s);
      setRevenuePerSale(defaults.rev);
    }
  }, []);

  // Calculate results
  const results = useMemo(() => calculateResults({
    totalBudget,
    selectedPlatforms,
    goal,
    market,
    leadToSalePercent,
    revenuePerSale,
    manualSplit,
    platformWeights,
    includeAll,
    manualCPL,
    platformCPLs
  }), [
    totalBudget,
    selectedPlatforms,
    goal,
    market,
    leadToSalePercent,
    revenuePerSale,
    manualSplit,
    platformWeights,
    includeAll,
    manualCPL,
    platformCPLs
  ]);

  const totals = useMemo(() => calculateTotals(results), [results]);
  const recommendations = useMemo(() => generateRecommendations(results), [results]);

  // Export CSV
  // Professional export menu
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPaper, setExportPaper] = useState<'a4'|'letter'>('a4');
  const [exportName, setExportName] = useState(`media-plan-${new Date().toISOString().slice(0,10)}`);
  const [includeAssumptions, setIncludeAssumptions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const runExport = async (fmt: 'pdf'|'xlsx'|'csv') => {
    if (isExporting) return;
    setIsExporting(true);
    let objectUrl: string | undefined;
    try {
      const payload: ExportPayload = {
        advertiser: 'Your Organization',
        taxId: undefined,
        currency: currency as any,
        periodLabel: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
        preparedAt: new Date(),
        statementId: `MPL-${Date.now()}`,
        totals: { budget: totals.budget, clicks: totals.clicks, leads: totals.leads, roas: totals.roas || 0 },
        rows: results.map(r => ({
          platform: PLATFORM_LABELS[r.platform] || r.platform,
          budget: r.budget,
          impressions: r.impressions,
          reach: r.reach,
          clicks: r.clicks,
          leads: r.leads,
          cpl: r.cpl ?? null,
          views: r.views ?? null,
          eng: r.engagements ?? null,
          ctr: r.ctr ?? null,
          cpc: r.cpc ?? null,
          cpm: r.cpm ?? null,
          sales: r.sales ?? null,
          cac: r.cac ?? null,
          revenue: r.revenue ?? null,
        })),
        assumptions: includeAssumptions ? { market, goal, niche, currency } : undefined,
      };
      let blob: Blob;
      if (fmt === 'pdf') blob = await (await import('./export/pdf')).exportPDF(payload);
      else if (fmt === 'xlsx') blob = await (await import('./export/xlsx')).exportXLSX(payload);
      else blob = await (await import('./export/csv')).exportCSV(payload);
      const ext = fmt === 'pdf' ? 'pdf' : (fmt === 'xlsx' ? 'xlsx' : 'csv');
      const safeName = sanitizeFilename(exportName) || `media-plan-${new Date().toISOString().slice(0,10)}`;
      const link = typeof document !== 'undefined' ? document.createElement('a') : null;
      if (!link) return;
      objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${safeName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export', err);
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Sorry, something went wrong while exporting. Please try again.');
      }
    } finally {
      if (objectUrl) {
        const url = objectUrl;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setExportOpen(false);
      setIsExporting(false);
    }
  };

  const ALL_PLATFORMS: Platform[] = ['FACEBOOK', 'INSTAGRAM', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'YOUTUBE', 'TIKTOK', 'LINKEDIN'];
  const fxOk = hasRate(currency as any);

  // Prepare data for charts and table
  const rowsFmt = results.map(r => ({
    platform: r.platform,
    name: PLATFORM_LABELS[r.platform] || r.platform,
    budget: `${fmt(r.budget, 0)} ${currency}`,
    impr: fmt(r.impressions, 0),
    reach: fmt(r.reach, 0),
    clicks: fmt(r.clicks, 0),
    leads: fmt(r.leads, 0),
    cpl: fmt(r.cpl, 2),
    views: r.views ? fmt(r.views, 0) : "—",
    eng: r.engagements ? fmt(r.engagements, 0) : "—",
    ctr: `${fmt(r.ctr * 100, 2)}%`,
    cpc: fmt(r.cpc, 2),
    cpm: fmt(r.cpm, 2),
  }));

  const totalsFmt = {
    budget: `${fmt(totals.budget, 0)} ${currency}`,
    impr: fmt(totals.impressions, 0),
    reach: fmt(totals.reach, 0),
    clicks: fmt(totals.clicks, 0),
    leads: fmt(totals.leads, 0),
    cpl: fmt(totals.cpl, 2),
    views: totals.views ? fmt(totals.views, 0) : "—",
    eng: totals.engagements ? fmt(totals.engagements, 0) : "—",
    ctr: "—",
    cpc: "—",
    cpm: "—",
    roas: totals.roas ? `${fmt(totals.roas, 2)}x` : "—",
  };

  // Charts data (Budget Split)
  const selected = selectedPlatforms;
  const manualOn = manualSplit;
  const includeAllMin10 = includeAll;
  const manualPct: Record<string, number> = selected.reduce((acc, p) => {
    acc[p] = Math.max(0, platformWeights[p as Platform] ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const autoWeights: Record<string, number> = selected.reduce((acc, p) => {
    const r = results.find(x => x.platform === p);
    acc[p] = Math.max(0, (r as any)?.weight ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const { weights: displayWeights, manualSum } = deriveDisplayWeights(
    selected as unknown as string[],
    manualOn,
    manualPct,
    autoWeights,
    includeAllMin10
  );

  const donutData = selected.map((p) => ({
    name: PLATFORM_LABELS[p] || p,
    value: Math.round((displayWeights[p] ?? 0) * 100),
    platform: p,
  })).filter(d => d.value > 0 || selected.length === 1);

  const centerValue = `${fmt(totals.budget || 0, 0)} ${currency}`;
  const centerLabel = manualOn
    ? (manualSum === 100 ? 'Manual split' : `Manual split (normalized from ${Math.round(manualSum)}%)`)
    : (includeAllMin10 ? 'Auto split (≥10% each)' : 'Auto split');


  const barsData = results.map(r => ({
    name: PLATFORM_LABELS[r.platform] || r.platform,
    value: Math.round(r.impressions || 0),
    platform: r.platform,
  }));

  return (
    <div className="min-h-screen appBg">
      {/* Header */}
      <header className="appbar">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="h1">Media Plan Lite</h1>
            <div className="flex items-center gap-2">
              <div style={{ position:'relative' }}>
                <button
                  onClick={()=> setExportOpen(v=>!v)}
                  disabled={results.length === 0 || isExporting}
                  className="btn primary"
                  aria-haspopup="menu"
                  aria-expanded={exportOpen}
                  aria-busy={isExporting}
                >
                  <Download size={14} />
                  {isExporting ? 'Exporting…' : 'Export'}
                </button>
                {exportOpen && (
                  <div role="dialog" aria-modal="true" style={{ position:'absolute', right:0, marginTop:8, background:'#16171A', border:'1px solid var(--border)', borderRadius:12, padding:12, minWidth:260, zIndex:30 }}>
                    <div style={{ display:'grid', gap:8 }}>
                      <div>
                        <div className="label">Filename</div>
                        <input className="input" value={exportName} onChange={e=>setExportName(e.target.value)} />
                      </div>
                      <div>
                        <div className="label">Paper (PDF)</div>
                        <select className="select" value={exportPaper} onChange={e=>setExportPaper(e.target.value as any)}>
                          <option value="a4">A4</option>
                          <option value="letter">Letter</option>
                        </select>
                      </div>
                      <label className="chip" style={{ justifyContent:'space-between' }}>
                        Include assumptions (XLSX)
                        <input type="checkbox" checked={includeAssumptions} onChange={e=>setIncludeAssumptions(e.target.checked)} />
                      </label>
                      <div style={{ display:'grid', gap:6 }}>
                        <button className="secBtn" onClick={()=>runExport('pdf')} disabled={isExporting}>
                          {isExporting ? 'Exporting…' : 'Export PDF'}
                        </button>
                        <button className="secBtn" onClick={()=>runExport('xlsx')} disabled={isExporting}>
                          {isExporting ? 'Exporting…' : 'Export XLSX'}
                        </button>
                        <button className="secBtn" onClick={()=>runExport('csv')} disabled={isExporting}>
                          {isExporting ? 'Exporting…' : 'Export CSV'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container section">

        {/* Main Content Grid */}
        <div className="section grid md:grid-cols-[1.1fr_1fr] gap-5">
          {/* Planner Panel */}
          <MediaPlannerCard
            totalBudget={totalBudget}
            currency={currency}
            market={market}
            goal={goal}
            niche={niche}
            leadToSale={leadToSalePercent}
            revenuePerSale={revenuePerSale}
            platforms={ALL_PLATFORMS}
            selectedPlatforms={selectedPlatforms}
            mode={mode}
            includeAll={includeAll}
            onTotalBudgetChange={setTotalBudget}
            onCurrencyChange={setCurrency}
            onMarketChange={setMarket}
            onGoalChange={setGoal}
            onNicheChange={handleNicheChange}
            onLeadToSaleChange={setLeadToSalePercent}
            onRevenuePerSaleChange={setRevenuePerSale}
            onPlatformToggle={(platform) => {
              if (selectedPlatforms.includes(platform)) {
                setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
              } else {
                setSelectedPlatforms([...selectedPlatforms, platform]);
              }
            }}
            onModeChange={setMode}
            onIncludeAllChange={setIncludeAll}
            nicheOptions={Object.keys(NICHE_DEFAULTS)}
          />

          {/* FX Warning */}
          {!fxOk && (
            <div className="rowCard warn" style={{marginTop:8}}>
      <div>
                <div className="title">FX rate missing for {currency}.</div>
                <div className="sub">We'll assume your CPM/CPC/CPL are already in {currency}. Set a rate to normalize math.</div>
              </div>
              <button className="secBtn" onClick={()=>setShowFx(true)}>Manage FX</button>
            </div>
          )}

          {/* FX Manager Modal */}
          {showFx && <FxManager current={currency as any} onClose={()=>setShowFx(false)} />}

          {/* Platform Allocation Card */}
          <AllocationCard
            selected={selectedPlatforms as unknown as string[]}
            names={Object.fromEntries((['FACEBOOK','INSTAGRAM','GOOGLE_SEARCH','GOOGLE_DISPLAY','YOUTUBE','TIKTOK','LINKEDIN'] as const).map(p=>[p, PLATFORM_LABELS[p as Platform]])) as any}
            mode={mode}
            pctMap={selectedPlatforms.reduce((acc, p)=>{ acc[p]= Math.max(0, platformWeights[p]??0); return acc; }, {} as Record<string,number>)}
            setPctMap={(next)=>{
              const updated = { ...platformWeights } as Record<Platform, number>;
              (Object.keys(next) as string[]).forEach(k=>{ updated[k as Platform] = Math.max(0, Number((next as any)[k])||0); });
              setPlatformWeights(updated);
            }}
          />

          {/* Charts Panel */}
          <div className="chart-stack">
            <BudgetDonutPro
              data={donutData}
              centerValue={centerValue}
              centerLabel={centerLabel}
            />
            <ImpressionsBarsPro data={barsData} title="IMPRESSIONS" />
          </div>
        </div>

        {/* KPI Cards */}
        {results.length > 0 && (
          <KpiCards totals={totals} currency={currency} />
        )}

        {/* Results by Platform */}
        {results.length > 0 && (
          <ResultsByPlatformCard 
            rows={rowsFmt} 
            totals={totalsFmt} 
            showInlineKpis={false}
            columns={cols}
            onOpenColumns={() => setColumnsOpen(true)}
          />
        )}

        {/* Recommendations */}
        {results.length > 0 && recommendations.length > 0 && (
          <RecommendationsCard 
            items={recommendations.map(rec => `${PLATFORM_LABELS[rec.platform]}: ${rec.text}`)}
          />
        )}

      {/* Columns Dialog */}
      <ColumnsDialog
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        cols={cols}
        setCols={setCols}
      />
      </main>
    </div>
  );
}


// KPI Cards Component
function KpiCards({ totals, currency }: { totals: any; currency: string }) {
  return (
    <div className="kpiGroup">
      <div className="kpiGrid">
        <div className="kpiCell">
          <div className="kpiLabel">$ Total Budget</div>
          <div className="kpiValue">{formatCurrency(totals.budget, currency)}</div>
        </div>
        <div className="kpiCell">
          <div className="kpiLabel">⌖ Total Clicks</div>
          <div className="kpiValue">{formatNumber(totals.clicks)}</div>
        </div>
        <div className="kpiCell">
          <div className="kpiLabel">🎯 Total Leads</div>
          <div className="kpiValue">{formatNumber(totals.leads)}</div>
        </div>
        <div className="kpiCell">
          <div className="kpiLabel">📈 ROAS</div>
          <div className="kpiValue">{Number.isFinite(totals?.roas) ? `${totals.roas.toFixed(2)}x` : '—'}</div>
        </div>
      </div>
      </div>
  );
}



export default App;