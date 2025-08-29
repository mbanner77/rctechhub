"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

export function EngagementTracker() {
  const startTsRef = useRef<number>(Date.now());
  const maxDepthRef = useRef<number>(0);
  const hbTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onScroll() {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
      const docHeight = Math.max(
        body.scrollHeight,
        doc.scrollHeight,
        body.offsetHeight,
        doc.offsetHeight,
        body.clientHeight,
        doc.clientHeight
      );
      const viewport = window.innerHeight || doc.clientHeight;
      const current = ((scrollTop + viewport) / docHeight) * 100;
      if (current > maxDepthRef.current) {
        maxDepthRef.current = current;
        const rounded = Math.min(100, Math.round(maxDepthRef.current / 10) * 10);
        // Only send at 10% increments
        if (rounded % 10 === 0) {
          analytics.scrollDepth(rounded);
        }
      }
      lastActiveRef.current = Date.now();
    }

    function onPointer() { lastActiveRef.current = Date.now(); }
    function onKey() { lastActiveRef.current = Date.now(); }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("keydown", onKey, { passive: true });

    // Heartbeat every 15s with active time since last beat
    hbTimerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastActiveRef.current;
      const active = Math.max(0, 15000 - Math.min(15000, delta));
      if (active > 0) analytics.heartbeat(active);
      lastActiveRef.current = now;
    }, 15000);

    function onLeave() {
      const total = Date.now() - startTsRef.current;
      analytics.pageLeave(total);
    }

    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
    });

    // initial scroll evaluation
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("pointerdown", onPointer as any);
      window.removeEventListener("keydown", onKey as any);
      window.removeEventListener("pagehide", onLeave as any);
      window.removeEventListener("beforeunload", onLeave as any);
      document.removeEventListener("visibilitychange", onLeave as any);
      if (hbTimerRef.current) clearInterval(hbTimerRef.current);
    };
  }, []);

  return null;
}
