import React from 'react';

/**
 * GrainFilter Component
 * Renders the SVG feTurbulence procedural noise definition for glass and cards.
 */
export default function GrainFilter() {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter
          id="cardNoiseGlobal"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.54"
            numOctaves="3"
            seed="27"
            stitchTiles="stitch"
            result="turbulence"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="turbulence"
            result="desaturated"
          />
          <feComponentTransfer in="desaturated" result="contrast">
            <feFuncR type="linear" slope="1.8" intercept="-0.25" />
            <feFuncG type="linear" slope="1.8" intercept="-0.25" />
            <feFuncB type="linear" slope="1.8" intercept="-0.25" />
            <feFuncA type="table" tableValues="0 0.52" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
