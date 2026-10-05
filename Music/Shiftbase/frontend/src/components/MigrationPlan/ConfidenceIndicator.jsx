import React from 'react';

/**
 * ConfidenceIndicator Component
 * Mini circular arc displaying AI mapping confidence percentage.
 */
export default function ConfidenceIndicator({ confidence = 1.0 }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 90
      ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30'
      : pct >= 75
      ? 'text-amber-700 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-700 bg-rose-500/10 border-rose-500/30';

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-mono font-medium ${color}`}
      title={`AI Confidence Score: ${pct}%`}
    >
      <span>{pct}%</span>
      <span className="text-[9px] uppercase tracking-wider">conf</span>
    </div>
  );
}