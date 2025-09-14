import { useEffect, useRef, useState } from "react";

export function TableToolbar({
  query, setQuery,
  density, setDensity,
  columns, visible, setVisible
}:{
  query: string; setQuery: (v:string)=>void;
  density: 'compact'|'normal'|'comfy'; setDensity: (v:'compact'|'normal'|'comfy')=>void;
  columns: {key:string; label:string; lock?:boolean}[];
  visible: Record<string, boolean>;
  setVisible: (v:Record<string, boolean>)=>void;
}){
  const [open,setOpen]=useState(false);
  const panelRef=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{const on = (e:any)=>{ if(panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)}; document.addEventListener('mousedown',on); return()=>document.removeEventListener('mousedown',on)},[]);
  return (
    <div className="tableToolbar">
      <div className="toolbarLeft">
        <div className="search">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 15c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/></svg>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platform…" />
        </div>
        <div className="density" role="tablist" aria-label="Density">
          {(['compact','normal','comfy'] as const).map(d=>(
            <button key={d} aria-pressed={density===d} onClick={()=>setDensity(d)}>{d}</button>
          ))}
        </div>
      </div>
      <div className="toolbarRight" style={{position:'relative'}}>
        <button className="colBtn" onClick={()=>setOpen(v=>!v)}>Columns</button>
        {open && (
          <div className="colPanel" ref={panelRef}>
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
  );
}


