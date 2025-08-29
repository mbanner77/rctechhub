"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

// Tracks submits for forms or buttons wrapped with data-analytics-id
export function FormTracker() {
  useEffect(() => {
    function onSubmit(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = (target as HTMLElement).closest('[data-analytics-id]') as HTMLElement | null;
      const id = el?.getAttribute('data-analytics-id') || (el?.id ?? 'unknown');
      const form = el as HTMLFormElement;
      const method = (form?.method || '').toUpperCase() || undefined;
      const action = form?.action || undefined;
      analytics.formSubmit(id, 'success', { method, action });
    }

    // Delegate on document to cover dynamically added forms
    document.addEventListener('submit', onSubmit, { capture: true });
    return () => document.removeEventListener('submit', onSubmit as any, true);
  }, []);
  return null;
}
