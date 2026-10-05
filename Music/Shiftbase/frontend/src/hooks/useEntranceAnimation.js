import { useEffect } from 'react';

/**
 * useEntranceAnimation Hook
 * Attaches the .entrance-active CSS class to document.documentElement
 * and ensures reliable teardown after duration timeout.
 */
export function useEntranceAnimation(durationMs = 3200) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    document.documentElement.classList.add('entrance-active');

    const timer = setTimeout(() => {
      document.documentElement.classList.remove('entrance-active');
    }, durationMs);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('entrance-active');
    };
  }, [durationMs]);
}