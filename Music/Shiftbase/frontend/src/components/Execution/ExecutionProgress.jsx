import React from 'react';
import SpeedGauge from '../theme/SpeedGauge';
import LedDotText from '../theme/LedDotText';

/**
 * ExecutionProgress Component
 * Active migration progress display with rotating radar gauge and throughput metrics.
 */
export default function ExecutionProgress({
  status = 'running',
  processed = 0,
  total = 100,
}) {
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="glass-panel-elevated rounded-2xl p-8 border border-white/50 shadow-card-spatial flex flex-col items-center justify-center text-center gap-6">
      {/* Visual Radial Gauge */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <SpeedGauge activeValue={percentage} />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <LedDotText
            text={String(percentage)}
            color="#ad314d"
            dotRadius={2.4}
            pitchX={5}
            pitchY={4}
          />
          <span className="text-xs font-mono uppercase tracking-widest text-copy/70 mt-1">
            Percent
          </span>
        </div>
      </div>

      {/* Progress Label */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-ink">
          Executing Live Deterministic Migration
        </h3>
        <p className="text-xs font-mono text-copy">
          Processed {processed} of {total} records • Writing to SQLite WAL
        </p>
      </div>
    </div>
  );
}