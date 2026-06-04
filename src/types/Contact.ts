import { type AvailabilityStatus } from './common/AvailabilityStatus';
import { type UnixTimestamp } from './common/UnixTimestamp';

export interface Contact {
  additionalAttributes: {
    location?: string;
    companyId?: number;
    companyName?: string;
    company?: { id?: number; name?: string };
    city?: string;
    country?: string;
    description?: string;
    role?: string;
    createdAtIp?: string;
    socialProfiles?: Record<string, string>;
    twitterScreenName?: string;
    telegramUsername?: string;
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
  type: string;
  company?: { id?: number; name?: string };
  companyId?: number;
  companyName?: string;
}
