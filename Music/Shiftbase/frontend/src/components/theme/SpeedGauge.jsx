import React from 'react';

export default function SpeedGauge({ activeValue = 118 }) {
  const ticks = Array.from({ length: 23 }, (_, i) => {
    const angle = -135 + i * 11.7;
    const rad = (angle * Math.PI) / 180;
    const x1 = 163 + 105 * Math.cos(rad);
    const y1 = 163 + 105 * Math.sin(rad);
    const x2 = 163 + 112 * Math.cos(rad);
    const y2 = 163 + 112 * Math.sin(rad);
    return { id: i, x1, y1, x2, y2 };
  });

  return (
    <svg viewBox="0 0 326 326" fill="none" className="gauge">
      <defs>
        <filter id="gaugeRadarSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.35" />
        </filter>
        <filter id="gaugeRadarHalo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5.2" />
        </filter>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#ffb4c8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#bd4468" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle
        cx="163"
        cy="163"
        r="128"
        stroke="rgba(0, 0, 0, 0.28)"
        strokeWidth="12"
        strokeDasharray="540 300"
        strokeLinecap="round"
        transform="rotate(135 163 163)"
        filter="url(#gaugeRadarSoft)"
      />

      <circle
        cx="163"
        cy="163"
        r="128"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeDasharray="520 290"
        strokeLinecap="round"
        transform="rotate(135 163 163)"
      />

      <circle
        cx="163"
        cy="163"
        r="115"
        stroke="rgba(255, 255, 255, 0.09)"
        strokeWidth="1"
      />

      {ticks.map((t) => (
        <line
          key={t.id}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1"
        />
      ))}

      <circle
        cx="163"
        cy="163"
        r="128"
        stroke="url(#gaugeGradient)"
        strokeWidth="6"
        strokeDasharray="310 500"
        strokeLinecap="round"
        transform="rotate(135 163 163)"
        filter="url(#gaugeRadarHalo)"
      />
      <circle
        cx="163"
        cy="163"
        r="128"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeDasharray="310 500"
        strokeLinecap="round"
        transform="rotate(135 163 163)"
      />

      <circle cx="163" cy="163" r="4" fill="#ffffff" opacity="0.9" />
      <circle cx="163" cy="163" r="8" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" />
    </svg>
  );
}
