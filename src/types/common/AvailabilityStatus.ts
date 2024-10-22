export type AvailabilityStatus = 'online' | 'offline' | 'busy';

export type UserStatusListItemType = {
  status: AvailabilityStatus;
  statusColor: string;
};
