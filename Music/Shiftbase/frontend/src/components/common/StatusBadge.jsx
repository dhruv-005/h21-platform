import React from 'react';

/**
 * StatusBadge Component
 * Semantic state badges with subtle glows and uppercase typography.
 */
export default function StatusBadge({ status = 'proposed', size = 'sm' }) {
  const configs = {
    proposed: {
      label: 'Proposed',
      bg: 'bg-amber-500/10',
      text: 'text-amber-800',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500',
    },
    approved: {
      label: 'Approved',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-800',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    executed: {
      label: 'Executed',
      bg: 'bg-blue-500/10',
      text: 'text-blue-800',
      border: 'border-blue-500/20',
      dot: 'bg-blue-500',
    },
    rolled_back: {
      label: 'Rolled Back',
      bg: 'bg-rose-500/10',
      text: 'text-rose-800',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500',
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-500/10',
      text: 'text-red-800',
      border: 'border-red-500/20',
      dot: 'bg-red-500 animate-ping',
    },
  };

  const cfg = configs[status.toLowerCase()] || configs.proposed;
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}