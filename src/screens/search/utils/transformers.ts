import camelcaseKeys from 'camelcase-keys';

import type { Conversation } from '@/types/Conversation';
import { transformContact, transformMessage } from '@/utils/camelCaseKeys';

/**
 * Transform search conversation API response to Conversation type
 */
export function transformSearchConversation(conversation: unknown): Conversation {
  const transformed = camelcaseKeys(conversation as Record<string, unknown>, {
    deep: true,
  }) as Record<string, unknown>;

  if (transformed.message) {
    transformed.lastNonActivityMessage = transformMessage(transformed.message);
  } else {
    transformed.lastNonActivityMessage = null;
  }

  const inbox = transformed.inbox as { id?: number; channelType?: string } | undefined;

  const meta: Record<string, unknown> = {
    sender: transformed.contact ? transformContact(transformed.contact) : null,
    assignee: transformed.agent ? camelcaseKeys(transformed.agent, { deep: true }) : null,
    team: null,
    hmacVerified: null,
    channel: inbox?.channelType || null,
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

  if (inbox?.id && !transformed.inboxId) {
    transformed.inboxId = inbox.id;
  }

  return transformed as unknown as Conversation;
}
