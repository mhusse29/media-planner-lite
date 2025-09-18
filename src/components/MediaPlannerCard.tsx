import { useId } from 'react';
import type { Platform, Goal, Market, Currency } from '../lib/assumptions';
import { PLATFORM_LABELS } from '../lib/utils';
import SplitControlsRow from './SplitControlsRow';

type Props = {
  totalBudget: number;
  currency: Currency;
  market: Market;
  goal: Goal;
  niche: string;
  leadToSale: number;
  revenuePerSale: number;
  platforms: Platform[];
  selectedPlatforms: Platform[];
  mode: "auto"|"manual";
  includeAll: boolean;
  onTotalBudgetChange: (value: number) => void;
  onCurrencyChange: (value: Currency) => void;
  onMarketChange: (value: Market) => void;
  onGoalChange: (value: Goal) => void;
  onNicheChange: (value: string) => void;
  onLeadToSaleChange: (value: number) => void;
  onRevenuePerSaleChange: (value: number) => void;
  onPlatformToggle: (platform: Platform) => void;
  onModeChange: (mode: "auto"|"manual") => void;
  onIncludeAllChange: (value: boolean) => void;
  nicheOptions: string[];
};

export default function MediaPlannerCard(p: Props){
  const id = useId();
  const budgetId = `${id}-budget`;
  const currencyId = `${id}-currency`;
  const marketId = `${id}-market`;
  const nicheId = `${id}-niche`;
  const leadSaleId = `${id}-lead-sale`;
  const revenueId = `${id}-revenue`;
  const goalLabelId = `${id}-goal`;
  const platformsLabelId = `${id}-platforms`;

  const objectives: { value: Goal; label: string }[] = [
    { value: 'LEADS', label: 'Leads' },
    { value: 'TRAFFIC', label: 'Traffic' },
    { value: 'AWARENESS', label: 'Awareness' },
  ];

  const renderObjective = (objective: { value: Goal; label: string }) => {
    const active = p.goal === objective.value;
    return (
      <button
        key={objective.value}
        type="button"
        className={`planner-pill${active ? ' is-active' : ''}`}
        aria-pressed={active}
        onClick={() => p.onGoalChange(objective.value)}
      >
        {objective.label}
      </button>
    );
  };

  const platformChip = (platform: Platform) => {
    const active = p.selectedPlatforms.includes(platform);
    const label = PLATFORM_LABELS[platform] || platform;
    return (
      <button
        key={platform}
        type="button"
        className={`planner-chip${active ? ' is-active' : ''}`}
        aria-pressed={active}
        onClick={() => p.onPlatformToggle(platform)}
      >
        {label}
      </button>
    );
  };

  return (
    <section className="planner-card" aria-labelledby={`${id}-card-title`}>
      <div className="planner-tag" id={`${id}-card-title`}>
        Media planner
      </div>
      <div className="planner-card__content">
        <div>
          <div className="planner-tag">Campaign inputs</div>
          <label className="planner-field" htmlFor={budgetId}>
            <span className="planner-label">Total budget</span>
            <input
              id={budgetId}
              className="planner-input"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={p.totalBudget}
              onChange={(e) => p.onTotalBudgetChange(Number(e.target.value) || 0)}
              placeholder="Enter media spend only"
            />
            <span className="planner-hint">Media spend only; excludes management/design fees.</span>
          </label>

          <label className="planner-field" htmlFor={currencyId}>
            <span className="planner-label">Currency</span>
            <select
              id={currencyId}
              className="planner-select"
              value={p.currency}
              onChange={(e) => p.onCurrencyChange(e.target.value as Currency)}
            >
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>

        <div>
          <div className="planner-tag">Targeting</div>
          <label className="planner-field" htmlFor={marketId}>
            <span className="planner-label">Market</span>
            <select
              id={marketId}
              className="planner-select"
              value={p.market}
              onChange={(e) => p.onMarketChange(e.target.value as Market)}
            >
              <option value="Egypt">Egypt</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="UAE">UAE</option>
              <option value="Europe">Europe</option>
            </select>
          </label>

          <label className="planner-field" htmlFor={nicheId}>
            <span className="planner-label">Niche</span>
            <select
              id={nicheId}
              className="planner-select"
              value={p.niche}
              onChange={(e) => p.onNicheChange(e.target.value)}
            >
              {p.nicheOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="planner-hint">Auto-sets close rate & revenue per sale (editable).</span>
          </label>

          <label className="planner-field" htmlFor={leadSaleId}>
            <span className="planner-label">Lead→Sale %</span>
            <input
              id={leadSaleId}
              className="planner-input"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={1}
              value={p.leadToSale}
              onChange={(e) => p.onLeadToSaleChange(Number(e.target.value) || 0)}
            />
          </label>

          <label className="planner-field" htmlFor={revenueId}>
            <span className="planner-label">Revenue per sale</span>
            <input
              id={revenueId}
              className="planner-input"
              type="number"
              inputMode="decimal"
              min={0}
              step={50}
              value={p.revenuePerSale}
              onChange={(e) => p.onRevenuePerSaleChange(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <div>
          <div className="planner-tag" id={goalLabelId}>Objective</div>
          <div className="planner-objectives" role="group" aria-labelledby={goalLabelId}>
            {objectives.map(renderObjective)}
          </div>
          <span className="planner-hint">Adjusts auto budget split unless manual % is on.</span>
        </div>

        <div>
          <div className="planner-tag" id={platformsLabelId}>Platforms</div>
          <div className="planner-chips" role="group" aria-labelledby={platformsLabelId}>
            {p.platforms.map(platformChip)}
          </div>
        </div>

        <div>
          <div className="planner-tag">Live preview</div>
          <SplitControlsRow
            mode={p.mode}
            includeAll={p.includeAll}
            onChangeMode={p.onModeChange}
            onIncludeAllChange={p.onIncludeAllChange}
          />
        </div>
      </div>
    </section>
  );
}
