
type Props = {
  splitMode: 'auto' | 'manual';
  setSplitMode: (m: 'auto' | 'manual') => void;
  includeAll: boolean;
  setIncludeAll: (v: boolean) => void;
  platformCount: number;
};

export default function SplitControls({
  splitMode, setSplitMode, includeAll, setIncludeAll, platformCount
}: Props) {
  return (
    <section aria-labelledby="split-controls" className="rounded-2xl border border-neutral-800 bg-[#111315]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        {/* Segmented */}
        <div aria-label="Split mode" role="tablist" className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-1">
          {(['auto','manual'] as const).map(m => (
            <button
              key={m}
              role="tab"
              aria-selected={splitMode === m}
              onClick={() => setSplitMode(m)}
              className={`px-3.5 py-1.5 text-sm rounded-lg transition
                ${splitMode === m ? 'bg-[#2C2C2C] text-white' : 'text-[#BDBDBD] hover:text-white'}`}
            >
              {m === 'auto' ? 'Auto' : 'Manual'}
            </button>
          ))}
        </div>

        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-neutral-900/70 border border-neutral-800">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Mode: {splitMode === 'auto' ? 'Auto' : 'Manual'}
          </span>
          {splitMode === 'auto' && (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-neutral-900/70 border border-neutral-800">
              <span className={`h-2 w-2 rounded-full ${includeAll ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              Include all: {includeAll ? 'On' : 'Off'}
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-neutral-900/70 border border-neutral-800">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Platforms: {platformCount}
          </span>
        </div>

        {/* Toggle (auto only) */}
        <div className="ml-auto">
          {splitMode === 'auto' && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#BDBDBD]">Include all platforms</span>
              <button
                role="switch"
                aria-checked={includeAll}
                onClick={() => setIncludeAll(!includeAll)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition
                  ${includeAll ? 'bg-violet-600' : 'bg-neutral-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition
                  ${includeAll ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
