import React from 'react';
import { DOT_GLYPHS } from '../../theme/theme-config';

/**
 * LedDotText Component
 * Generates an inline SVG comprised of filled circular nodes derived
 * from the 7-row binary bitmap glyph dictionary.
 */
export default function LedDotText({
  text = '',
  className = '',
  color = 'currentColor',
  dotRadius = 1.55,
  pitchX = 5,
  pitchY = 4,
  gap = 2,
}) {
  const chars = String(text).split('');
  let currentX = 0;
  const dotsToRender = [];

  chars.forEach((char, charIdx) => {
    const glyph = DOT_GLYPHS[char] || DOT_GLYPHS['0'];
    const rows = glyph.length;
    const cols = glyph[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (glyph[r][c] === 1) {
          const cx = currentX + c * pitchX + dotRadius;
          const cy = r * pitchY + dotRadius;
          dotsToRender.push({
            id: `${charIdx}-${r}-${c}`,
            cx,
            cy,
            r: dotRadius,
          });
        }
      }
    }

    currentX += cols * pitchX + gap;
  });

  const totalWidth = Math.max(currentX, 1);
  const totalHeight = 7 * pitchY + dotRadius * 2;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className={`inline-block overflow-visible ${className}`}
      style={{ height: '0.85em', width: 'auto' }}
      aria-label={text}
      role="img"
    >
      {dotsToRender.map((dot) => (
        <circle
          key={dot.id}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={color}
        />
      ))}
    </svg>
  );
}
