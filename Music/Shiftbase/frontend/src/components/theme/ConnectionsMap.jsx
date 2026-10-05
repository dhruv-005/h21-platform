import React from 'react';

/**
 * ConnectionsMap Component
 * Network node map with coordinate strokes, warm highlights, and vertical fade masking.
 */
export default function ConnectionsMap({ className = '' }) {
  const nodes = [
    { cx: 45, cy: 117, r: 6.5, stroke: 10.5, warm: false },
    { cx: 133, cy: 61, r: 5.5, stroke: 8.5, warm: true },
    { cx: 189, cy: 61, r: 6.5, stroke: 11, warm: false },
    { cx: 319, cy: 61, r: 4.5, stroke: null, warm: false },
    { cx: 319, cy: 117, r: 6.5, stroke: 10.5, warm: false },
    { cx: 133, cy: 173, r: 4.5, stroke: null, warm: false },
    { cx: 260, cy: 173, r: 5.5, stroke: 9, warm: true },
    { cx: 384, cy: 117, r: 6.5, stroke: 11, warm: false },
  ];

  return (
    <svg
      viewBox="0 0 429 238"
      fill="none"
      className={`connections-map ${className}`}
    >
      <defs>
        <linearGradient id="connectionsWarmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff8dd" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#e8703d" stopOpacity="0.30" />
        </linearGradient>
      </defs>

      {/* Structural Network Grid Lines */}
      <path
        d="M 45 117 L 133 61 L 189 61 L 319 61 L 384 117"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path
        d="M 45 117 L 133 173 L 260 173 L 319 117 L 384 117"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path d="M 133 61 L 133 173" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M 319 61 L 319 117" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Active Line Highlights */}
      <path
        d="M 45 117 L 133 61 L 189 61 L 319 117"
        stroke="url(#connectionsWarmGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M 189 61 L 260 173 L 384 117"
        stroke="rgba(255, 248, 221, 0.52)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Interactive Node Coordinates */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={n.warm ? '#fff8dd' : '#ffffff'}
            fillOpacity={n.warm ? 1 : 0.9}
          />
          {n.stroke && (
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.stroke}
              stroke={n.warm ? 'rgba(255,248,221,0.38)' : 'rgba(255,255,255,0.32)'}
              strokeWidth="1"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
