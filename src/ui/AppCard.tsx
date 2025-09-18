import type { HTMLAttributes, PropsWithChildren } from "react";

export default function AppCard({ children, className = "", ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section className={`app-card ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
