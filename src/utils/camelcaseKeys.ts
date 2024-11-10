/* eslint-disable @typescript-eslint/no-explicit-any */
import camelcaseKeys from 'camelcase-keys';
import { Contact, Conversation } from '@/types';
import type { Inbox } from '@/types/Inbox';

export const transformConversation = (conversation: any): Conversation => {
  return camelcaseKeys(conversation, { deep: true }) as unknown as Conversation;
};

export const transformContact = (contact: any): Contact => {
  return camelcaseKeys(contact, { deep: true }) as unknown as Contact;
};

export const transformInbox = (inbox: any): Inbox => {
  return camelcaseKeys(inbox, { deep: true }) as unknown as Inbox;
};
