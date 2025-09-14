import { useState } from 'react';
import { loadRates, saveRates, applyPegs, refreshRates, hostProvider, type Cur, type Rates } from '../lib/fx';

const CURS: Cur[] = ['USD','EGP','AED','SAR','SER','EUR'];

export function FxManager({ onClose }:{ current?: Cur; onClose:()=>void }){
  const [rates, setRates] = useState<Rates>(loadRates());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  const set = (c: Cur, v: string) => {
    const n = Number(v); setRates(r => ({ ...r, [c]: Number.isFinite(n) ? n : null }));
  };

  const usePegs = () => setRates(r => applyPegs(r));

  const useLive = async () => {
    setBusy(true); setMsg(null);
    try {
      const merged = await refreshRates(hostProvider, 0); // force refresh now
      setRates(merged); setMsg('Live FX applied.');
    } catch (e:any) {
      setMsg(e?.message || 'Could not fetch live FX.');
    } finally { setBusy(false); }
  };

  const save = ()=>{ saveRates(rates); onClose(); };

  return (
    <div className="sectionCard" role="dialog" aria-modal="true" aria-label="Manage FX">
      <div className="sectionHead">
        <div className="sectionTitle">
          <div className="eyebrow">Settings</div>
          <div className="sub">FX (units per 1 USD)</div>
        </div>
      </div>
      
      <div className="sectionBody">
        <div className="sub" style={{marginBottom:12}}>
          Your counts (impressions, clicks, leads) are computed in USD under the hood. Only money values are converted.
        </div>

        <div className="sectionActions" style={{gap:8, marginBottom:12, flexWrap:'wrap'}}>
          <button className="secBtn" onClick={usePegs}>Use market pegs (AED/SAR)</button>
          <button className="secBtn" disabled={busy} onClick={useLive}>
            {busy ? 'Fetching…' : 'Fetch live rates'}
          </button>
          {msg && <span style={{color:'#BDBDBD', marginLeft:8, fontSize:12}}>{msg}</span>}
        </div>

        <div className="grid2">
          {CURS.map(c=>(
            <div className="fieldRow" key={c}>
              <div className="fieldLabel">{c} per USD</div>
              <div className="pillInput">
                <input inputMode="decimal" value={rates[c] ?? ''} onChange={e=>set(c, e.target.value)} placeholder="e.g. 50"/>
              </div>
            </div>
          ))}
        </div>

        <div className="sectionActions" style={{justifyContent:'flex-end', marginTop:12}}>
          <button className="secBtn" onClick={onClose}>Cancel</button>
          <button className="secBtn primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
