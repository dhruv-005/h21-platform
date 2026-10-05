import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * DiffViewer Component
 * Side-by-side schema mapping comparison with transformation badge indicator.
 */
export default function DiffViewer({ sourceRecord, targetRecord, mappingRules = [] }) {
  if (!sourceRecord && !targetRecord) {
    return (
      <div className="p-8 text-center text-xs text-copy/60 font-mono">
        No record selected for diff inspection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: Source Record */}
      <div className="glass-panel-elevated rounded-xl p-4 border border-white/40 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-black/5">
          <span className="text-xs font-semibold text-ink">Source Record</span>
          <span className="text-[10px] font-mono text-copy uppercase">Raw Input</span>
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {sourceRecord &&
            Object.entries(sourceRecord).map(([key, val]) => (
              <div key={key} className="flex justify-between items-start text-xs font-mono py-1 border-b border-black/[0.03]">
                <span className="text-copy/70">{key}:</span>
                <span className="text-ink font-medium max-w-[60%] truncate text-right">
                  {val === null ? <span className="text-rose-600/70">null</span> : String(val)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Right: Transformed Target Record */}
      <div className="glass-panel-elevated rounded-xl p-4 border border-white/40 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-black/5">
          <span className="text-xs font-semibold text-emerald-800">Target Result</span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
            Transformed
          </span>
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {targetRecord &&
            Object.entries(targetRecord).map(([key, val]) => (
              <div key={key} className="flex justify-between items-start text-xs font-mono py-1 border-b border-black/[0.03]">
                <span className="text-copy/70">{key}:</span>
                <span className="text-emerald-950 font-semibold max-w-[60%] truncate text-right">
                  {val === null ? <span className="text-rose-600/70">null</span> : String(val)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}