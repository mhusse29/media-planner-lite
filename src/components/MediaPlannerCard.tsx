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
  const platformChip = (platform: Platform) => {
    const active = p.selectedPlatforms.includes(platform);
    const label = PLATFORM_LABELS[platform] || platform;
    return (
      <button
        key={platform}
        className={`mp-chip ${active ? "is-active" : ""}`}
        onClick={() => p.onPlatformToggle(platform)}
      >
        {label}
      </button>
    );
  };

  return (
    <section className="mp-card">
      <header className="mp-card__header">
        <h3 className="mp-title">Media Planner</h3>
        <div className="mp-badges">
          <span className="mp-hint">Platforms: {p.selectedPlatforms.length}</span>
        </div>
      </header>

      {/* Form grid */}
      <div className="mp-grid">
        <div className="mp-field mp-col-6">
          <div className="mp-label">Total Budget</div>
          <input
            className="mp-input"
            type="number"
            value={p.totalBudget}
            onChange={(e) => p.onTotalBudgetChange(Number(e.target.value) || 0)}
            placeholder="Enter media spend only"
            min="0"
            step="100"
          />
          <div className="mp-hint">Media spend only; excludes management/design fees.</div>
        </div>

        <div className="mp-field mp-col-6">
          <div className="mp-label">Currency</div>
          <select
            className="mp-select"
            value={p.currency}
            onChange={(e) => p.onCurrencyChange(e.target.value as Currency)}
          >
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="AED">AED</option>
            <option value="SER">SER</option>
            <option value="SAR">SAR</option>
            <option value="EUR">EUR</option>
          </select>
          {p.currency === 'SER' && (
            <div className="mp-hint" style={{color:'#F5B971'}}>
              Using SER→SAR unless FX set
            </div>
          )}
        </div>

        <div className="mp-field mp-col-6">
          <div className="mp-label">Market</div>
          <select
            className="mp-select"
            value={p.market}
            onChange={(e) => p.onMarketChange(e.target.value as Market)}
          >
            <option value="Egypt">Egypt</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="UAE">UAE</option>
            <option value="Europe">Europe</option>
          </select>
        </div>

        <div className="mp-field mp-col-6">
          <div className="mp-label">Goal</div>
          <select
            className="mp-select"
            value={p.goal}
            onChange={(e) => p.onGoalChange(e.target.value as Goal)}
          >
            <option value="LEADS">Leads</option>
            <option value="TRAFFIC">Traffic</option>
            <option value="AWARENESS">Awareness</option>
          </select>
          <div className="mp-hint">Changes auto budget split unless manual % is on.</div>
        </div>

        <div className="mp-field mp-col-6">
          <div className="mp-label">Niche</div>
          <select
            className="mp-select"
            value={p.niche}
            onChange={(e) => p.onNicheChange(e.target.value)}
          >
            {p.nicheOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="mp-hint">Auto-sets close-rate & revenue per sale (editable).</div>
        </div>

        <div className="mp-field mp-col-6">
          <div className="mp-label">Lead→Sale %</div>
          <input
            className="mp-input" 
            type="number" 
            min={0} 
            max={100}
            value={p.leadToSale}
            onChange={(e) => p.onLeadToSaleChange(Number(e.target.value) || 0)}
            step="1"
          />
        </div>

        <div className="mp-field mp-col-6">
          <div className="mp-label">Revenue per Sale</div>
          <input
            className="mp-input" 
            type="number" 
            min={0}
            value={p.revenuePerSale}
            onChange={(e) => p.onRevenuePerSaleChange(Number(e.target.value) || 0)}
            step="50"
          />
        </div>
      </div>

      {/* Platforms */}
      <div className="mp-field" style={{marginTop:"20px"}}>
        <div className="mp-label">Platforms</div>
        <div className="mp-chips">
          {p.platforms.map(platformChip)}
        </div>
      </div>

      {/* Split Controls Row */}
      <SplitControlsRow
        mode={p.mode}
        includeAll={p.includeAll}
        platformCount={p.selectedPlatforms.length}
        onChangeMode={p.onModeChange}
      />
    </section>
  );
}
