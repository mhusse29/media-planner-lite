import { useEffect, useRef, useState } from "react";

export function ResultsHeader({
  title = "Results by Platform",
  showTitle = true,
  query, setQuery,
  columns, visible, setVisible,
  helpKeyLabel, helpText
}:{
  title?: string;
  showTitle?: boolean;
  query: string; setQuery: (v:string)=>void;
  columns: {key:string; label:string; lock?:boolean}[];
  visible: Record<string, boolean>;
  setVisible: (v:Record<string, boolean>)=>void;
  helpKeyLabel?: string | null;
  helpText?: string | null;
}){
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    const on = (e:any)=>{ if(panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', on);
    return ()=> document.removeEventListener('mousedown', on);
  },[]);

  return (
    <div className="resultsHeader">
      <div className="resultsRow">
        <div className="resultsTitle">
          {showTitle && <div className="eyebrow">{title.toUpperCase()}</div>}
        </div>
        <div className="resultsControls" style={{position:'relative'}}>
          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.47 6.47 0 1 0-1.06 1.06l.27.28v.79l5 5l1.5-1.5l-5-5zM9.5 14A4.5 4.5 0 1 1 14 9.5A4.505 4.505 0 0 1 9.5 14"/></svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platform…" />
          </div>
          <button className="colBtn" onClick={()=>setOpen(v=>!v)}>Columns</button>
          {open && (
            <div ref={panelRef} className="colPanel">
              {columns.map(c=>(
                <label key={c.key} className="colRow">
                  <input type="checkbox" disabled={c.lock} checked={!!visible[c.key] || !!c.lock}
                    onChange={e=>setVisible({...visible, [c.key]: e.target.checked})}/>
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline column help (no shake) */}
      <div className="helpBarWrap" data-visible={!!helpKeyLabel}>
        {helpKeyLabel && (
          <div className="helpBar">
            <span className="dot" />
            <span className="label">{helpKeyLabel}</span>
            <span className="text">• {helpText}</span>
          </div>
        )}
      </div>
    </div>
  );
}


