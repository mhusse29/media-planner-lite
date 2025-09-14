import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  content?: string;
  side?: "top" | "bottom";
  maxWidth?: number;
  children: React.ReactNode;
};

export function Tooltip({ content, side = "top", maxWidth = 280, children }: Props) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; flip: boolean }>({
    top: 0,
    left: 0,
    flip: false,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const bubbleH = 44; // approx height; we’ll fit within viewport anyway
      let top = side === "top" ? r.top - bubbleH - 8 : r.bottom + 8;
      let flip = false;

      // If not enough room above, flip below
      if (top < 8) {
        top = r.bottom + 8;
        flip = true;
      }
      // Clamp horizontally inside viewport
      let left = Math.min(Math.max(8, r.left), window.innerWidth - maxWidth - 8);

      setPos({ top, left, flip });
    };

    place();
    const on = () => place();
    window.addEventListener("scroll", on, true); // capture to catch inner scrollers
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on, true);
      window.removeEventListener("resize", on);
    };
  }, [open, side, maxWidth]);

  if (!content) return <>{children}</>;

  return (
    <span
      ref={anchorRef}
      className="tipWrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open &&
        createPortal(
          <div
            className="tipBubble tipBubblePortal"
            role="tooltip"
            style={{ position: "fixed", top: pos.top, left: pos.left, maxWidth }}
          >
            {content}
            <span
              className="tipArrow"
              style={{
                top: pos.flip ? -6 : "100%",
                transform: pos.flip ? "rotate(180deg)" : undefined,
                left: 12,
              }}
            />
          </div>,
          document.body
        )}
    </span>
  );
}



