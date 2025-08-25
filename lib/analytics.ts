import { track } from '@vercel/analytics';

// Analytics helper for tracking user interactions
export const analytics = {
  // Service interactions
  serviceClick: (serviceName: string, category?: string) => {
    track('service_click', { service: serviceName, ...(category && { category }) });
  },

  serviceCompare: (services: string[]) => {
    track('service_compare', { services: services.join(','), count: services.length });
  },

  // Template interactions
  templateView: (templateId: string, category: string) => {
    track('template_view', { template: templateId, category });
  },

  templateDownload: (templateId: string) => {
    track('template_download', { template: templateId });
  },

  // Search and filtering
  search: (query: string, filters?: Record<string, any>) => {
    track('search', { query, ...(filters && { filters: JSON.stringify(filters) }) });
  },

  // Assessment interactions
  assessmentStart: (type: string) => {
    track('assessment_start', { type });
  },

  assessmentComplete: (type: string, score?: number) => {
    track('assessment_complete', { type, ...(score && { score }) });
  },

  // Dialog interactions
  dialogOpen: (dialogType: string, context?: string) => {
    track('dialog_open', { type: dialogType, ...(context && { context }) });
  },

  // Navigation interactions
  navigationClick: (page: string, source?: string) => {
    track('navigation_click', { page, ...(source && { source }) });
  },

  // Expert interactions
  expertView: (expertName: string, context?: string) => {
    track('expert_view', { expert: expertName, ...(context && { context }) });
  },

  // Pathfinder interactions
  pathfinderUnitView: (unitName: string, context?: string) => {
    track('pathfinder_unit_view', { unit: unitName, ...(context && { context }) });
  },

  // Filter interactions
  filterApply: (filterType: string, filterValue: string, context?: string) => {
    track('filter_apply', { 
      filter_type: filterType, 
      filter_value: filterValue, 
      ...(context && { context }) 
    });
  },

  filterClear: (filterType: string, context?: string) => {
    track('filter_clear', { 
      filter_type: filterType, 
      ...(context && { context }) 
    });
  }
};
