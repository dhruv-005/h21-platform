import React from 'react';
import LedDotText from '../theme/LedDotText';

/**
 * DotMetric Component
 * Standalone inline LED-dot number with label and units.
 */
export default function DotMetric({
  value = "0",
  unit = "",
  label = "",
  color = "#ad314d",
  size = "md",
}) {
  const dotRadius = size === 'lg' ? 2.3 : size === 'sm' ? 1.3 : 1.7;
  const pitchX = size === 'lg' ? 5.5 : size === 'sm' ? 3.5 : 4.5;
  const pitchY = size === 'lg' ? 4.5 : size === 'sm' ? 3.0 : 3.8;

  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex items-baseline gap-1">
        <LedDotText
          text={String(value)}
          color={color}
          dotRadius={dotRadius}
          pitchX={pitchX}
          pitchY={pitchY}
        />
        {unit && (
          <span className="text-xs font-semibold text-copy/80 uppercase tracking-tight">
            {unit}
          </span>
        )}
      </div>
      {label && (
        <span className="text-[10px] uppercase font-mono tracking-wider text-copy/60 mt-1">
          {label}
        </span>
      )}
    </div>
  );
}