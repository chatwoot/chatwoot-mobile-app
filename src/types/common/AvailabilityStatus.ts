export type AvailabilityStatus = 'online' | 'offline' | 'busy';

export type AvailabilityStatusListItemType = {
  status: AvailabilityStatus;
  statusColor: string;
};
