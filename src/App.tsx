import './styles/theme.css'
import './styles/charts.css'
import { useState, useEffect, useCallback, useMemo, useRef, type Dispatch, type SetStateAction } from 'react';
import { motion, useInView, useReducedMotion, cubicBezier } from 'framer-motion';
import type { Platform, Goal, Market, Currency } from './lib/assumptions';
import { NICHE_DEFAULTS } from './lib/assumptions';
import { calculateResults, calculateTotals } from './lib/math';
import { generateRecommendations } from './lib/recommendations';
// New export API
import type { ExportPayload } from './export';
import type { AppState } from './lib/storage';
import { saveState, loadState } from './lib/storage';
import { Download, Settings, Sparkles, Target, Globe2 } from 'lucide-react';
import { PLATFORM_LABELS, formatNumber, formatCurrency, cn } from './lib/utils';
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
import ChannelsSplitsCard from './components/ChannelsSplitsCard';
import { AnimatedCounter } from './components/ui/AnimatedCounter';
import { Card } from './components/ui/Card';

const ALL_PLATFORMS: Platform[] = ['FACEBOOK', 'INSTAGRAM', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'YOUTUBE', 'TIKTOK', 'LINKEDIN'];
const PLATFORM_NAME_MAP: Record<string, string> = Object.fromEntries(
  ALL_PLATFORMS.map((platform) => [platform, PLATFORM_LABELS[platform] || platform])
);
const GOAL_LABELS: Record<Goal, string> = {
  LEADS: 'Leads',
  TRAFFIC: 'Traffic',
  AWARENESS: 'Awareness',
};

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
  const [enforceMinEach, setEnforceMinEach] = useState(false);
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
      if (savedState.includeAll !== undefined) setEnforceMinEach(savedState.includeAll);
      if (savedState.manualCPL !== undefined) setManualCPL(savedState.manualCPL);
      if (savedState.platformCPLs !== undefined) setPlatformCPLs(savedState.platformCPLs);
    }
  }, []);

  // Keep mode in sync with manualSplit
  useEffect(() => setMode(manualSplit ? 'manual' : 'auto'), [manualSplit]);
  useEffect(() => setManualSplit(mode === 'manual'), [mode]);

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
    includeAll: manualSplit ? enforceMinEach : false,
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
    manualSplit ? enforceMinEach : false,
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
    includeAll: manualSplit ? enforceMinEach : false,
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
    manualSplit ? enforceMinEach : false,
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
  const includeAllMin10 = enforceMinEach;
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
    ? (manualSum === 100
      ? (includeAllMin10 ? 'Manual split (min 10%)' : 'Manual split')
      : `Manual split (normalized from ${Math.round(manualSum)}%)`)
    : 'Auto split';

  const goalLabel = GOAL_LABELS[goal] ?? goal;
  const heroBudgetValue = Number.isFinite(totals.budget) && (totals.budget ?? 0) > 0 ? totals.budget : totalBudget;
  const selectedPlatformLabels = selectedPlatforms.map((platform) => PLATFORM_LABELS[platform] || platform);
  const heroFeatures = [
    { icon: Sparkles, text: 'Guided channel splits tuned to your goal' },
    { icon: Target, text: 'Instant visibility into reach, clicks & leads' },
    { icon: Globe2, text: 'Multi-market planning with FX safeguards' },
  ];


  const barsData = results.map(r => ({
    name: PLATFORM_LABELS[r.platform] || r.platform,
    value: Math.round(r.impressions || 0),
    platform: r.platform,
  }));

  return (
    <div className="min-h-screen appBg">
      {/* Header */}
      <header className="appbar">
        <div className="container navWrap">
          <div className="brand">
            <span className="brandMark">MPL</span>
            <div className="brandCopy">
              <p className="brandName">Media Plan Lite</p>
              <p className="brandSub">Modern media planning workspace</p>
            </div>
          </div>
          <div className="navActions">
            <button
              onClick={() => setShowFx(true)}
              className="btn btn-ghost"
              title="Review or update exchange rates"
            >
              <Settings size={16} />
              <span>Manage FX</span>
            </button>
            <div className="exportWrap">
              <button
                onClick={()=> setExportOpen(v=>!v)}
                disabled={results.length === 0 || isExporting}
                className="btn btn-primary"
                aria-haspopup="menu"
                aria-expanded={exportOpen}
                aria-busy={isExporting}
              >
                <Download size={16} />
                {isExporting ? 'Exporting…' : 'Export'}
              </button>
              {exportOpen && (
                <div className="exportMenu" role="dialog" aria-modal="true">
                  <div className="exportMenu__group">
                    <label className="exportMenu__label">
                      <span>Filename</span>
                      <input className="exportMenu__input" value={exportName} onChange={e=>setExportName(e.target.value)} />
                    </label>
                    <label className="exportMenu__label">
                      <span>Paper (PDF)</span>
                      <select className="exportMenu__input" value={exportPaper} onChange={e=>setExportPaper(e.target.value as any)}>
                        <option value="a4">A4</option>
                        <option value="letter">Letter</option>
                      </select>
                    </label>
                    <label className="exportMenu__checkbox">
                      <input
                        type="checkbox"
                        checked={includeAssumptions}
                        onChange={e=>setIncludeAssumptions(e.target.checked)}
                      />
                      <span>Include assumptions (XLSX)</span>
                    </label>
                  </div>
                  <div className="exportMenu__actions">
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
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-badge">Media planning workspace</span>
              <h1 className="hero-title">Design full-funnel media plans in minutes.</h1>
              <p className="hero-sub">Set your assumptions, guide the mix, and export polished reports without leaving the dashboard.</p>
              <ul className="hero-list">
                {heroFeatures.map(({ icon: Icon, text }) => (
                  <li key={text}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <div className="hero-meta">
                <span className="hero-chip">Market: {market}</span>
                <span className="hero-chip">Goal: {goalLabel}</span>
                <span className="hero-chip">Niche: {niche}</span>
              </div>
            </div>
            <div className="hero-highlight">
              <span className="hero-highlight__badge">Live plan snapshot</span>
              <div className="hero-highlight__metric">
                <span className="hero-highlight__label">Active budget</span>
                <AnimatedCounter
                  value={Number.isFinite(heroBudgetValue) ? heroBudgetValue : 0}
                  formatter={(value) => formatCurrency(value, currency)}
                  className="hero-highlight__value"
                />
              </div>
              <div className="hero-highlight__row">
                <span className="hero-highlight__label">Channels in play</span>
                <div className="hero-platforms">
                  {selectedPlatformLabels.length > 0 ? (
                    selectedPlatformLabels.map((name) => (
                      <span key={name} className="hero-platforms__chip">{name}</span>
                    ))
                  ) : (
                    <span className="hero-platforms__chip muted">No platforms selected</span>
                  )}
                </div>
              </div>
              <div className="hero-highlight__row">
                <span className="hero-highlight__label">Lead → sale</span>
                <p className="hero-highlight__text">{leadToSalePercent}% close rate</p>
              </div>
              <div className="hero-highlight__row">
                <span className="hero-highlight__label">Revenue per sale</span>
                <p className="hero-highlight__text">{formatCurrency(revenuePerSale, currency)}</p>
              </div>
            </div>
          </div>
        </section>
        <motion.section
          ref={plannerRef}
          className="planner-shell"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="planner-grid" variants={gridVariants}>
            <motion.div className="planner-copy" variants={itemVariants}>
              <KpiCards
                totals={totals}
                currency={currency}
                manualCpl={manualCPL}
                onManualCplChange={setManualCPL}
              />
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
                onTotalBudgetChange={setTotalBudget}
                onCurrencyChange={setCurrency}
                onMarketChange={setMarket}
                onGoalChange={setGoal}
                onNicheChange={handleNicheChange}
                onLeadToSaleChange={setLeadToSalePercent}
                onRevenuePerSaleChange={setRevenuePerSale}
                nicheOptions={Object.keys(NICHE_DEFAULTS)}
              />
              <ChannelsSplitsCard
                platforms={ALL_PLATFORMS}
                selectedPlatforms={selectedPlatforms}
                platformWeights={platformWeights}
                setPlatformWeights={setPlatformWeights}
                mode={mode}
                onModeChange={setMode}
                enforceMinEach={enforceMinEach}
                onEnforceMinEachChange={setEnforceMinEach}
                onPlatformToggle={(platform) => {
                  setSelectedPlatforms((prev) => {
                    if (prev.includes(platform)) {
                      return prev.filter((p) => p !== platform);
                    }
                    return [...prev, platform];
                  });
                }}
                currency={currency}
                manualCpl={manualCPL}
                platformCPLs={platformCPLs}
                setPlatformCPLs={setPlatformCPLs}
              />
            </motion.div>
          </motion.div>
        </motion.section>

        <section id="results-section" className="section">
          <div className="container flex flex-col gap-8">
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
function KpiCards({
  totals,
  currency,
  manualCpl,
  onManualCplChange,
}: {
  totals: any;
  currency: string;
  manualCpl: boolean;
  onManualCplChange: Dispatch<SetStateAction<boolean>> | ((value: boolean) => void);
}) {
  const budget = typeof totals?.budget === 'number' ? totals.budget : null;
  const reach = typeof totals?.reach === 'number' ? totals.reach : null;
  const cpl = typeof totals?.cpl === 'number' ? totals.cpl : null;
  const roas = typeof totals?.roas === 'number' ? totals.roas : null;
  const autoEnabled = !manualCpl;

  const metrics = [
    {
      key: 'budget',
      label: 'Budget',
      value: budget,
      formatter: (value: number) => formatCurrency(value, currency),
      dotClass: 'kpi-dot--accent',
    },
    {
      key: 'reach',
      label: 'Reach',
      value: reach,
      formatter: (value: number) => formatNumber(value),
      dotClass: 'kpi-dot--reach',
    },
    {
      key: 'cpl',
      label: 'Efficiency (CPL)',
      value: cpl,
      formatter: (value: number) => formatCurrency(value, currency),
      dotClass: 'kpi-dot--efficiency',
    },
    {
      key: 'roas',
      label: 'Confidence (ROAS)',
      value: roas,
      formatter: (value: number) => `${value.toFixed(2)}x`,
      dotClass: 'kpi-dot--confidence',
    },
  ];

  const helperCopy = manualCpl
    ? 'Manual CPL per platform enabled. Adjust overrides below.'
    : 'Uses model defaults. Toggle to override per-platform CPL.';

  return (
    <Card className="kpi-panel">
      <header>
        <span className="planner-tag">KPI Summary</span>
      </header>

      <div className="kpi-status">
        <div className="kpi-status__text">
          <span className="kpi-status__title">Auto CPL</span>
          <span className="kpi-status__sub">{helperCopy}</span>
        </div>
        <div className="kpi-status__control">
          <label className="switch" role="switch" aria-checked={autoEnabled}>
            <span className="sr-only">Toggle manual CPL per platform</span>
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={(event) => onManualCplChange(!event.target.checked)}
            />
            <span className="slider" aria-hidden="true" />
          </label>
          <span className="kpi-status__state" aria-live="polite">
            {autoEnabled ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      <div className="kpi-list">
        {metrics.map((metric) => (
          <div key={metric.key} className="kpi-row">
            <div className="kpi-label">
              <span className={cn('kpi-dot', metric.dotClass)} aria-hidden="true" />
              <span>{metric.label}</span>
            </div>
            <AnimatedCounter
              value={metric.value}
              formatter={metric.formatter as (value: number) => string}
              className="kpi-value"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}


export default App;
