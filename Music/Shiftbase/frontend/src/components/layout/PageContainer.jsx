import React from 'react';

export default function PageContainer({ title, subtitle, children, action, maxWidth = 'max-w-6xl', className = '' }) {
  return (
    <div className={`w-full mx-auto flex flex-col flex-1 min-w-0 ${maxWidth} ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-2">
          <div className="min-w-0">
            {title && <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-ink truncate">{title}</h1>}
            {subtitle && <p className="text-xs sm:text-sm text-copy mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 flex-wrap flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col w-full min-w-0">{children}</div>
    </div>
  );
}
