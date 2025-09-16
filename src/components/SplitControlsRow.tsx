// no runtime React import needed

type Props = {
  mode: "auto" | "manual";
  includeAll: boolean;
  onChangeMode: (m: "auto" | "manual") => void;
  onIncludeAllChange: (value: boolean) => void;
};

const chip = {
  surface: { background: "#111315", border: "1px solid #27292B" },
  inner:   { background: "#0E1011" },
  textMut: { color: "#BDBDBD" },
};

export default function SplitControlsRow({
  mode,
  includeAll,
  onChangeMode,
  onIncludeAllChange,
}: Props) {
  const toggleDisabled = mode !== "auto";

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

        {/* removed Include-all status pill */}

        {/* removed Platforms count pill */}

        {/* Segmented control */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ ...chip.inner, border: "1px solid #27292B", borderRadius: 12, padding: 4, display: "flex" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label
              className="switch"
              title="Give every selected platform at least 10% of the budget in auto mode"
              aria-label="Give every selected platform at least 10% of the budget in auto mode"
              style={{
                opacity: toggleDisabled ? 0.4 : 1,
                pointerEvents: toggleDisabled ? "none" : "auto",
                cursor: toggleDisabled ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={includeAll}
                onChange={(e) => onIncludeAllChange(e.target.checked)}
                disabled={toggleDisabled}
              />
              <span className="slider" />
            </label>
            <span style={{ fontSize: 13, color: "#BDBDBD" }}>
              Min 10% each{toggleDisabled ? ' (auto only)' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
