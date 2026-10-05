import React from 'react';

/**
 * TileWall Component
 * Structural SVG tile grid background for Card 2 (Context Window).
 */
export default function TileWall({ className = '' }) {
  return (
    <svg
      viewBox="0 0 429 554"
      fill="none"
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-40 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="tileSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.4" />
        </filter>
      </defs>

      {/* Top 3 Tiles */}
      <rect x="24" y="90" width="115" height="120" rx="15" fill="rgba(255,255,255,0.12)" filter="url(#tileSoft)" />
      <rect x="157" y="90" width="115" height="120" rx="15" fill="rgba(255,255,255,0.18)" />
      <rect x="290" y="90" width="115" height="120" rx="15" fill="rgba(255,255,255,0.12)" />

      {/* Middle 3 Tiles */}
      <rect x="24" y="228" width="115" height="120" rx="15" fill="rgba(255,255,255,0.15)" />
      <rect x="157" y="228" width="115" height="120" rx="15" fill="rgba(255,255,255,0.22)" filter="url(#tileSoft)" />
      <rect x="290" y="228" width="115" height="120" rx="15" fill="rgba(255,255,255,0.15)" />

      {/* Bottom Structural Band */}
      <rect x="24" y="366" width="381" height="60" rx="15" fill="rgba(255,255,255,0.14)" />
    </svg>
  );
}
