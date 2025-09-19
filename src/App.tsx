import './styles/theme.css'
import './styles/charts.css'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion, cubicBezier } from 'framer-motion';
import type { Platform, Goal, Market, Currency } from './lib/assumptions';
import { NICHE_DEFAULTS } from './lib/assumptions';
import { calculateResults, calculateTotals } from './lib/math';
import { generateRecommendations } from './lib/recommendations';
// New export API
import type { ExportPayload } from './export';
import type { AppState } from './lib/storage';
import { saveState, loadState } from './lib/storage';
import { Download, Settings } from 'lucide-react';
import { PLATFORM_LABELS, formatNumber, formatCurrency } from './lib/utils';
import { BudgetDonutPro, ImpressionsBarsPro } from './components/ChartsPro';
import ResultsByPlatformCard from './components/ResultsByPlatformCard';
import ColumnsDialog from './components/ColumnsDialog';
import type { ColumnDef } from './components/ColumnsDialog';
import RecommendationsCard from './components/RecommendationsCard';
import { fmt, isFiniteNumber } from './utils/format';
import { deriveDisplayWeights } from './utils/split';
import { AllocationCard } from './components/AllocationCard';
import { CostOverridesCard } from './components/CostOverridesCard';
import { FxManager } from './components/FxManager';
import { hasRate } from './lib/fx';
import MediaPlannerCard from './components/MediaPlannerCard';
import { AnimatedCounter } from './components/ui/AnimatedCounter';

const ALL_PLATFORMS: Platform[] = ['FACEBOOK', 'INSTAGRAM', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'YOUTUBE', 'TIKTOK', 'LINKEDIN'];
const PLATFORM_NAME_MAP: Record<string, string> = Object.fromEntries(
  ALL_PLATFORMS.map((platform) => [platform, PLATFORM_LABELS[platform] || platform])
);

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
      if (savedState.totalBudget !== undefined) setTotalBudget(savedState.totalBudget);
      if (savedState.currency !== undefined) setCurrency(savedState.currency);
      if (savedState.market !== undefined) setMarket(savedState.market);
      if (savedState.goal !== undefined) setGoal(savedState.goal);
      if (savedState.niche !== undefined) setNiche(savedState.niche);
      if (savedState.leadToSalePercent !== undefined) setLeadToSalePercent(savedState.leadToSalePercent);
      if (savedState.revenuePerSale !== undefined) setRevenuePerSale(savedState.revenuePerSale);
      if (savedState.selectedPlatforms !== undefined) setSelectedPlatforms(savedState.selectedPlatforms);
      if (savedState.manualSplit !== undefined) setManualSplit(savedState.manualSplit);
      if (savedState.platformWeights !== undefined) setPlatformWeights(savedState.platformWeights);
      if (savedState.includeAll !== undefined) setIncludeAll(savedState.includeAll);
      if (savedState.manualCPL !== undefined) setManualCPL(savedState.manualCPL);
      if (savedState.platformCPLs !== undefined) setPlatformCPLs(savedState.platformCPLs);
    }
  }, []);

  // Keep mode in sync with manualSplit
  useEffect(() => setMode(manualSplit ? 'manual' : 'auto'), [manualSplit]);
  useEffect(() => setManualSplit(mode === 'manual'), [mode]);

  // When entering manual, auto helper must be off for clarity
  useEffect(() => {
    if (mode === 'manual' && includeAll) setIncludeAll(false);
  }, [mode, includeAll]);

  const persistedState = useMemo<AppState>(() => ({
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
  }), [
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

  // Save state on changes (debounced to avoid excessive persistence churn)
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveState(persistedState);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [persistedState]);

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
  const platformNames = useMemo(() => {
    const map: Record<string, string> = { ...PLATFORM_NAME_MAP };
    selectedPlatforms.forEach((platform) => {
      if (!map[platform]) {
        map[platform] = PLATFORM_LABELS[platform] || platform;
      }
    });
    return map;
  }, [selectedPlatforms]);

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

  const fxOk = hasRate(currency as any);
  const prefersReducedMotion = useReducedMotion();
  const plannerRef = useRef<HTMLElement | null>(null);
  const plannerInView = useInView(plannerRef, { margin: '-25% 0px -25% 0px' });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('planner-in', plannerInView);
    return () => document.body.classList.remove('planner-in');
  }, [plannerInView]);

  const baseEase = useMemo(() => cubicBezier(0.4, 0, 0.2, 1), []);
  const baseTransition = useMemo(() => ({ duration: 0.28, ease: baseEase }), [baseEase]);

  const heroVariants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0, transition: baseTransition },
  }), [prefersReducedMotion, baseTransition]);

  const gridVariants = useMemo(() => (
    prefersReducedMotion
      ? { hidden: {}, visible: {} }
      : { hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } } }
  ), [prefersReducedMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0, transition: baseTransition },
  }), [prefersReducedMotion, baseTransition]);

  const scrollToSection = useCallback((id: string) => {
    if (typeof document === 'undefined') return;
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToResults = useCallback(() => scrollToSection('results-section'), [scrollToSection]);
  const scrollToAdvanced = useCallback(() => scrollToSection('advanced-planner'), [scrollToSection]);

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
    views: isFiniteNumber(r.views) ? fmt(r.views, 0) : "—",
    eng: isFiniteNumber(r.engagements) ? fmt(r.engagements, 0) : "—",
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
    views: isFiniteNumber(totals.views) ? fmt(totals.views, 0) : "—",
    eng: isFiniteNumber(totals.engagements) ? fmt(totals.engagements, 0) : "—",
    ctr: "—",
    cpc: "—",
    cpm: "—",
    roas: isFiniteNumber(totals.roas) ? `${fmt(totals.roas, 2)}x` : "—",
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
              <button
                onClick={() => setShowFx(true)}
                className="btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Review or update exchange rates"
              >
                <Settings size={14} />
                <span>Manage FX</span>
              </button>
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

      <main className="pb-24">
        <motion.section
          ref={plannerRef}
          className="planner-shell"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="planner-grid" variants={gridVariants}>
            <motion.div className="planner-copy" variants={itemVariants}>
              <span className="planner-tag">Live preview</span>
              <h2 className="planner-heading">Plan a sample campaign</h2>
              <p className="planner-subcopy">
                Tune budgets, objectives, and assumptions to watch cross-channel performance update instantly.
              </p>
              <p className="planner-note">
                Numbers refresh in real time as you edit inputs. Scroll for full results or jump into advanced controls.
              </p>
              <div className="planner-cta">
                <motion.button
                  type="button"
                  className="planner-btn planner-btn-primary"
                  onClick={scrollToResults}
                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                >
                  See full results →
                </motion.button>
                <motion.button
                  type="button"
                  className="planner-btn planner-link"
                  onClick={scrollToAdvanced}
                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                >
                  Open advanced planner →
                </motion.button>
              </div>
            </motion.div>
            <motion.div className="planner-card-wrap" variants={itemVariants}>
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
            </motion.div>
          </motion.div>
        </motion.section>

        <section id="results-section" className="section">
          <div className="container flex flex-col gap-8">
            {results.length > 0 && (
              <div className="max-w-3xl">
                <KpiCards totals={totals} currency={currency} />
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              <BudgetDonutPro
                data={donutData}
                centerValue={centerValue}
                centerLabel={centerLabel}
              />
              <ImpressionsBarsPro data={barsData} title="IMPRESSIONS" />
            </div>
            {results.length > 0 && (
              <ResultsByPlatformCard
                rows={rowsFmt}
                totals={totalsFmt}
                showInlineKpis={false}
                columns={cols}
                onOpenColumns={() => setColumnsOpen(true)}
              />
            )}
            {results.length > 0 && recommendations.length > 0 && (
              <RecommendationsCard
                items={recommendations.map(rec => `${PLATFORM_LABELS[rec.platform]}: ${rec.text}`)}
              />
            )}
          </div>
        </section>

        <section id="advanced-planner" className="section">
          <div className="container flex flex-col gap-6">
            <div className="space-y-2">
              <span className="planner-tag">Advanced planner</span>
              <h2 className="text-2xl font-semibold text-white">Fine-tune allocations & assumptions</h2>
              <p className="planner-note">
                Switch to manual splits, override CPL assumptions, and manage FX in one place.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <AllocationCard
                selected={selectedPlatforms as unknown as string[]}
                names={platformNames}
                mode={mode}
                pctMap={selectedPlatforms.reduce((acc, p)=>{ acc[p]= Math.max(0, platformWeights[p]??0); return acc; }, {} as Record<string,number>)}
                setPctMap={(next)=>{
                  const updated = { ...platformWeights } as Record<Platform, number>;
                  (Object.keys(next) as string[]).forEach(k=>{ updated[k as Platform] = Math.max(0, Number((next as any)[k])||0); });
                  setPlatformWeights(updated);
                }}
              />
              <CostOverridesCard
                selected={selectedPlatforms as unknown as string[]}
                names={platformNames}
                currency={currency}
                manualCpl={manualCPL}
                setManualCpl={setManualCPL}
                cplMap={platformCPLs as unknown as Record<string, number>}
                setCplMap={(next)=> setPlatformCPLs(next as Record<Platform, number>)}
              />
            </div>
            {!fxOk && (
              <div className="rowCard warn">
                <div>
                  <div className="title">FX rate missing for {currency}.</div>
                  <div className="sub">We'll assume your CPM/CPC/CPL are already in {currency}. Set a rate to normalize math.</div>
                </div>
                <button className="secBtn" onClick={()=>setShowFx(true)}>Manage FX</button>
              </div>
            )}
          </div>
        </section>
      </main>

      {showFx && <FxManager current={currency as any} onClose={()=>setShowFx(false)} />}

      <ColumnsDialog
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        cols={cols}
        setCols={setCols}
      />
    </div>
  );
}


// KPI Cards Component
function KpiCards({ totals, currency }: { totals: any; currency: string }) {
  const budget = typeof totals?.budget === 'number' ? totals.budget : null;
  const reach = typeof totals?.reach === 'number' ? totals.reach : null;
  const cpl = typeof totals?.cpl === 'number' ? totals.cpl : null;
  const roas = typeof totals?.roas === 'number' ? totals.roas : null;

  return (
    <section className="kpi-panel">
      <div className="planner-tag">KPI summary</div>
      <div className="kpi-list">
        <div className="kpi-row">
          <div className="kpi-label">
            <span className="kpi-dot kpi-dot--accent" />
            <span>Budget</span>
          </div>
          <AnimatedCounter
            value={budget}
            formatter={(value) => formatCurrency(value, currency)}
            className="kpi-value"
          />
        </div>
        <div className="kpi-row">
          <div className="kpi-label">
            <span className="kpi-dot kpi-dot--reach" />
            <span>Reach</span>
          </div>
          <AnimatedCounter
            value={reach}
            formatter={(value) => formatNumber(value)}
            className="kpi-value"
          />
        </div>
        <div className="kpi-row">
          <div className="kpi-label">
            <span className="kpi-dot kpi-dot--efficiency" />
            <span>Efficiency (CPL)</span>
          </div>
          <AnimatedCounter
            value={cpl}
            formatter={(value) => formatCurrency(value, currency)}
            className="kpi-value"
          />
        </div>
        <div className="kpi-row">
          <div className="kpi-label">
            <span className="kpi-dot kpi-dot--confidence" />
            <span>Confidence (ROAS)</span>
          </div>
          <AnimatedCounter
            value={roas}
            formatter={(value) => `${value.toFixed(2)}x`}
            className="kpi-value"
          />
        </div>
      </div>
    </section>
  );
}


export default App;
