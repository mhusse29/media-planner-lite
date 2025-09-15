import type { ExportPayload } from './index';
import { fmtCurrency, fmtInt, fmtPct } from './fmt';

export async function exportCSV(p: ExportPayload): Promise<Blob> {
  const meta = [
    `# Advertising Spend Statement`,
    `# Advertiser, ${csvEsc(p.advertiser ?? 'Your Organization')}`,
    `# Tax ID, ${csvEsc(p.taxId ?? '')}`,
    `# Statement #, ${csvEsc(p.statementId)}`,
    `# Period, ${csvEsc(p.periodLabel)}`,
    `# Currency, ${p.currency}`,
    `# Prepared, ${new Date(p.preparedAt).toISOString()}`,
    `# Totals, Budget ${p.totals.budget}, Clicks ${p.totals.clicks}, Leads ${p.totals.leads}, ROAS ${p.totals.roas}`,
    `#`,
  ];
  const head = ['Platform','Budget','Impr.','Reach','Clicks','Leads','CPL','Views','Eng.','CTR','CPC','CPM','Sales','CAC','Revenue'];
  const lines = p.rows.map(r => [
    r.platform,
    fmtCurrency(r.budget, p.currency),
    fmtInt(r.impressions),
    fmtInt(r.reach),
    fmtInt(r.clicks),
    fmtInt(r.leads),
    fmtCurrency(r.cpl ?? null, p.currency),
    fmtInt(r.views ?? null),
    fmtInt(r.eng ?? null),
    fmtPct(r.ctr ?? null),
    fmtCurrency(r.cpc ?? null, p.currency),
    fmtCurrency(r.cpm ?? null, p.currency),
    fmtInt(r.sales ?? null),
    fmtCurrency(r.cac ?? null, p.currency),
    fmtCurrency(r.revenue ?? null, p.currency),
  ].map(csvEsc).join(','));

  const csv = [...meta, head.join(','), ...lines].join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8' });
}

function csvEsc(v: string){ return '"' + (v ?? '').replaceAll('"','""') + '"'; }
