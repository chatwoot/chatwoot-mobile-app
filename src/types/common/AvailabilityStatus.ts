export type AvailabilityStatus = 'online' | 'offline' | 'busy' | 'typing';

export type AvailabilityStatusListItemType = {
  status: AvailabilityStatus;
  statusColor: string;
};

export type PresenceUpdateData = {
  account_id: number;
  contacts: Record<number, AvailabilityStatus>;
  users: Record<number, AvailabilityStatus>;
};
