import camelcaseKeys from 'camelcase-keys';

import type { Conversation } from '@/types/Conversation';
import { transformContact, transformMessage } from '@/utils/camelCaseKeys';

/**
 * Transform search conversation API response to Conversation type
 */
export function transformSearchConversation(conversation: any): Conversation {
  const transformed = camelcaseKeys(conversation, { deep: true }) as any;

  if (transformed.message) {
    transformed.lastNonActivityMessage = transformMessage(transformed.message);
  } else {
    transformed.lastNonActivityMessage = null;
  }

  const meta: any = {
    sender: transformed.contact ? transformContact(transformed.contact) : null,
    assignee: transformed.agent ? camelcaseKeys(transformed.agent, { deep: true }) : null,
    team: null,
    hmacVerified: null,
    channel: transformed.inbox?.channelType || transformed.inbox?.channel_type || null,
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

  return transformed as Conversation;
}
