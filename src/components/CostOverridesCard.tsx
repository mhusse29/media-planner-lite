import { SectionCard } from "./SectionCard";

type CPLs = Record<string, number>;

export function CostOverridesCard({
  selected, names, currency,
  manualCpl,
  onManualCplChange,
  cplMap, setCplMap
}:{
  selected: string[];
  names: Record<string,string>;
  currency: string;
  manualCpl: boolean;
  onManualCplChange?: (value: boolean) => void;
  cplMap: CPLs; setCplMap: (v:CPLs)=>void;
}){
  // Conflict resolution:
  // - Base branch handled the Manual CPL toggle inside this card alongside the override inputs.
  // - Feature branch moved the toggle into the KPI summary so the controls share the glass KPI styling.
  // We keep the KPI entry point while still offering a local enable action so keyboard users that land here
  // can discover the override without scrolling back up.
  const setVal=(k:string,v:number)=> setCplMap({...cplMap,[k]:Math.max(0,v||0)});
  const clear=()=>{ const n:CPLs={}; selected.forEach(k=>n[k]=0); setCplMap(n); };

  const actions = manualCpl ? (
    <button className="secBtn" onClick={clear}>Clear</button>
  ) : null;

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
        <div className="rowCard" role="note">
          <div>
            <div className="title">Auto CPL is ON</div>
            <div className="sub">Use the KPI summary toggle to activate per-platform overrides when you need them.</div>
          </div>
          {onManualCplChange && (
            <button className="secBtn" onClick={()=>onManualCplChange(true)}>Enable manual CPL</button>
          )}
        </div>
      )}
    </SectionCard>
  );
}
