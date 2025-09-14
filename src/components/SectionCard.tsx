import type React from "react";

export function SectionCard({
  eyebrow, title, sub, actions, children
}:{
  eyebrow: string; title: string; sub?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}){
  return (
    <div className="sectionCard">
      <div className="sectionHead">
        <div className="sectionTitle">
          <div className="eyebrow">{eyebrow.toUpperCase()}</div>
          <div className="sub">{title}{sub ? ` — ${sub}` : ''}</div>
        </div>
        <div className="sectionActions">
          {actions}
        </div>
      </div>
      <div className="sectionBody">{children}</div>
    </div>
  );
}
