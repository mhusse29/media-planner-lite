import * as XLSX from 'xlsx';
import type { ExportPayload } from './index';

export async function exportXLSX(p: ExportPayload): Promise<Blob> {
  const wb = XLSX.utils.book_new();

  // Summary
  const head = ['Platform','Budget','Impr.','Reach','Clicks','Leads','CPL','Views','Eng.','CTR','CPC','CPM','Sales','CAC','Revenue'];
  const rows = p.rows.map(r=>[
    r.platform, r.budget, r.impressions, r.reach, r.clicks, r.leads,
    nullify(r.cpl), nullify(r.views), nullify(r.eng), nullify(r.ctr),
    nullify(r.cpc), nullify(r.cpm), nullify(r.sales), nullify(r.cac), nullify(r.revenue)
  ]);
  const ws = XLSX.utils.aoa_to_sheet([head, ...rows]);

  // Freeze header
  (ws['!freeze'] as any) = { rows: 1 };

  // Column formats
  const currFmt = `#,##0.00 "${p.currency}"`;
  const intCols = [2,3,4,5,7,8,12];
  const pctCol = 9;
  const moneyCols = [1,6,10,11,13,14];

  const range = XLSX.utils.decode_range(ws['!ref']!);
  for(let R=1; R<=range.e.r; R++){
    intCols.forEach(C => setFmt(ws, R, C, '#,##0'));
    setFmt(ws, R, pctCol, '0.0%');
    moneyCols.forEach(C => setFmt(ws, R, C, currFmt));
  }
  // Header bold + widths
  for(let C=0; C<head.length; C++) setBold(ws, 0, C);
  (ws['!cols'] as any) = [
    { wch:18 }, { wch:14 }, { wch:12 }, { wch:12 }, { wch:10 }, { wch:10 },
    { wch:10 }, { wch:10 }, { wch:10 }, { wch:8 }, { wch:10 }, { wch:10 }, { wch:8 }, { wch:10 }, { wch:12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Summary');

  // Assumptions
  const aRows = Object.entries(p.assumptions ?? {}).map(([k,v])=>[k, String(v)]);
  const ws2 = XLSX.utils.aoa_to_sheet([['Key','Value'], ...aRows]);
  (ws2['!cols'] as any) = [{wch:28},{wch:32}];
  boldCell(ws2,'A1'); boldCell(ws2,'B1');
  XLSX.utils.book_append_sheet(wb, ws2, 'Assumptions');

  const out = XLSX.write(wb, { bookType:'xlsx', type:'array' });
  return new Blob([out], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function addr(r:number,c:number){ return XLSX.utils.encode_cell({r,c}); }
function setFmt(ws: XLSX.WorkSheet, r:number,c:number, z:string){ const a = addr(r,c); (ws as any)[a] ??= { t:'n', v:null as any }; (ws as any)[a].z = z; }
function setBold(ws: XLSX.WorkSheet, r:number,c:number){ const a = addr(r,c); (ws as any)[a] ??= { t:'s', v:'' as any }; (ws as any)[a].s = { font:{ bold:true } }; }
function boldCell(ws: XLSX.WorkSheet, a:string){ (ws as any)[a] ??= { t:'s', v:'' as any }; (ws as any)[a].s = { font:{ bold:true } }; }
function nullify<T extends number|null|undefined>(v:T){ return (v==null || Number.isNaN(v)) ? null : v; }
