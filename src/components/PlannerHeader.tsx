import { Download, Settings } from 'lucide-react';
import type { FC } from 'react';

export type ExportControls = {
  exportOpen: boolean;
  toggleExport: () => void;
  exportName: string;
  setExportName: (value: string) => void;
  exportPaper: 'a4' | 'letter';
  setExportPaper: (value: 'a4' | 'letter') => void;
  includeAssumptions: boolean;
  setIncludeAssumptions: (value: boolean) => void;
  isExporting: boolean;
  canExport: boolean;
  runExport: (format: 'pdf' | 'xlsx' | 'csv') => Promise<void>;
};

type PlannerHeaderProps = {
  onOpenFx: () => void;
  exportControls: ExportControls;
};

export const PlannerHeader: FC<PlannerHeaderProps> = ({ onOpenFx, exportControls }) => {
  const {
    exportOpen,
    toggleExport,
    exportName,
    setExportName,
    exportPaper,
    setExportPaper,
    includeAssumptions,
    setIncludeAssumptions,
    isExporting,
    canExport,
    runExport,
  } = exportControls;

  return (
    <header className="appbar">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <h1 className="h1">Media Plan Lite</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFx}
              className="btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Review or update exchange rates"
            >
              <Settings size={14} />
              <span>Manage FX</span>
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={toggleExport}
                disabled={!canExport || isExporting}
                className="btn primary"
                aria-haspopup="menu"
                aria-expanded={exportOpen}
                aria-busy={isExporting}
              >
                <Download size={14} />
                {isExporting ? 'Exporting…' : 'Export'}
              </button>
              {exportOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 8,
                    background: '#16171A',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 12,
                    minWidth: 260,
                    zIndex: 30,
                  }}
                >
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div>
                      <div className="label">Filename</div>
                      <input className="input" value={exportName} onChange={(e) => setExportName(e.target.value)} />
                    </div>
                    <div>
                      <div className="label">Paper (PDF)</div>
                      <select
                        className="select"
                        value={exportPaper}
                        onChange={(e) => setExportPaper(e.target.value as 'a4' | 'letter')}
                      >
                        <option value="a4">A4</option>
                        <option value="letter">Letter</option>
                      </select>
                    </div>
                    <label className="chip" style={{ justifyContent: 'space-between' }}>
                      Include assumptions (XLSX)
                      <input
                        type="checkbox"
                        checked={includeAssumptions}
                        onChange={(e) => setIncludeAssumptions(e.target.checked)}
                      />
                    </label>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <button className="secBtn" onClick={() => runExport('pdf')} disabled={isExporting}>
                        {isExporting ? 'Exporting…' : 'Export PDF'}
                      </button>
                      <button className="secBtn" onClick={() => runExport('xlsx')} disabled={isExporting}>
                        {isExporting ? 'Exporting…' : 'Export XLSX'}
                      </button>
                      <button className="secBtn" onClick={() => runExport('csv')} disabled={isExporting}>
                        {isExporting ? 'Exporting…' : 'Export CSV'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlannerHeader;

