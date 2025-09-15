import type { PropsWithChildren } from "react";

export default function AppCard({ children, className = "" }: PropsWithChildren<{className?: string}>) {
  return (
    <section className={`app-card ${className}`} style={{ padding: 12 }}>
      {children}
    </section>
  );
}
