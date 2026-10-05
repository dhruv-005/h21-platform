import React from 'react';

/**
 * GlassPanel Component
 * Reusable spatial glass container with customizable elevation and accent gradients.
 */
export default function GlassPanel({
  children,
  variant = 'light', // 'light' | 'dark' | 'ruby' | 'amethyst' | 'terracotta'
  className = '',
  style = {},
}) {
  const variantClass = {
    light: 'glass-panel-elevated border-white/50 text-ink',
    dark: 'glass-panel-dark border-white/10 text-white',
    ruby: 'bg-gradient-to-br from-ruby/15 to-ruby-dark/30 border-ruby/30 text-ink backdrop-blur-xl',
    amethyst: 'bg-gradient-to-br from-amethyst/15 to-amethyst-dark/30 border-amethyst/30 text-ink backdrop-blur-xl',
    terracotta: 'bg-gradient-to-br from-terracotta/15 to-terracotta-dark/30 border-terracotta/30 text-ink backdrop-blur-xl',
  }[variant] || 'glass-panel-elevated border-white/50 text-ink';

  return (
    <div
      className={`rounded-2xl p-5 border shadow-card-spatial ${variantClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}