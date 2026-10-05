import React from 'react';

/**
 * LearnMoreButton Component
 * Themed pill-shaped action button with fluid scaling (--u) and elevation hover micro-interactions.
 */
export default function LearnMoreButton({
  label = "Learn More",
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) {
  return (
    <div className={`learn-more ${className}`}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
      >
        {label}
      </button>
    </div>
  );
}
