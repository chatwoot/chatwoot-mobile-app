import camelcaseKeys from 'camelcase-keys';

import type { Conversation } from '@/types/Conversation';
import type { Channel } from '@/types';
import { transformContact, transformMessage } from '@/utils/camelCaseKeys';

type SearchConversationRecord = Record<string, unknown> & {
  message?: unknown;
  contact?: unknown;
  agent?: unknown;
  meta?: Record<string, unknown>;
  messages?: unknown;
  inbox?: {
    id?: number;
    channelType?: Channel;
  };
  inboxId?: number;
};

/**
 * Transform search conversation API response to Conversation type
 */
export function transformSearchConversation(conversation: unknown): Conversation {
  const transformed = camelcaseKeys(conversation as Record<string, unknown>, {
    deep: true,
  }) as SearchConversationRecord;

  if (transformed.message) {
    transformed.lastNonActivityMessage = transformMessage(transformed.message);
  } else {
    transformed.lastNonActivityMessage = null;
  }

  const meta: Record<string, unknown> = {
    sender: transformed.contact ? transformContact(transformed.contact) : null,
    assignee: transformed.agent ? camelcaseKeys(transformed.agent, { deep: true }) : null,
    team: null,
    hmacVerified: null,
    channel: transformed.inbox?.channelType || null,
  };

  if (transformed.meta) {
    transformed.meta = {
      ...transformed.meta,
      ...meta,
    };
  } else {
    transformed.meta = meta;
  }

  if (!transformed.messages) {
    transformed.messages = [];
  }

  if (transformed.inbox?.id && !transformed.inboxId) {
    transformed.inboxId = transformed.inbox.id;
  }

  return transformed as unknown as Conversation;
}
