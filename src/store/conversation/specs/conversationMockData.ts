import type { ConversationListAPIResponse } from '../conversationTypes';
import { Conversation } from '@/types';

export const conversation: Conversation = {
  id: 250,
  accountId: 1,
  additionalAttributes: {},
  agentLastSeenAt: 1,
  assigneeLastSeenAt: 1,
  canReply: true,
  contactLastSeenAt: 1,
  createdAt: 1,
  customAttributes: {},
  firstReplyCreatedAt: 1,
  inboxId: 1,
  labels: [],
  lastActivityAt: 1,
  muted: false,
  priority: 'low',
  snoozedUntil: null,
  status: 'open',
  unreadCount: 1,
  uuid: '123',
  waitingSince: 1,
  messages: [],
  lastNonActivityMessage: null,
  meta: {
    sender: {
      id: 1,
      name: 'Test Sender',
      thumbnail: '',
      email: '',
      phoneNumber: null,
      additionalAttributes: {},
      customAttributes: {},
      createdAt: 1,
      identifier: null,
      lastActivityAt: 1,
    },
    assignee: {
      id: 1,
      name: 'Test Assignee',
      thumbnail: '',
      email: '',
      customAttributes: {},
    },
    team: null,
    hmacVerified: false,
    channel: 'Channel::Whatsapp',
  },
  timestamp: 1,
  slaPolicyId: null,
  appliedSla: null,
};

export const conversationListResponse: ConversationListAPIResponse = {
  data: {
    meta: {
      mineCount: 1,
      unassignedCount: 1,
      allCount: 1,
    },
    payload: [conversation],
  },
};

export const smallCaseConversation = {
  id: 250,
  account_id: 1,
  additional_attributes: {},
  agent_last_seen_at: 1,
  assignee_last_seen_at: 1,
  can_reply: true,
  contact_last_seen_at: 1,
  created_at: 1,
  custom_attributes: {},
  first_reply_created_at: 1,
  inbox_id: 1,
  labels: [],
};
