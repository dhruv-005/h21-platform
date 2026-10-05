import { useEffect } from 'react';

/**
 * EntranceAnimator Component
 * Orchestrates entrance keyframes by applying .entrance-active to the root HTML document
 * and guarantees cleanup via timeout failsafe or terminal animation listeners.
 */
export default function EntranceAnimator({ durationMs = 3200 }) {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Activate entrance timeline
    document.documentElement.classList.add('entrance-active');

    // Failsafe timer to remove class and restore steady state
    const failsafeTimer = setTimeout(() => {
      document.documentElement.classList.remove('entrance-active');
    }, durationMs);

    return () => {
      clearTimeout(failsafeTimer);
      document.documentElement.classList.remove('entrance-active');
    };
  }, [durationMs]);

  return null;
}
