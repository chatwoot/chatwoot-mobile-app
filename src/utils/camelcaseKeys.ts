import camelcaseKeys from 'camelcase-keys';
import { Conversation } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformConversation = (conversation: any): Conversation => {
  return camelcaseKeys(conversation, { deep: true }) as unknown as Conversation;
};
