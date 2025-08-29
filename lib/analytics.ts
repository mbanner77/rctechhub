// Lightweight analytics client: send events to our API
function getClientCtx() {
  if (typeof window === 'undefined') return {};
  try {
    const d = document;
    const w = window;
    const ctx: Record<string, any> = {
      vp_w: w.innerWidth,
      vp_h: w.innerHeight,
      lang: (navigator.languages && navigator.languages[0]) || navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      title: d.title,
    };
    return ctx;
  } catch {
    return {};
  }
}

function canTrack() {
  if (typeof window === 'undefined') return true; // allow on server-side API
  try {
    const dnt = (navigator as any).doNotTrack === '1' || (window as any).doNotTrack === '1';
    const optOut = localStorage.getItem('rc_analytics_opt_out') === '1';
    return !dnt && !optOut;
  } catch {
    return true;
  }
}

async function postEvent(name: string, props?: Record<string, any>) {
  if (!canTrack()) return;
  try {
    // fire-and-forget; do not await in callers
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, props: { ...(props || {}), ...getClientCtx() } }),
      keepalive: true,
    });
  } catch (e) {
    // swallow errors in client analytics
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics] failed to send', e);
    }
  }
}

// Analytics helper for tracking user interactions
export const analytics = {
  // Consent controls
  optOut: () => { try { localStorage.setItem('rc_analytics_opt_out', '1'); } catch {} },
  optIn: () => { try { localStorage.removeItem('rc_analytics_opt_out'); } catch {} },
  isOptedOut: (): boolean => { try { return localStorage.getItem('rc_analytics_opt_out') === '1'; } catch { return false } },

  // Page views and sessions
  pageView: (path: string, extra?: Record<string, any>) => {
    postEvent('page_view', { path, ...(extra || {}) });
  },

  firstVisit: () => {
    postEvent('first_visit');
  },

  // Engagement
  scrollDepth: (percent: number) => {
    postEvent('scroll_depth', { percent: Math.max(0, Math.min(100, Math.round(percent))) });
  },
  heartbeat: (msActive: number) => {
    postEvent('heartbeat', { ms_active: Math.max(0, Math.round(msActive)) });
  },
  pageLeave: (msTotal: number) => {
    postEvent('page_leave', { ms_total: Math.max(0, Math.round(msTotal)) });
  },

  // Web vitals (LCP, CLS, FID)
  webVitals: (metric: { name: string; value: number; id?: string }) => {
    postEvent('web_vitals', { metric: metric.name, value: metric.value, id: metric.id });
  },

  // Forms
  formSubmit: (id: string, status: 'success' | 'error', extra?: Record<string, any>) => {
    postEvent('form_submit', { id, status, ...(extra || {}) });
  },

  // Service interactions
  serviceClick: (serviceName: string, category?: string) => {
    postEvent('service_click', { service: serviceName, ...(category && { category }) });
  },

  serviceCompare: (services: string[]) => {
    postEvent('service_compare', { services: services.join(','), count: services.length });
  },

  // Template interactions
  templateView: (templateId: string, category: string) => {
    postEvent('template_view', { template: templateId, category });
  },

  templateDownload: (templateId: string) => {
    postEvent('template_download', { template: templateId });
  },

  // Search and filtering
  search: (query: string, filters?: Record<string, any>) => {
    postEvent('search', { query, ...(filters && { filters: JSON.stringify(filters) }) });
  },

  // Assessment interactions
  assessmentStart: (type: string) => {
    postEvent('assessment_start', { type });
  },

  assessmentComplete: (type: string, score?: number) => {
    postEvent('assessment_complete', { type, ...(score && { score }) });
  },

  // Dialog interactions
  dialogOpen: (dialogType: string, context?: string) => {
    postEvent('dialog_open', { type: dialogType, ...(context && { context }) });
  },

  // Navigation interactions
  navigationClick: (page: string, source?: string) => {
    postEvent('navigation_click', { page, ...(source && { source }) });
  },

  // Expert interactions
  expertView: (expertName: string, context?: string) => {
    postEvent('expert_view', { expert: expertName, ...(context && { context }) });
  },

  // Pathfinder interactions
  pathfinderUnitView: (unitName: string, context?: string) => {
    postEvent('pathfinder_unit_view', { unit: unitName, ...(context && { context }) });
  },

  // Filter interactions
  filterApply: (filterType: string, filterValue: string, context?: string) => {
    postEvent('filter_apply', { 
      filter_type: filterType, 
      filter_value: filterValue, 
      ...(context && { context }) 
    });
  },

  filterClear: (filterType: string, context?: string) => {
    postEvent('filter_clear', { 
      filter_type: filterType, 
      ...(context && { context }) 
    });
  }
};
