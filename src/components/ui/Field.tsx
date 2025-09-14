export function Field({
  label, hint, children
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <div className="label">{label}</div>
      {children}
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
