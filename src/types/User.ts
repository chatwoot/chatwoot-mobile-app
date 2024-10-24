import { UserRole } from './common/UserRole';
import type { Account } from './Account';
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
};
