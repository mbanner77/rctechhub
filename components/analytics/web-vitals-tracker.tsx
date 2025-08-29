"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export function WebVitalsTracker() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;

    const observers: PerformanceObserver[] = [];

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const last = entries[entries.length - 1] as any;
        if (last && last.value != null) {
          analytics.webVitals({ name: "LCP", value: last.value, id: last.id });
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true } as any);
      observers.push(lcpObserver);
    } catch {}

    try {
      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value || 0;
          }
        }
        analytics.webVitals({ name: "CLS", value: clsValue });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true } as any);
      observers.push(clsObserver);
    } catch {}

    try {
      // First Input Delay (FID) / Event Timing (INP in modern spec, but we'll stick to FID-like)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any) {
          const value = entry.processingStart - entry.startTime;
          if (value >= 0) {
            analytics.webVitals({ name: "FID", value });
            break;
          }
        }
      });
      fidObserver.observe({ type: "first-input", buffered: true } as any);
      observers.push(fidObserver);
    } catch {}

    return () => {
      observers.forEach((o) => {
        try { o.disconnect(); } catch {}
      });
    };
  }, []);

  return null;
}
