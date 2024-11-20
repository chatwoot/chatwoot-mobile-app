import type { Account } from './Account';
import type { AvailabilityStatus } from './common/AvailabilityStatus';

export type UserRole = 'administrator' | 'agent';

export type User = {
  id: number;
  name: string;
  account_id: number;
  accounts: Account[];
  email: string;
  pubsub_token: string;
  avatar_url: string;
  available_name: string;
  role: UserRole;
  identifier_hash: string;
  availability: string;
  thumbnail: string;
  availability_status: AvailabilityStatus;
};
