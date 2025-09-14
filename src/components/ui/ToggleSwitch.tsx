export function ToggleSwitch({
  label, help, checked, onChange, id
}:{
  label: string; help?: string; checked: boolean; onChange: (v:boolean)=>void; id: string;
}) {
  return (
    <label htmlFor={id} className="toggleRow">
      <div className="toggleText">
        <div className="toggleTitle">{label}</div>
        {help ? <div className="toggleHelp">{help}</div> : null}
      </div>
      <input
        id={id}
        type="checkbox"
        className="srOnly"
        checked={checked}
        onChange={e=>onChange(e.target.checked)}
      />
      <span className="switch" data-checked={checked}><span className="knob" /></span>
    </label>
  );
}
