import React from 'react';
import LedDotText from '../theme/LedDotText';

/**
 * MetricCard Component
 * Spatial dashboard card for metrics, counts, latency, and throughput stats.
 */
export default function MetricCard({
  title,
  value,
  unit,
  caption,
  color = '#222222',
  dotRadius = 2.0,
  pitchX = 5,
  pitchY = 4,
  className = '',
}) {
  return (
    <div className={`glass-panel-elevated rounded-2xl p-5 flex flex-col justify-between border border-white/40 shadow-card-spatial ${className}`}>
      <div className="text-xs font-mono uppercase tracking-widest text-copy/70">
        {title}
      </div>

      <div className="my-3 flex items-baseline gap-1.5">
        <LedDotText
          text={String(value)}
          color={color}
          dotRadius={dotRadius}
          pitchX={pitchX}
          pitchY={pitchY}
        />
        {unit && (
          <span className="text-sm font-medium text-copy/80">
            {unit}
          </span>
        )}
      </div>

      {caption && (
        <div className="text-xs text-copy/70">
          {caption}
        </div>
      )}
    </div>
  );
}