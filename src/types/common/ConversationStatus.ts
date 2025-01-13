export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'snoozed' | 'all';

export type AllStatusTypes = ConversationStatus | 'all';

export type SortTypes = 'latest' | 'sort_on_created_at' | 'sort_on_priority';

export type AssigneeTypes = 'me' | 'unassigned' | 'all';

export type StatusCollection = { id: AllStatusTypes; icon: React.ReactNode };

export const AssigneeOptions: Record<AssigneeTypes, string> = {
  me: 'Mine',
  unassigned: 'Unassigned',
  all: 'All',
};

export const StatusOptions: Record<AllStatusTypes, string> = {
  all: 'All',
  open: 'Open',
  resolved: 'Resolved',
  pending: 'Pending',
  snoozed: 'Snoozed',
};

export const SortOptions: Record<SortTypes, string> = {
  latest: 'Latest',
  sort_on_created_at: 'Created At',
  sort_on_priority: 'Priority',
};

export const PriorityOptions: Record<string, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
