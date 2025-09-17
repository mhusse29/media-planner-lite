import './styles/theme.css';
import './styles/charts.css';
import { useCallback, useMemo, useState } from 'react';
import type { Platform } from './lib/assumptions';
import { NICHE_DEFAULTS } from './lib/assumptions';
import { PLATFORM_LABELS } from './lib/utils';
import { BudgetDonutPro, ImpressionsBarsPro } from './components/ChartsPro';
import ResultsByPlatformCard from './components/ResultsByPlatformCard';
import ColumnsDialog from './components/ColumnsDialog';
import type { ColumnDef } from './components/ColumnsDialog';
import RecommendationsCard from './components/RecommendationsCard';
import { AllocationCard } from './components/AllocationCard';
import { CostOverridesCard } from './components/CostOverridesCard';
import { FxManager } from './components/FxManager';
import { hasRate, type Cur } from './lib/fx';
import MediaPlannerCard from './components/MediaPlannerCard';
import PlannerHeader from './components/PlannerHeader';
import FxWarning from './components/FxWarning';
import KpiCards from './components/KpiCards';
import { usePlannerState } from './hooks/usePlannerState';
import { usePlannerDerivedData } from './hooks/usePlannerDerivedData';
import { useExportManager } from './hooks/useExportManager';

const ALL_PLATFORMS: Platform[] = [
  'FACEBOOK',
  'INSTAGRAM',
  'GOOGLE_SEARCH',
  'GOOGLE_DISPLAY',
  'YOUTUBE',
  'TIKTOK',
  'LINKEDIN',
];

const PLATFORM_NAME_MAP: Record<string, string> = Object.fromEntries(
  ALL_PLATFORMS.map((platform) => [platform, PLATFORM_LABELS[platform] || platform])
);

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'budget', label: 'Budget', visible: true },
  { key: 'impr', label: 'Impr.', visible: true },
  { key: 'reach', label: 'Reach', visible: true },
  { key: 'clicks', label: 'Clicks', visible: true },
  { key: 'leads', label: 'Leads', visible: true },
  { key: 'cpl', label: 'CPL', visible: true },
  { key: 'views', label: 'Views', visible: true },
  { key: 'eng', label: 'Eng.', visible: true },
  { key: 'ctr', label: 'CTR', visible: true },
  { key: 'cpc', label: 'CPC', visible: true },
  { key: 'cpm', label: 'CPM', visible: true },
];

function App() {
  const planner = usePlannerState();
  const derived = usePlannerDerivedData(planner);
  const exportManager = useExportManager({
    state: planner,
    totals: derived.totals,
    results: derived.results,
  });

  const [showFx, setShowFx] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [cols, setCols] = useState<ColumnDef[]>(DEFAULT_COLUMNS);

  const {
    totalBudget,
    currency,
    market,
    goal,
    niche,
    leadToSalePercent,
    revenuePerSale,
    selectedPlatforms,
    mode,
    includeAll,
    platformWeights,
    platformCPLs,
    manualCPL,
    setTotalBudget,
    setCurrency,
    setMarket,
    setGoal,
    handleNicheChange,
    setLeadToSalePercent,
    setRevenuePerSale,
    togglePlatform,
    setMode,
    setIncludeAll,
    updatePlatformWeights,
    setManualCPL,
    setPlatformCPLs,
  } = planner;

  const selectedNames = useMemo(
    () =>
      selectedPlatforms.reduce((acc, platform) => {
        acc[platform] = derived.platformNames[platform] || PLATFORM_NAME_MAP[platform] || platform;
        return acc;
      }, {} as Record<string, string>),
    [derived.platformNames, selectedPlatforms]
  );

  const pctMap = useMemo(
    () =>
      selectedPlatforms.reduce((acc, platform) => {
        acc[platform] = Math.max(0, platformWeights[platform] ?? 0);
        return acc;
      }, {} as Record<string, number>),
    [platformWeights, selectedPlatforms]
  );

  const cplMap = useMemo(
    () =>
      selectedPlatforms.reduce((acc, platform) => {
        const value = platformCPLs[platform];
        if (typeof value === 'number') acc[platform] = value;
        return acc;
      }, {} as Record<string, number>),
    [platformCPLs, selectedPlatforms]
  );

  const handleSetCplMap = useCallback(
    (next: Record<string, number>) => {
      const updated = {} as Record<Platform, number>;
      Object.entries(next).forEach(([key, value]) => {
        updated[key as Platform] = Math.max(0, Number(value) || 0);
      });
      setPlatformCPLs(updated);
    },
    [setPlatformCPLs]
  );

  const fxOk = hasRate(currency as Cur);

  return (
    <div className="min-h-screen appBg">
      <PlannerHeader onOpenFx={() => setShowFx(true)} exportControls={exportManager} />

      <main className="container section">
        <div className="section grid md:grid-cols-[1.1fr_1fr] gap-5">
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
            onPlatformToggle={togglePlatform}
            onModeChange={setMode}
            onIncludeAllChange={setIncludeAll}
            nicheOptions={Object.keys(NICHE_DEFAULTS)}
          />

          {!fxOk && <FxWarning currency={currency} onManageFx={() => setShowFx(true)} />}

          {showFx && <FxManager current={currency} onClose={() => setShowFx(false)} />}

          <AllocationCard
            selected={selectedPlatforms}
            names={selectedNames}
            mode={mode}
            pctMap={pctMap}
            setPctMap={updatePlatformWeights}
          />

          <CostOverridesCard
            selected={selectedPlatforms}
            names={selectedNames}
            currency={currency}
            manualCpl={manualCPL}
            setManualCpl={setManualCPL}
            cplMap={cplMap}
            setCplMap={handleSetCplMap}
          />

          <div className="chart-stack">
            <BudgetDonutPro data={derived.donutData} centerValue={derived.centerValue} centerLabel={derived.centerLabel} />
            <ImpressionsBarsPro data={derived.barsData} title="IMPRESSIONS" />
          </div>
        </div>

        {derived.results.length > 0 && <KpiCards totals={derived.totals} currency={currency} />}

        {derived.results.length > 0 && (
          <ResultsByPlatformCard rows={derived.rowsFmt} totals={derived.totalsFmt} showInlineKpis={false} columns={cols} onOpenColumns={() => setColumnsOpen(true)} />
        )}

        {derived.results.length > 0 && derived.recommendations.length > 0 && (
          <RecommendationsCard
            items={derived.recommendations.map((rec) => `${PLATFORM_LABELS[rec.platform]}: ${rec.text}`)}
          />
        )}

        <ColumnsDialog open={columnsOpen} onClose={() => setColumnsOpen(false)} cols={cols} setCols={setCols} />
      </main>
    </div>
  );
}

export default App;

