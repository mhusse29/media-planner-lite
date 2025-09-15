import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fmtCurrency, fmtInt, fmtPct, fmtNumber2 } from './fmt';
import type { ExportPayload } from './index';

export async function exportPDF(p: ExportPayload): Promise<Blob> {
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  const W = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor('#111315'); doc.rect(40, 64, W-80, 64, 'F');
  doc.setTextColor('#FFFFFF'); doc.setFontSize(18); doc.text('Advertising Spend Statement', 56, 100);
  doc.setFontSize(10);
  doc.text([
    `Advertiser: ${p.advertiser ?? 'Your Organization'}`,
    `Tax ID: ${p.taxId ?? '—'}`,
    `Statement #: ${p.statementId}`
  ], 56, 120);
  const right = [
    `Period: ${p.periodLabel}`,
    `Currency: ${p.currency}`,
    `Prepared: ${new Date(p.preparedAt).toLocaleString()}  •  By: Media Plan Lite`
  ];
  right.forEach((t,i)=> doc.text(t, W-56-doc.getTextWidth(t), 120 + i*12));

  // KPI cards
  const kpis = [
    ['Total Budget', fmtCurrency(p.totals.budget, p.currency)],
    ['Total Clicks', fmtInt(p.totals.clicks)],
    ['Total Leads', fmtInt(p.totals.leads)],
    ['ROAS', `${fmtNumber2(p.totals.roas)}x`],
  ];
  const gap = 24;
  const cardW = (W-80 - gap*3)/4, cardY = 152, cardH = 58;
  kpis.forEach((k,ix)=>{
    const x = 40 + ix*(cardW+gap);
    doc.setDrawColor('#E5E7EB'); doc.setFillColor('#F9FAFB'); (doc as any).roundedRect?.(x, cardY, cardW, cardH, 6,6,'FD') || doc.rect(x, cardY, cardW, cardH, 'FD');
    doc.setTextColor('#6B7280'); doc.setFontSize(10); doc.text(k[0], x+12, cardY+20);
    doc.setTextColor('#0F172A'); doc.setFontSize(14); doc.text(k[1], x+12, cardY+40);
  });

  // Table
  const head = [['Platform','Budget','Impr.','Reach','Clicks','Leads','CPL','Views','Eng.','CTR','CPC','CPM','Sales','CAC','Revenue']];
  const body = p.rows.map(r=>[
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
  ]);
  const startY = cardY + cardH + 24;
  autoTable(doc, {
    startY,
    head,
    body,
    styles: { fontSize:10, halign:'right', cellPadding:6, lineColor:'#E5E7EB', lineWidth:0.5, textColor:'#0F172A' },
    headStyles: { fillColor:'#111315', textColor:'#FFFFFF', halign:'center' },
    alternateRowStyles: { fillColor:'#F4F6F8' },
    columnStyles: { 0:{ halign:'left' } },
    didDrawPage: ()=>{
      doc.setFontSize(8); doc.setTextColor('#6B7280');
      const footer = `Prepared automatically by Media Plan Lite • ${new Date(p.preparedAt).toLocaleString()} • Statement #${p.statementId}`;
      doc.text(footer, 40, doc.internal.pageSize.getHeight()-24);
    }
  });

  return doc.output('blob');
}
