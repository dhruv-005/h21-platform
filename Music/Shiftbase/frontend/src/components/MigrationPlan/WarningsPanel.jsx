import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

/**
 * WarningsPanel Component
 * Displays AI-detected risk warnings, unmapped source drops, and unfulfilled target columns.
 */
export default function WarningsPanel({
  warnings = [],
  unmappedSources = [],
  unmappedTargets = [],
}) {
  const hasWarnings =
    warnings.length > 0 ||
    unmappedSources.length > 0 ||
    unmappedTargets.length > 0;

  if (!hasWarnings) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3 text-xs text-emerald-800 font-mono">
        <Info className="w-4 h-4 text-emerald-600" />
        <span>No critical schema discrepancies or data loss warnings detected.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 border border-ruby/30 bg-gradient-to-br from-ruby/5 to-transparent shadow-card-spatial flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-ruby/20">
        <AlertTriangle className="w-4 h-4 text-ruby" />
        <h2 className="text-sm font-semibold text-ruby-dark">
          Migration Risks & Discrepancies
        </h2>
      </div>

      {/* Warnings List */}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copy">
            Identified Risks
          </div>
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className="text-xs text-ruby-dark flex items-start gap-2 bg-ruby/10 p-2.5 rounded-xl font-mono"
            >
              <span>•</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Unmapped Source Fields */}
      {unmappedSources.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copy">
            Dropped Source Columns (Data Loss)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unmappedSources.map((f, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-black/5 text-copy text-[11px] font-mono"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unmapped Target Fields */}
      {unmappedTargets.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copy">
            Unpopulated Target Columns
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unmappedTargets.map((f, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-900 text-[11px] font-mono"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}