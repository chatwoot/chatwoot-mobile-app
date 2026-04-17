import { type AvailabilityStatus } from './common/AvailabilityStatus';
import { type Channel } from './common/Channel';
import { type UnixTimestamp } from './common/UnixTimestamp';

export interface ContactInbox {
  sourceId: string;
  inbox: {
    id: number;
    name?: string;
    channelType?: Channel;
  };
}

export interface Contact {
  additionalAttributes: {
    location?: string;
    companyName?: string;
    city?: string;
    country?: string;
    description?: string;
    createdAtIp?: string;
    socialProfiles?: Record<string, string>;
    twitterScreenName?: string;
    screenName?: string;
    telegramUsername?: string;
    socialTelegramUserName?: string;
  };
  availabilityStatus?: AvailabilityStatus;
  contactInboxes?: ContactInbox[];
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
}
