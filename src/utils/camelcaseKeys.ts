/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Contact,
  Conversation,
  Message,
  ConversationMeta,
  Label,
  ConversationListMeta,
  Agent,
  Team,
  TypingData,
} from '@/types';
import type { Inbox } from '@/types/Inbox';
import type { NotificationMeta, Notification } from '@/types/Notification';
import { camelCase } from './camelCase';

export const transformConversation = (conversation: any): Conversation => {
  return camelCase(conversation, { deep: true }) as unknown as Conversation;
};

export const transformContact = (contact: any): Contact => {
  return camelCase(contact, { deep: true }) as unknown as Contact;
};

export const transformInbox = (inbox: any): Inbox => {
  return camelCase(inbox, { deep: true }) as unknown as Inbox;
};

export const transformMessage = (message: any): Message => {
  return camelCase(message, { deep: true }) as unknown as Message;
};

export const transformConversationListMeta = (meta: any): ConversationListMeta => {
  return camelCase(meta, { deep: true }) as unknown as ConversationListMeta;
};

export const transformNotificationMeta = (meta: any): NotificationMeta => {
  return camelCase(meta, { deep: true }) as unknown as NotificationMeta;
};

export const transformNotification = (notification: any): Notification => {
  return camelCase(notification, { deep: true }) as unknown as Notification;
};

export const transformLabel = (label: any): Label => {
  return camelCase(label, { deep: true }) as unknown as Label;
};

export const transformConversationMeta = (meta: any): ConversationMeta => {
  return camelCase(meta, { deep: true }) as unknown as ConversationMeta;
};

export const transformInboxAgent = (agent: any): Agent => {
  return camelCase(agent, { deep: true }) as unknown as Agent;
};

export const transformTeam = (team: any): Team => {
  return camelCase(team, { deep: true }) as unknown as Team;
};

export const transformTypingData = (typingData: any): TypingData => {
  return camelCase(typingData, { deep: true }) as unknown as TypingData;
};
