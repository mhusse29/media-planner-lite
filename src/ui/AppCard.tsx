import type { PropsWithChildren } from "react";

export default function AppCard({ children, className = "" }: PropsWithChildren<{className?: string}>) {
  const cardClass = ["app-card", className].filter(Boolean).join(" ");
  return (
    <section className={cardClass}>
      {children}
    </section>
  );
}
