/* eslint-disable @typescript-eslint/no-explicit-any */
import camelcaseKeys from 'camelcase-keys';
import { Contact, Conversation, Message, ConversationMeta } from '@/types';
import type { Inbox } from '@/types/Inbox';
import type { NotificationMeta, Notification } from '@/types/Notification';

export const transformConversation = (conversation: any): Conversation => {
  return camelcaseKeys(conversation, { deep: true }) as unknown as Conversation;
};

export const transformContact = (contact: any): Contact => {
  return camelcaseKeys(contact, { deep: true }) as unknown as Contact;
};

export const transformInbox = (inbox: any): Inbox => {
  return camelcaseKeys(inbox, { deep: true }) as unknown as Inbox;
};

export const transformMessage = (message: any): Message => {
  return camelcaseKeys(message, { deep: true }) as unknown as Message;
};

export const transformConversationMeta = (meta: any): ConversationMeta => {
  return camelcaseKeys(meta, { deep: true }) as unknown as ConversationMeta;
};

export const transformNotificationMeta = (meta: any): NotificationMeta => {
  return camelcaseKeys(meta, { deep: true }) as unknown as NotificationMeta;
};

export const transformNotification = (notification: any): Notification => {
  return camelcaseKeys(notification, { deep: true }) as unknown as Notification;
};
