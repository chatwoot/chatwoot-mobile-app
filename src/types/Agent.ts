import { type AvailabilityStatus } from './common/AvailabilityStatus';
import { type UserRole } from './common/UserRole';

export interface Agent {
  id: number;
  accountId?: number | null;
  availabilityStatus?: AvailabilityStatus;
  autoOffline?: boolean;
  confirmed?: boolean;
  email?: string;
  availableName?: string | null;
  customAttributes?: object;
  name?: string | null;
  role?: UserRole;
  thumbnail?: string | null;
  type?: string;
}
