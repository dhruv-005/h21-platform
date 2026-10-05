import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ConfidenceIndicator from './ConfidenceIndicator';
import StatusBadge from '../common/StatusBadge';

export default function PlanProposal({ proposal, planStatus = 'proposed', version = 1 }) {
  if (!proposal) {
    return (
      <div className="glass-panel-elevated rounded-2xl p-8 text-center text-copy font-mono text-xs">
        No migration proposal generated yet.
      </div>
    );
  }

  const { mappings = [], overall_risk = 'medium' } = proposal;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
      {/* Summary Header */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-white/50 shadow-card-spatial flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amethyst to-amethyst-dark flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-ink">AI Migration Proposal</h2>
              <StatusBadge status={planStatus} />
            </div>
            <p className="text-xs text-copy mt-0.5">Version {version} • {mappings.length} Fields Mapped</p>
          </div>
        </div>

        <div className="text-right text-xs font-mono">
          <span className="text-copy/60 block text-[10px] uppercase">Overall Risk</span>
          <span
            className={`font-semibold uppercase tracking-wider ${
              overall_risk === 'low' ? 'text-emerald-700' : overall_risk === 'high' ? 'text-rose-700' : 'text-amber-700'
            }`}
          >
            {overall_risk}
          </span>
        </div>
      </div>

      {/* Responsive Mapping Rows */}
      <div className="glass-panel-elevated rounded-2xl p-3 sm:p-5 border border-white/50 shadow-card-spatial flex flex-col gap-2">
        <div className="hidden md:flex items-center justify-between pb-2 border-b border-black/5 text-xs font-mono text-copy uppercase tracking-wider px-2">
          <span>Target Destination</span>
          <span>Transformation Rule & Confidence</span>
          <span>Source Origin</span>
        </div>

        <div className="divide-y divide-black/5">
          {mappings.map((m, idx) => (
            <div
              key={idx}
              className="py-3 px-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs"
            >
              {/* Target */}
              <div className="flex items-center gap-2 min-w-[130px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-ink font-mono">{m.target_field}</span>
              </div>

              {/* Transformation Rule */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-black/5 text-copy border border-black/5">
                  {m.transformation}
                </span>
                <ConfidenceIndicator confidence={m.confidence} />
              </div>

              {/* Source */}
              <div className="flex items-center gap-2 min-w-[130px] md:justify-end text-left md:text-right">
                <span className="font-mono text-copy">
                  {m.source_field || (m.source_fields ? m.source_fields.join(' + ') : 'None')}
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              </div>

              {/* Risk Notes */}
              {m.risk_notes && (
                <div className="w-full text-[11px] text-amber-900 bg-amber-500/10 px-3 py-1.5 rounded-lg font-mono mt-1">
                  ⚠️ {m.risk_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
