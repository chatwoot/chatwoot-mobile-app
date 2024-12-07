import { type AvailabilityStatus } from './common/AvailabilityStatus';
import { type UnixTimestamp } from './common/UnixTimestamp';

export interface Contact {
  additionalAttributes: {
    location?: string;
    companyName?: string;
    city?: string;
    country?: string;
    description?: string;
    createdAtIp?: string;
  };
  availabilityStatus?: AvailabilityStatus;
  createdAt: UnixTimestamp;
  customAttributes: Record<string, string>;
  email: string | null;
  id: number;
  identifier: string | null;
  lastActivityAt: UnixTimestamp | null;
  name: string | null;
  phoneNumber: string | null;
  thumbnail: string | null;
}
