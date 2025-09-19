import { Card, microTitleClass } from "./ui/Card";

export default function RecommendationsCard({ items }: { items: string[] }) {
  return (
    <Card>
      <header className="space-y-1">
        <span className={microTitleClass}>Recommendations</span>
      </header>
      <ul className="space-y-1.5 text-[13px] text-white/70">
        {items.map((recommendation, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            <span>{recommendation}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
