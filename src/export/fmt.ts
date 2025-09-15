export function fmtCurrency(v:number|null|undefined, code:'USD'|'EGP'|'AED'|'SAR'|'EUR'){
  if(v==null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en', { style:'currency', currency:code, minimumFractionDigits:2, maximumFractionDigits:2 }).format(v);
}
export function fmtInt(v:number|null|undefined){
  if(v==null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en', { maximumFractionDigits:0 }).format(Math.round(v));
}
export function fmtNumber2(v:number|null|undefined){
  if(v==null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(v);
}
export function fmtPct(v:number|null|undefined){
  if(v==null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en', { style:'percent', minimumFractionDigits:1, maximumFractionDigits:1 }).format(v);
}
export function safe(v:number|null|undefined){ return (v==null || Number.isNaN(v)) ? '—' : v; }
