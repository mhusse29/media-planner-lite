import type { FC } from 'react';
import { formatCurrency, formatNumber } from '../lib/utils';

export type KpiCardsProps = {
  totals: {
    budget: number;
    clicks: number;
    leads: number;
    roas?: number | null;
  };
  currency: string;
};

export const KpiCards: FC<KpiCardsProps> = ({ totals, currency }) => (
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
        <div className="kpiValue">{Number.isFinite(totals?.roas) ? `${totals.roas?.toFixed(2)}x` : '—'}</div>
      </div>
    </div>
  </div>
);

export default KpiCards;

