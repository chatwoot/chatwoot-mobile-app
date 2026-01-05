export const PRIORITY_OPTIONS = [
  { value: 'none', label: 'None', color: '#6B7280' },
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'urgent', label: 'Urgent', color: '#DC2626' },
] as const;

export const MODAL_SNAP_POINTS = {
  EDIT_ITEM: ['95%'],
  MANAGE_AGENTS: ['90%'],
  CREATE_STAGE: ['80%'],
} as const;

export const RELOAD_DELAYS = {
  ITEM: 300,
  FUNNEL: 200,
  AGENT_OPERATION: 300,
} as const;

export const TIMEOUTS = {
  UPDATE_SAFETY: 10000,
  BACKEND_PROCESSING: 500,
} as const;
