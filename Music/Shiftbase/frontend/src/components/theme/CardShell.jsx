import React from 'react';

/**
 * CardShell Component
 * Base spatial container with mathematical aspect-ratio (429/554),
 * sheen highlights, procedural grain, and container queries (--u scaling).
 */
export default function CardShell({
  variant = 'speed', // 'speed' | 'context' | 'connections' | 'custom'
  className = '',
  children,
  style = {},
}) {
  const variantClass = {
    speed: 'card--speed',
    context: 'card--context',
    connections: 'card--connections',
    custom: '',
  }[variant] || '';

  return (
    <article className={`card ${variantClass} ${className}`} style={style}>
      {/* Procedural Grain Overlay */}
      <div className="card__grain" aria-hidden="true">
        <svg className="card__grain-svg" width="100%" height="100%">
          <rect width="100%" height="100%" filter="url(#cardNoiseGlobal)" />
        </svg>
      </div>

      {/* Card Content Elements */}
      {children}
    </article>
  );
}
