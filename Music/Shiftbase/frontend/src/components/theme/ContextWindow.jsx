import React from 'react';

/**
 * ContextWindow Component
 * Frosted glass preview window simulating an active schema or code stream.
 */
export default function ContextWindow({ children, className = '' }) {
  return (
    <div className={`context-window ${className}`}>
      {children || (
        <div className="flex flex-col justify-center h-full py-2">
          <div className="context-window__line context-window__line--long" />
          <div className="context-window__line context-window__line--med" />
          <div className="context-window__line context-window__line--short" />
        </div>
      )}
    </div>
  );
}
