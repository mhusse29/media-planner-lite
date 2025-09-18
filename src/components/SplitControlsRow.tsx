// no runtime React import needed

type Props = {
  mode: "auto" | "manual";
  includeAll: boolean;
  onChangeMode: (m: "auto" | "manual") => void;
  onIncludeAllChange: (value: boolean) => void;
};

export default function SplitControlsRow({
  mode,
  includeAll,
  onChangeMode,
  onIncludeAllChange,
}: Props) {
  const toggleDisabled = mode !== "auto";

  return (
    <div className="planner-mode" data-testid="split-controls-row">
      <div className="planner-mode__top">
        <span className="planner-mode__chip">
          <span className="planner-mode__chip-dot" />
          Mode: {mode === "auto" ? "Auto" : "Manual"}
        </span>
      </div>
      <div className="planner-mode__row">
        <div className="planner-seg" role="group" aria-label="Allocation mode">
          <button
            type="button"
            className={mode === "auto" ? "is-active" : ""}
            onClick={() => onChangeMode("auto")}
          >
            Auto
          </button>
          <button
            type="button"
            className={mode === "manual" ? "is-active" : ""}
            onClick={() => onChangeMode("manual")}
          >
            Manual
          </button>
        </div>
        <div className="planner-toggle">
          <label
            className={`planner-switch${toggleDisabled ? " is-disabled" : ""}`}
            title="Give every selected platform at least 10% of the budget in auto mode"
            aria-label="Give every selected platform at least 10% of the budget in auto mode"
          >
            <input
              type="checkbox"
              checked={includeAll}
              onChange={(e) => onIncludeAllChange(e.target.checked)}
              disabled={toggleDisabled}
            />
            <span className="planner-switch__track">
              <span className="planner-switch__thumb" />
            </span>
          </label>
          <span>Min 10% each{toggleDisabled ? ' (auto only)' : ''}</span>
        </div>
      </div>
    </div>
  );
}
