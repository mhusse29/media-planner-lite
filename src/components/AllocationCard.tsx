import { SectionCard } from "./SectionCard";

type Percents = Record<string, number>;

export function AllocationCard({
  selected, names,
  mode,
  pctMap, setPctMap,
}:{
  selected: string[];
  names: Record<string,string>;
  mode: 'auto' | 'manual';
  pctMap: Percents; setPctMap: (v:Percents)=>void;
}){
  const sum = selected.reduce((s,k)=> s + Math.max(0, pctMap[k] ?? 0), 0);
  const setVal = (k:string, v:number)=> setPctMap({...pctMap, [k]: Math.max(0, v || 0)});
  const equalize = ()=> {
    if (!selected.length) return;
    const each = Math.floor((100/selected.length)*100)/100;
    const next: Percents = {}; selected.forEach(k=> next[k]=each); setPctMap(next);
  };
  const clear = ()=> {
    const next: Percents = {}; selected.forEach(k=> next[k]=0); setPctMap(next);
  };

  // Only show manual controls when in manual mode
  if (mode !== 'manual') {
    return null;
  }

  return (
    <SectionCard
      eyebrow="Manual Controls"
      title="Platform % split"
      sub="Set exact percentage for each platform"
    >
      <div className="grid2">
        {selected.map(k=>(
          <div className="fieldRow" key={k}>
            <div className="fieldLabel">{names[k] || k}</div>
            <div className="pillInput">
              <input type="number" min={0} value={pctMap[k] ?? 0} onChange={e=>setVal(k, Number(e.target.value))}/>
              <span className="pillSuf">%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="sumWrap">
        <div className={`sumText ${Math.abs(sum-100)<0.01?'ok':'warn'}`}>
          Sum: {sum.toFixed(2)}% {Math.abs(sum-100)<0.01?'':'(will normalize)'}
        </div>
        <div className="sumBar"><div className="sumInner" style={{width:`${Math.max(0,Math.min(100,sum))}%`}}/></div>
      </div>
      <div className="sectionActions" style={{justifyContent:'flex-start', gap:8}}>
        <button className="secBtn" onClick={equalize} disabled={!selected.length}>Equal split</button>
        <button className="secBtn" onClick={clear} disabled={!selected.length}>Clear</button>
      </div>
    </SectionCard>
  );
}
