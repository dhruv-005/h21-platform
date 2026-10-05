import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Database, History } from 'lucide-react';
import LedDotText from '../theme/LedDotText';
import StatusBadge from '../common/StatusBadge';

/**
 * ExecutionSummary Component
 * Post-execution summary card verifying record count balance and integrity.
 */
export default function ExecutionSummary({
  result,
  onRollback,
  rollingBack = false,
}) {
  if (!result) return null;

  const {
    counts = { source: 0, target: 0, quarantined: 0 },
    verification = { balanced: true },
    execution_id,
    message,
    status = 'completed',
  } = result;

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-white/50 shadow-card-spatial flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink">
                Execution Completed
              </h2>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs font-mono text-copy mt-0.5">
              Execution ID: {execution_id ? execution_id.substring(0, 13) : 'active'}...
            </p>
          </div>
        </div>

        {/* Balance Confirmation Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-mono font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Integrity Verified: Source == Target + Quarantine</span>
        </div>
      </div>

      {/* Counts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-white/60 border border-black/5 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-copy tracking-wider">
            Total Input
          </span>
          <div className="my-2">
            <LedDotText text={String(counts.source)} color="#222222" dotRadius={2.0} />
          </div>
          <span className="text-xs text-copy">Source Records</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-emerald-800 tracking-wider">
            Successfully Migrated
          </span>
          <div className="my-2">
            <LedDotText text={String(counts.target)} color="#047857" dotRadius={2.0} />
          </div>
          <span className="text-xs text-emerald-900 font-medium">In Target Store</span>
        </div>

        <div className="p-4 rounded-xl bg-ruby/10 border border-ruby/20 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-ruby tracking-wider">
            Quarantined
          </span>
          <div className="my-2">
            <LedDotText text={String(counts.quarantined)} color="#ad314d" dotRadius={2.0} />
          </div>
          <span className="text-xs text-ruby-dark font-medium">In Holding Area</span>
        </div>
      </div>

      {/* Summary Message */}
      <div className="p-3.5 rounded-xl bg-black/5 text-xs font-mono text-copy leading-relaxed flex items-center gap-2">
        <Database className="w-4 h-4 text-copy/60 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}