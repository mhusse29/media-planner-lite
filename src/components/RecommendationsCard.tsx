import AppCard from "../ui/AppCard";

export default function RecommendationsCard({ items }: { items: string[] }) {
  return (
    <AppCard className="mt-4">
      <div className="app-card__header">
        <span className="app-card__eyebrow">Recommendations</span>
      </div>
      <div className="app-card--inner">
        <ul className="recommendations-list">
          {items.map((t, i) => (
            <li key={i} className="recommendations-item">
              <span className="app-dot" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </AppCard>
  );
}
