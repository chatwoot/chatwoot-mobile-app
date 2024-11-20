export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'snoozed' | 'all';

export type AllStatusTypes = ConversationStatus | 'all';

export type SortTypes = 'latest' | 'sort_on_created_at' | 'sort_on_priority';

export type AssigneeTypes = 'me' | 'unassigned' | 'all';

export type StatusCollection = { id: AllStatusTypes; icon: React.ReactNode };
