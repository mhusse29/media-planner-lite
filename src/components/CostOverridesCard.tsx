import { SectionCard } from "./SectionCard";

type CPLs = Record<string, number>;

export function CostOverridesCard({
  selected, names, currency,
  manualCpl, setManualCpl,
  cplMap, setCplMap
}:{
  selected: string[];
  names: Record<string,string>;
  currency: string;
  manualCpl: boolean; setManualCpl: (v:boolean)=>void;
  cplMap: CPLs; setCplMap: (v:CPLs)=>void;
}){
  const setVal=(k:string,v:number)=> setCplMap({...cplMap,[k]:Math.max(0,v||0)});
  const clear=()=>{ const n:CPLs={}; selected.forEach(k=>n[k]=0); setCplMap(n); };

  const actions = (
    <>
      <label className="switch" style={{marginRight:8}} title="Enable manual CPL per platform">
        <input type="checkbox" checked={manualCpl} onChange={e=>setManualCpl(e.target.checked)} />
        <span className="slider" />
      </label>
      {manualCpl && <button className="secBtn" onClick={clear}>Clear</button>}
    </>
  );

  return (
    <SectionCard
      eyebrow="Cost Overrides"
      title={manualCpl ? "Manual CPL per platform" : "Auto CPL"}
      sub={manualCpl ? "Override lead cost per platform" : "Use model defaults"}
      actions={actions}
    >
      {manualCpl ? (
        <div className="grid2">
          {selected.map(k=>(
            <div className="fieldRow" key={k}>
              <div className="fieldLabel">{names[k] || k}</div>
              <div className="pillInput">
                <span className="pillSuf">{currency}</span>
                <input type="number" min={0} value={cplMap[k] ?? 0} onChange={e=>setVal(k, Number(e.target.value))}/>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rowCard">
          <div>
            <div className="title">Auto CPL is ON</div>
            <div className="sub">Turn on manual CPL to override per-platform cost of lead.</div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
