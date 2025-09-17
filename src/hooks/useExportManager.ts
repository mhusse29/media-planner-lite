import { useCallback, useMemo, useState } from 'react';
import type { ExportPayload } from '../export';
import { PLATFORM_LABELS } from '../lib/utils';
import type { PlannerState } from './usePlannerState';
import type { PlatformResult } from '../lib/math';
import type { ReturnTypeOfCalculateTotals } from './types';

const sanitizeFilename = (name: string) => {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '-');
  const normalized = cleaned.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return normalized;
};

type ExportFormat = 'pdf' | 'xlsx' | 'csv';

type ExportManagerArgs = {
  state: PlannerState;
  totals: ReturnTypeOfCalculateTotals;
  results: PlatformResult[];
};

type ExportManagerApi = {
  exportOpen: boolean;
  toggleExport: () => void;
  closeExport: () => void;
  exportPaper: 'a4' | 'letter';
  setExportPaper: (value: 'a4' | 'letter') => void;
  exportName: string;
  setExportName: (value: string) => void;
  includeAssumptions: boolean;
  setIncludeAssumptions: (value: boolean) => void;
  isExporting: boolean;
  canExport: boolean;
  runExport: (format: ExportFormat) => Promise<void>;
};

export const useExportManager = ({ state, totals, results }: ExportManagerArgs): ExportManagerApi => {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPaper, setExportPaper] = useState<'a4' | 'letter'>('a4');
  const [exportName, setExportName] = useState(`media-plan-${new Date().toISOString().slice(0, 10)}`);
  const [includeAssumptions, setIncludeAssumptions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const canExport = useMemo(() => results.length > 0, [results.length]);

  const closeExport = useCallback(() => setExportOpen(false), []);
  const toggleExport = useCallback(() => setExportOpen((open) => !open), []);

  const runExport = useCallback(
    async (fmt: ExportFormat) => {
      if (isExporting || !canExport) return;
      setIsExporting(true);
      let objectUrl: string | undefined;

      try {
        const payload: ExportPayload = {
          advertiser: 'Your Organization',
          taxId: undefined,
          currency: state.currency as ExportPayload['currency'],
          periodLabel: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          preparedAt: new Date(),
          statementId: `MPL-${Date.now()}`,
          totals: {
            budget: totals.budget,
            clicks: totals.clicks,
            leads: totals.leads,
            roas: totals.roas || 0,
          },
          rows: results.map((r) => ({
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
          assumptions: includeAssumptions
            ? {
                market: state.market,
                goal: state.goal,
                niche: state.niche,
                currency: state.currency,
              }
            : undefined,
        };

        let blob: Blob;
        if (fmt === 'pdf') blob = await (await import('../export/pdf')).exportPDF(payload);
        else if (fmt === 'xlsx') blob = await (await import('../export/xlsx')).exportXLSX(payload);
        else blob = await (await import('../export/csv')).exportCSV(payload);

        const ext = fmt === 'pdf' ? 'pdf' : fmt === 'xlsx' ? 'xlsx' : 'csv';
        const safeName = sanitizeFilename(exportName) || `media-plan-${new Date().toISOString().slice(0, 10)}`;
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
        setIsExporting(false);
        closeExport();
      }
    },
    [canExport, closeExport, exportName, includeAssumptions, isExporting, results, state, totals]
  );

  return {
    exportOpen,
    toggleExport,
    closeExport,
    exportPaper,
    setExportPaper,
    exportName,
    setExportName,
    includeAssumptions,
    setIncludeAssumptions,
    isExporting,
    canExport,
    runExport,
  };
};

