/* eslint-disable @typescript-eslint/no-explicit-any */
import camelcaseKeys from 'camelcase-keys';
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
  DashboardApp,
  CustomAttribute,
  CannedResponse,
  Macro,
} from '@/types';
import type { Inbox } from '@/types/Inbox';
import type { NotificationMeta, Notification } from '@/types/Notification';
import { NotificationCreatedResponse } from '@/store/notification/notificationTypes';
import { NotificationRemovedResponse } from '@/store/notification/notificationTypes';

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

export const transformConversationListMeta = (meta: any): ConversationListMeta => {
  return camelcaseKeys(meta, { deep: true }) as unknown as ConversationListMeta;
};

export const transformNotificationMeta = (meta: any): NotificationMeta => {
  return camelcaseKeys(meta, { deep: true }) as unknown as NotificationMeta;
};

export const transformNotification = (notification: any): Notification => {
  return camelcaseKeys(notification, { deep: true }) as unknown as Notification;
};

export const transformLabel = (label: any): Label => {
  return camelcaseKeys(label, { deep: true }) as unknown as Label;
};

export const transformConversationMeta = (meta: any): ConversationMeta => {
  return camelcaseKeys(meta, { deep: true }) as unknown as ConversationMeta;
};

export const transformInboxAgent = (agent: any): Agent => {
  return camelcaseKeys(agent, { deep: true }) as unknown as Agent;
};

export const transformTeam = (team: any): Team => {
  return camelcaseKeys(team, { deep: true }) as unknown as Team;
};

export const transformTypingData = (typingData: any): TypingData => {
  return camelcaseKeys(typingData, { deep: true }) as unknown as TypingData;
};

export const transformDashboardApp = (dashboardApp: any): DashboardApp => {
  return camelcaseKeys(dashboardApp, { deep: true }) as unknown as DashboardApp;
};

export const transformCustomAttribute = (customAttribute: any): CustomAttribute => {
  return camelcaseKeys(customAttribute, { deep: true }) as unknown as CustomAttribute;
};

export const transformAgent = (agent: any): Agent => {
  return camelcaseKeys(agent, { deep: true }) as unknown as Agent;
};

export const transformNotificationCreatedResponse = (data: any): NotificationCreatedResponse => {
  return camelcaseKeys(data, { deep: true }) as unknown as NotificationCreatedResponse;
};

export const transformNotificationRemovedResponse = (data: any): NotificationRemovedResponse => {
  return camelcaseKeys(data, { deep: true }) as unknown as NotificationRemovedResponse;
};

export const transformCannedResponse = (cannedResponse: any): CannedResponse => {
  return camelcaseKeys(cannedResponse, { deep: true }) as unknown as CannedResponse;
};

export const transformMacro = (macro: any): Macro => {
  return camelcaseKeys(macro, { deep: true }) as unknown as Macro;
};
