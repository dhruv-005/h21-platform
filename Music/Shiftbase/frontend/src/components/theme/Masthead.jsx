import React from 'react';
import LedDotText from './LedDotText';

/**
 * Masthead Component
 * Renders the two-line responsive spatial headline with the animated LED-dot word
 * and container-queried contextual introduction copy.
 */
export default function Masthead({
  headlineLine1 = "Built for",
  dotWord = "Intelligent",
  headlineLine2 = "Performance",
  intro = "Every capability is engineered for speed, scale and contextual understanding, giving your migration pipeline the intelligence to adapt, validate and perform in production."
}) {
  return (
    <header className="masthead">
      <h1 className="headline">
        <span className="headline__line">
          {headlineLine1}
          <span className="dot-word" aria-label={dotWord}>
            <LedDotText
              text={dotWord}
              color="#ad314d"
              pitchX={4}
              pitchY={4}
              dotRadius={1.8}
            />
          </span>
        </span>
        <span className="headline__line">
          {headlineLine2}
        </span>
      </h1>

      <p className="intro">
        {intro}
        <span className="desktop-break"><br /></span>
      </p>
    </header>
  );
}
