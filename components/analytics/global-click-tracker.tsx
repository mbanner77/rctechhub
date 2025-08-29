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
      const a = el.closest('a') as HTMLAnchorElement | null;
      const href = a?.href || undefined;
      const loc = typeof window !== 'undefined' ? window.location : undefined;
      const host = loc?.host;
      let kind = 'click_named';
      if (href && host) {
        try {
          const url = new URL(href);
          if (url.host && url.host !== host) kind = 'outbound_click';
          else kind = 'internal_click';
        } catch {}
      }
      const props: Record<string, any> = {
        id,
        text,
        href,
        target: a?.target,
        rel: a?.rel,
        path: loc?.pathname,
        host,
      };
      try {
        navigator.sendBeacon?.(
          '/api/analytics/track',
          new Blob([
            JSON.stringify({ name: kind, props })
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
