 

type Percents = Record<string, number>;

export function SplitCard({
  title = "Manual % split",
  selected,
  manualOn,
  manualPct, setManualPct,
  names
}:{
  title?: string;
  selected: string[];
  manualOn: boolean;
  manualPct: Percents; setManualPct: (v:Percents)=>void;
  names: Record<string,string>;
}){
  const sum = selected.reduce((s,k)=> s + Math.max(0, manualPct[k] ?? 0), 0);
  const setVal = (k:string, v:number) => setManualPct({ ...manualPct, [k]: Math.max(0, v || 0) });

  const equalize = () => {
    if (selected.length === 0) return;
    const each = Math.floor((100 / selected.length) * 100) / 100;
    const next: Percents = {};
    selected.forEach(k => next[k] = each);
    setManualPct(next);
  };
  const clear = () => {
    const next: Percents = {};
    selected.forEach(k => next[k] = 0);
    setManualPct(next);
  };

  return (
    <div className="cardPro">
      <div className="cardHead">
        <div className="cardEyebrow">{title.toUpperCase()}</div>
        <div className="cardActions">
          <button className="cardBtn" onClick={equalize} disabled={!selected.length}>Equal split</button>
          <button className="cardBtn" onClick={clear} disabled={!selected.length}>Clear</button>
        </div>
      </div>

      <div className="cardBody">
        {manualOn ? (
          <>
            <div className="grid2">
              {selected.map((k) => (
                <div className="fieldRow" key={k}>
                  <div className="fieldLabel">{names[k] || k}</div>
                  <div className="pillInput">
                    <input type="number" min={0} value={manualPct[k] ?? 0} onChange={(e)=> setVal(k, Number(e.target.value))}/>
                    <span className="pillSuf">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="sumWrap">
              <div className={`sumText ${sum===100?'ok':'warn'}`}>Sum: {sum.toFixed(2)}% {sum===100?'':'(will normalize)'}</div>
              <div className="sumBar"><div className="sumInner" style={{width: `${Math.max(0, Math.min(100, sum))}%`}}/></div>
            </div>
          </>
        ) : (
          <div className="sumWrap">
            <div className="sumText">Auto split is ON. Turn on “Manual % split” to edit weights.</div>
          </div>
        )}
      </div>
    </div>
  );
}


