import { SectionCard } from "./SectionCard";

type CPLs = Record<string, number>;

export function CostOverridesCard({
  selected, names, currency,
  manualCpl,
  cplMap, setCplMap
}:{
  selected: string[];
  names: Record<string,string>;
  currency: string;
  manualCpl: boolean;
  cplMap: CPLs; setCplMap: (v:CPLs)=>void;
}){
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
      {manualCpl && (
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
      )}
    </SectionCard>
  );
}
