import { type Agent } from './Agent';
import { Channel, ConversationPriority, ConversationStatus, UnixTimestamp } from './common';
import { SLA } from './common/SLA';
import { Contact } from './Contact';
import { Message } from './Message';
import { Team } from './Team';

export interface Conversation {
  accountId: number;
  additionalAttributes: object;
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

  meta: {
    sender: Contact;
    assignee: Agent;
    team: Team;
    hmacVerified: boolean | null;

    // Avoid this attribute and resolve it from Inbox
    channel: Channel;
  };

  // Deprecated
  timestamp: UnixTimestamp;

  slaPolicyId: number | null;

  appliedSla: SLA | null;
}

export interface ConversationMeta {
  mineCount: number;
  unassignedCount: number;
  allCount: number;
}

export interface ConversationAdditionalAttributes {
  type?: string;
}
