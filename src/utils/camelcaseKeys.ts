/* eslint-disable @typescript-eslint/no-explicit-any */
import camelcaseKeys from 'camelcase-keys';
import { Contact, Conversation } from '@/types';

export const transformConversation = (conversation: any): Conversation => {
  return camelcaseKeys(conversation, { deep: true }) as unknown as Conversation;
};

export const transformContact = (contact: any): Contact => {
  return camelcaseKeys(contact, { deep: true }) as unknown as Contact;
};
