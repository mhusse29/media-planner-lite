import type { PlatformResult } from './math';

export function generateCSV(results: PlatformResult[], totals: any): string {
  const headers = [
    'Platform',
    'Budget',
    'Impressions',
    'Clicks',
    'CTR %',
    'CPC',
    'CPM',
    'Leads',
    'CPL',
    'Sales',
    'CAC',
    'Revenue',
    'ROAS'
  ];

  const rows = results.map(r => {
    const roas = r.budget > 0 ? r.revenue / r.budget : 0;
    return [
      r.platform,
      r.budget.toFixed(2),
      Math.round(r.impressions).toString(),
      Math.round(r.clicks).toString(),
      (r.ctr * 100).toFixed(2),
      r.cpc.toFixed(2),
      r.cpm.toFixed(2),
      Math.round(r.leads).toString(),
      r.cpl.toFixed(2),
      r.sales.toFixed(1),
      r.cac.toFixed(2),
      r.revenue.toFixed(2),
      roas.toFixed(2)
    ];
  });

  // Add totals row
  rows.push([
    'TOTAL',
    totals.budget.toFixed(2),
    Math.round(totals.impressions).toString(),
    Math.round(totals.clicks).toString(),
    (totals.ctr * 100).toFixed(2),
    totals.cpc.toFixed(2),
    totals.cpm.toFixed(2),
    Math.round(totals.leads).toString(),
    totals.cpl.toFixed(2),
    totals.sales.toFixed(1),
    totals.cac.toFixed(2),
    totals.revenue.toFixed(2),
    totals.roas.toFixed(2)
  ]);

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string = 'media-plan.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
