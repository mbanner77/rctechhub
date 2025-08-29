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

async function postEvent(name: string, props?: Record<string, any>) {
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
  // Page views and sessions
  pageView: (path: string, extra?: Record<string, any>) => {
    postEvent('page_view', { path, ...(extra || {}) });
  },

  firstVisit: () => {
    postEvent('first_visit');
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
