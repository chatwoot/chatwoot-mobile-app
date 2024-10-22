import { type Agent } from './Agent';
import { Channel, ConversationPriority, ConversationStatus, UnixTimestamp } from './common';
import { Contact } from './Contact';
import { ContentType, MessageStatus, MessageType } from './Message';
import { Team } from './Team';

interface ConversationLastMessage {
  id: number;
  content: string;
  accountId: number;
  inboxId: number;
  conversationId: number;
  messageType: MessageType;
  createdAt: UnixTimestamp;
  updatedAt: string;
  private: boolean;
  status: MessageStatus;
  sourceId: null | string;
  contentType: ContentType;
  contentAttributes: Record<string, any>; // Adjust the type as needed
  senderType: null | string;
  senderId: null | string;
  externalSourceIds: {
    slack: string | null;
  };
  additionalAttributes: Record<string, any>; // Adjust the type as needed
  processedMessageContent: string;
  sentiment: Record<string, any>; // Adjust the type as needed
  conversation: {
    assigneeId: null | number;
    unreadCount: number;
    lastActivityAt: number;
    contactInbox: {
      sourceId: string;
    };
  };
}

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

  messages: ConversationLastMessage[];

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
}
