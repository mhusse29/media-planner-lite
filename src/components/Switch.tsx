export function Switch({
  checked, onChange, label
}:{ checked:boolean; onChange:(v:boolean)=>void; label?:string }){
  return (
    <label className="switch" aria-label={label || "toggle"}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} />
      <span className="slider" />
    </label>
  );
}
