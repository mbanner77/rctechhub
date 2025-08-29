"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

function getUtmParams(sp: URLSearchParams) {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
  const out: Record<string, string> = {};
  keys.forEach((k) => {
    const v = sp.get(k);
    if (v) out[k] = v;
  });
  return out;
}

export function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasSentFirstVisit = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // First visit in this storage scope
    if (!sessionStorage.getItem("rc_first_visit")) {
      sessionStorage.setItem("rc_first_visit", "1");
      analytics.firstVisit();
      hasSentFirstVisit.current = true;
    }

    const utm = getUtmParams(searchParams);
    if (Object.keys(utm).length) {
      try {
        const existing = JSON.parse(localStorage.getItem("rc_utm") || "{}");
        const merged = { ...existing, ...utm, ts: Date.now() };
        localStorage.setItem("rc_utm", JSON.stringify(merged));
      } catch {}
    }

    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    analytics.pageView(fullPath, {
      ...(Object.keys(utm).length ? { utm } : {}),
      ...(hasSentFirstVisit.current ? { first_visit: true } : {}),
    });
    // reset flag after send
    hasSentFirstVisit.current = false;
  }, [pathname, searchParams]);

  return null;
}
