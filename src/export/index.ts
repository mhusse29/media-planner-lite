export type ExportPayload = {
  advertiser?: string;
  taxId?: string;
  currency: 'USD'|'EGP'|'AED'|'SAR'|'EUR';
  periodLabel: string;
  preparedAt: Date;
  statementId: string;
  totals: { budget:number; clicks:number; leads:number; roas:number };
  rows: Array<{
    platform: string;
    budget: number;
    impressions: number;
    reach: number;
    clicks: number;
    leads: number;
    cpl?: number|null;
    views?: number|null;
    eng?: number|null;
    ctr?: number|null;
    cpc?: number|null;
    cpm?: number|null;
    sales?: number|null;
    cac?: number|null;
    revenue?: number|null;
  }>;
  assumptions?: Record<string, number|string>;
}

export { exportPDF } from './pdf';
export { exportXLSX } from './xlsx';
export { exportCSV } from './csv';
