import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, Eye, Clock, ShieldCheck } from 'lucide-react';
import DiffViewer from '../common/DiffViewer';
import LedDotText from '../theme/LedDotText';

/**
 * DryRunResults Component
 * Displays the complete results of a deterministic simulation including
 * preview pairs, quarantine breakdown, and mathematical integrity checks.
 */
export default function DryRunResults({ result }) {
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);

  if (!result) return null;

  const {
    counts = { source: 0, target: 0, quarantined: 0 },
    verification = { balanced: true },
    success_records = [],
    quarantine_records = [],
    execution_time_ms = 0,
  } = result;

  const currentSuccessPair = success_records[selectedRecordIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-panel-elevated rounded-2xl p-4 border border-white/50 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-copy">Source Total</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <LedDotText text={String(counts.source)} color="#222222" dotRadius={1.8} />
            <span className="text-xs text-copy">rows</span>
          </div>
          <span className="text-[10px] text-copy/60 font-mono">100% Staged</span>
        </div>

        <div className="glass-panel-elevated rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-emerald-800">Would Migrate</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <LedDotText text={String(counts.target)} color="#047857" dotRadius={1.8} />
            <span className="text-xs text-emerald-800">valid</span>
          </div>
          <span className="text-[10px] text-emerald-700/80 font-mono">Passed all rules</span>
        </div>

        <div className="glass-panel-elevated rounded-2xl p-4 border border-ruby/20 bg-ruby/5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-ruby">Would Quarantine</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <LedDotText text={String(counts.quarantined)} color="#ad314d" dotRadius={1.8} />
            <span className="text-xs text-ruby">failed</span>
          </div>
          <span className="text-[10px] text-ruby/80 font-mono">Isolated for review</span>
        </div>

        <div className="glass-panel-elevated rounded-2xl p-4 border border-white/50 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-copy">Latency & Balance</span>
          <div className="my-1.5 flex items-center gap-1.5 text-xs font-mono font-semibold text-ink">
            <Clock className="w-3.5 h-3.5 text-copy" />
            <span>{execution_time_ms} ms</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>{verification.balanced ? 'Counts Balanced' : 'Mismatch'}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Diff Sample Inspector */}
      {success_records.length > 0 && (
        <div className="glass-panel-elevated rounded-2xl p-5 border border-white/50 shadow-card-spatial flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-semibold text-ink">
                Transformation Preview (Sample {selectedRecordIndex + 1} of {success_records.length})
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {success_records.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedRecordIndex(i)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-mono font-semibold transition ${
                    selectedRecordIndex === i
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-white/60 text-copy hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {currentSuccessPair && (
            <DiffViewer
              sourceRecord={currentSuccessPair.source}
              targetRecord={currentSuccessPair.target}
            />
          )}
        </div>
      )}

      {/* Would-Be Quarantine Breakdown */}
      {quarantine_records.length > 0 && (
        <div className="glass-panel-elevated rounded-2xl p-5 border border-ruby/30 bg-gradient-to-br from-ruby/5 to-transparent shadow-card-spatial flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-ruby/20">
            <AlertOctagon className="w-4 h-4 text-ruby" />
            <h2 className="text-sm font-semibold text-ruby-dark">
              Simulation Quarantine Previews ({quarantine_records.length} Records)
            </h2>
          </div>

          <div className="divide-y divide-ruby/10">
            {quarantine_records.map((item, idx) => (
              <div key={idx} className="py-2.5 flex flex-col gap-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ruby-dark">
                    Record #{idx + 1} Failed
                  </span>
                  <span className="text-[10px] text-copy">
                    {Object.keys(item.source).length} source fields
                  </span>
                </div>

                <div className="space-y-1">
                  {item.errors.map((err, eIdx) => (
                    <div
                      key={eIdx}
                      className="text-[11px] text-rose-800 bg-rose-500/10 p-2 rounded-lg"
                    >
                      <span className="font-semibold">[{err.field}]:</span> {err.error}
                      {err.source_value !== undefined && (
                        <span className="text-copy/80"> (Value: "{String(err.source_value)}")</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}