export type AvailabilityStatus = 'online' | 'offline' | 'busy' | 'typing';

export type AvailabilityStatusListItemType = {
  status: AvailabilityStatus;
  statusColor: string;
};

export type PresenceUpdateData = {
  account_id: number;
  contacts: Record<number, AvailabilityStatus>;
  users: Record<number, AvailabilityStatus>;
  work_preferences?: WorkPreferences;
};

export type WorkPreferences = {
  accepts_conversations: boolean;
  accepts_calls: boolean;
};
