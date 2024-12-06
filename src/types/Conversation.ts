import { type Agent } from './Agent';
import { Channel, ConversationPriority, ConversationStatus, UnixTimestamp } from './common';
import { SLA, SLAEvent } from './common/SLA';
import { Contact } from './Contact';
import { Message } from './Message';
import { Team } from './Team';

export interface Conversation {
  accountId: number;
  additionalAttributes: ConversationAdditionalAttributes;
  agentLastSeenAt: UnixTimestamp;
  assigneeLastSeenAt: UnixTimestamp;
  canReply: boolean;
  contactLastSeenAt: UnixTimestamp;
  createdAt: UnixTimestamp;
  customAttributes: object;
  firstReplyCreatedAt: UnixTimestamp;
  id: number;
  inboxId: number;
  labels: string[];
  lastActivityAt: UnixTimestamp;
  muted: boolean;
  priority: ConversationPriority;
  snoozedUntil: UnixTimestamp | null;
  status: ConversationStatus;
  unreadCount: number;
  uuid: string;
  waitingSince: UnixTimestamp;

  messages: Message[];

  lastNonActivityMessage: Message | null;

  meta: ConversationMeta;

  // Deprecated
  timestamp: UnixTimestamp;

  slaPolicyId: number | null;

  appliedSla: SLA | null;

  slaEvents: SLAEvent[];
}

export interface ConversationListMeta {
  mineCount: number;
  unassignedCount: number;
  allCount: number;
}

export interface ConversationAdditionalAttributes {
  browser?: {
    deviceName: string;
    browserName: string;
    platformName: string;
    browserVersion: string;
    platformVersion: string;
  };
  referer?: string;
  initiatedAt?: {
    timestamp: string;
  };
  browserLanguage?: string;
  type?: string;
}
export interface ConversationMeta {
  sender: Contact;
  assignee: Agent;
  team: Team | null;
  hmacVerified: boolean | null;
  channel: Channel;
}
