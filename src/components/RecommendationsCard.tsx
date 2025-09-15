import AppCard from "../ui/AppCard";

export default function RecommendationsCard({ items }: { items: string[] }) {
  return (
    <AppCard className="mt-4">
      <div style={{ padding:"12px 12px 4px", borderBottom:"1px solid var(--card-border)" }}>
        <div style={{ fontWeight:700, letterSpacing:.2, color: "var(--text)" }}>RECOMMENDATIONS</div>
      </div>
      <div className="app-card--inner" style={{ margin:12, padding:12 }}>
        <ul style={{ display:"grid", gap:8 }}>
          {items.map((t, i) => (
            <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, color:"var(--muted)", lineHeight:1.5 }}>
              <span className="app-dot" style={{ marginTop:6 }} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </AppCard>
  );
}
