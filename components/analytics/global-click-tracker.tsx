"use client";

import { useEffect } from "react";

export function GlobalClickTracker() {
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest<HTMLElement>('[data-analytics-id]');
      if (!el) return;
      const id = el.getAttribute('data-analytics-id') || 'unknown';
      const text = (el.textContent || '').trim().slice(0, 200);
      const href = (el as HTMLAnchorElement).href || undefined;
      try {
        navigator.sendBeacon?.(
          '/api/analytics/track',
          new Blob([
            JSON.stringify({ name: 'click_named', props: { id, text, href } })
          ], { type: 'application/json' })
        );
      } catch {
        // ignore
      }
    }
    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true } as any);
  }, []);
  return null;
}
