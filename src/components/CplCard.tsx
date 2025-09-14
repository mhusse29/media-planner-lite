type CPLs = Record<string, number>;

export function CplCard({
  title = "Manual CPL per Platform",
  selected,
  manualCplOn, cplMap, setCplMap,
  names, currency
}:{
  title?: string;
  selected: string[];
  manualCplOn: boolean;
  cplMap: CPLs;
  setCplMap: (v:CPLs)=>void;
  names: Record<string,string>;
  currency: string;
}){
  const setVal = (k:string, v:number) => setCplMap({ ...cplMap, [k]: Math.max(0, v || 0) });
  const clear = () => { const next: CPLs = {}; selected.forEach(k => next[k]=0); setCplMap(next); };

  return (
    <div className="cardPro">
      <div className="cardHead">
        <div className="cardEyebrow">{title.toUpperCase()}</div>
        <div className="cardActions">
          <button className="cardBtn" onClick={clear} disabled={!selected.length}>Clear</button>
        </div>
      </div>

      <div className="cardBody">
        {manualCplOn ? (
          <div className="grid2">
            {selected.map(k => (
              <div className="fieldRow" key={k}>
                <div className="fieldLabel">{names[k] || k}</div>
                <div className="pillInput">
                  <span className="pillSuf">{currency}</span>
                  <input type="number" min={0} value={cplMap[k] ?? 0} onChange={(e)=> setVal(k, Number(e.target.value))}/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sumWrap">
            <div className="sumText">Auto CPL is ON. Turn on “Manual CPL per Platform” to override.</div>
          </div>
        )}
      </div>
    </div>
  );
}


