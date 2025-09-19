import { useId } from 'react';
import { Info } from 'lucide-react';
import type { Goal, Market, Currency } from '../lib/assumptions';
import { Card, microTitleClass } from './ui/Card';
import { Tooltip } from './ui/Tooltip';

const helperPillClass =
  'inline-flex h-8 items-center rounded-full bg-surface-3/70 px-3 text-xs font-medium text-white/70 ring-1 ring-white/10';
const fieldLabelClass = 'text-xs font-semibold uppercase tracking-[0.12em] text-white/60';
const inputClass =
  'h-10 w-full rounded-xl bg-surface-3/70 px-3 text-sm text-white/80 ring-1 ring-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';
const hintClass = 'text-xs text-white/50';

const OBJECTIVES: { value: Goal; label: string }[] = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'AWARENESS', label: 'Awareness' },
];

type Props = {
  totalBudget: number;
  currency: Currency;
  market: Market;
  goal: Goal;
  niche: string;
  leadToSale: number;
  revenuePerSale: number;
  onTotalBudgetChange: (value: number) => void;
  onCurrencyChange: (value: Currency) => void;
  onMarketChange: (value: Market) => void;
  onGoalChange: (value: Goal) => void;
  onNicheChange: (value: string) => void;
  onLeadToSaleChange: (value: number) => void;
  onRevenuePerSaleChange: (value: number) => void;
  nicheOptions: string[];
};

export default function MediaPlannerCard({
  totalBudget,
  currency,
  market,
  goal,
  niche,
  leadToSale,
  revenuePerSale,
  onTotalBudgetChange,
  onCurrencyChange,
  onMarketChange,
  onGoalChange,
  onNicheChange,
  onLeadToSaleChange,
  onRevenuePerSaleChange,
  nicheOptions,
}: Props) {
  const id = useId();
  const budgetId = `${id}-budget`;
  const currencyId = `${id}-currency`;
  const marketId = `${id}-market`;
  const nicheId = `${id}-niche`;
  const leadSaleId = `${id}-lead-sale`;
  const revenueId = `${id}-revenue`;
  const goalLabelId = `${id}-goal`;

  return (
    <Card aria-labelledby={`${id}-card-title`}>
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className={microTitleClass} id={`${id}-card-title`}>
            Media Planner
          </span>
          <p className="text-[13px] text-white/70">Budget, market, goal, currency.</p>
        </div>
        <Tooltip content="Set budget, currency, market, and goal. Powers planner & AI prompts.">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 ring-1 ring-white/10 transition hover:text-white/80 hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            aria-label="Media planner help"
          >
            <Info className="h-4 w-4" />
          </button>
        </Tooltip>
      </header>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {['Budget', 'Currency', 'Market', 'Goal'].map((pill) => (
          <span key={pill} className={helperPillClass}>
            {pill}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <label className="flex flex-col gap-2" htmlFor={budgetId}>
            <span className={fieldLabelClass}>Total budget</span>
            <input
              id={budgetId}
              className={inputClass}
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={Number.isFinite(totalBudget) ? totalBudget : 0}
              onChange={(event) => onTotalBudgetChange(Number(event.target.value) || 0)}
              placeholder="Enter media spend only"
            />
            <span className={hintClass}>Media spend only; excludes management/design fees.</span>
          </label>

          <label className="flex flex-col gap-2" htmlFor={currencyId}>
            <span className={fieldLabelClass}>Currency</span>
            <select
              id={currencyId}
              className={inputClass}
              value={currency}
              onChange={(event) => onCurrencyChange(event.target.value as Currency)}
            >
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>

        <div className="space-y-4">
          <label className="flex flex-col gap-2" htmlFor={marketId}>
            <span className={fieldLabelClass}>Market</span>
            <select
              id={marketId}
              className={inputClass}
              value={market}
              onChange={(event) => onMarketChange(event.target.value as Market)}
            >
              <option value="Egypt">Egypt</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="UAE">UAE</option>
              <option value="Europe">Europe</option>
            </select>
          </label>

          <label className="flex flex-col gap-2" htmlFor={nicheId}>
            <span className={fieldLabelClass}>Niche</span>
            <select
              id={nicheId}
              className={inputClass}
              value={niche}
              onChange={(event) => onNicheChange(event.target.value)}
            >
              {nicheOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className={hintClass}>Auto-sets close rate & revenue per sale (editable).</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2" htmlFor={leadSaleId}>
          <span className={fieldLabelClass}>Lead→Sale %</span>
          <input
            id={leadSaleId}
            className={inputClass}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={1}
            value={Number.isFinite(leadToSale) ? leadToSale : 0}
            onChange={(event) => onLeadToSaleChange(Number(event.target.value) || 0)}
          />
        </label>

        <label className="flex flex-col gap-2" htmlFor={revenueId}>
          <span className={fieldLabelClass}>Revenue per sale</span>
          <input
            id={revenueId}
            className={inputClass}
            type="number"
            inputMode="decimal"
            min={0}
            step={50}
            value={Number.isFinite(revenuePerSale) ? revenuePerSale : 0}
            onChange={(event) => onRevenuePerSaleChange(Number(event.target.value) || 0)}
          />
        </label>
      </div>

      <div className="space-y-3" role="group" aria-labelledby={goalLabelId}>
        <span className={fieldLabelClass} id={goalLabelId}>
          Objective
        </span>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {OBJECTIVES.map((objective) => {
            const active = goal === objective.value;
            return (
              <button
                key={objective.value}
                type="button"
                className={`${helperPillClass} ${active ? 'bg-brand/10 text-brand-100 ring-brand/30' : ''}`}
                aria-pressed={active}
                onClick={() => onGoalChange(objective.value)}
              >
                {objective.label}
              </button>
            );
          })}
        </div>
        <span className={hintClass}>Adjusts auto budget split unless manual % is on.</span>
      </div>
    </Card>
  );
}
