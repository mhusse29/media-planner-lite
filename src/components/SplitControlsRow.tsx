// no runtime React import needed

type Props = {
  mode: "auto" | "manual";
  includeAll: boolean;          // only meaningful when mode === "auto"
  platformCount: number;
  onChangeMode: (m: "auto" | "manual") => void;
};

const chip = {
  surface: { background: "#111315", border: "1px solid #27292B" },
  inner:   { background: "#0E1011" },
  textMut: { color: "#BDBDBD" },
};

export default function SplitControlsRow({
  mode,
  includeAll,
  platformCount,
  onChangeMode,
}: Props) {
  return (
    <div style={{ ...chip.surface, borderRadius: 16, padding: 12 }} data-testid="split-controls-row">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {/* Mode pill */}
        <span
          style={{
            ...chip.inner,
            border: "1px solid #27292B",
            borderRadius: 999,
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#7C3AED" }} />
          <span>Mode: {mode === "auto" ? "Auto" : "Manual"}</span>
        </span>

        {/* Include all (auto only) */}
        {mode === "auto" && (
          <span
            style={{
              ...chip.inner,
              border: "1px solid #27292B",
              borderRadius: 999,
              padding: "6px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: includeAll ? "#10B981" : "#F59E0B",
              }}
            />
            <span>Include all: {includeAll ? "On" : "Off"}</span>
          </span>
        )}

        {/* Platforms pill */}
        <span
          style={{
            ...chip.inner,
            border: "1px solid #27292B",
            borderRadius: 999,
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#94A3B8" }} />
          <span>Platforms: {platformCount}</span>
        </span>

        {/* Segmented control */}
        <div style={{ marginLeft: "auto", ...chip.inner, border: "1px solid #27292B", borderRadius: 12, padding: 4 }}>
          <button
            onClick={() => onChangeMode("auto")}
            style={{
              padding: "6px 14px",
              fontSize: 14,
              borderRadius: 8,
              background: mode === "auto" ? "#2C2C2C" : "transparent",
              color: mode === "auto" ? "#FFFFFF" : "#BDBDBD",
              transition: "background .15s ease, color .15s ease",
              border: "none",
              cursor: "pointer",
            }}
          >
            Auto
          </button>
          <button
            onClick={() => onChangeMode("manual")}
            style={{
              padding: "6px 14px",
              fontSize: 14,
              borderRadius: 8,
              background: mode === "manual" ? "#2C2C2C" : "transparent",
              color: mode === "manual" ? "#FFFFFF" : "#BDBDBD",
              transition: "background .15s ease, color .15s ease",
              border: "none",
              cursor: "pointer",
            }}
          >
            Manual
          </button>
        </div>
      </div>
    </div>
  );
}
