import { combineReducers } from 'redux';

import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';
import notificationSlice from '@/store/notification/notificationSlice';
import conversationFilterSlice from '@/store/conversation/conversationFilterSlice';
import conversationSelectedSlice from '@/store/conversation/conversationSelectedSlice';
import conversationHeaderSlice from '@/store/conversation/conversationHeaderSlice';
import conversationActionSlice from '@/store/conversation/conversationActionSlice';
import conversationSlice from '@/store/conversation/conversationSlice';
import contactSlice from '@/store/contact/contactSlice';
import inboxSlice from '@/store/inbox/inboxSlice';
import conversationTypingSlice from '@/store/conversation/conversationTypingSlice';
import labelSlice from '@/store/label/labelSlice';
import sendMessageSlice from '@/store/conversation/sendMessageSlice';
import inboxAgentSlice from '@/store/inbox-agent/inboxAgentSlice';
import contactLabelsSlice from '@/store/contact/contactLabelSlice';
import contactConversationSlice from '@/store/contact/contactConversationSlice';
import teamSlice from '@/store/team/teamSlice';

import cannedResponseSlice from '@/reducer/cannedResponseSlice';
import conversationLabelsSlice from '@/reducer/conversationLabelSlice';
import customAttributeSlice from '@/reducer/customAttributeSlice';
import dashboardAppSlice from '@/reducer/dashboardAppSlice';
import conversationWatchersSlice from '@/reducer/conversationWatchersSlice';

export const appReducer = combineReducers({
  auth: authSlice,
  notifications: notificationSlice,
  settings: settingsSlice,
  conversationFilter: conversationFilterSlice,
  selectedConversation: conversationSelectedSlice,
  conversationHeader: conversationHeaderSlice,
  conversations: conversationSlice,
  conversationAction: conversationActionSlice,
  contacts: contactSlice,
  labels: labelSlice,
  inboxes: inboxSlice,
  conversationTyping: conversationTypingSlice,
  sendMessage: sendMessageSlice,
  inboxAgents: inboxAgentSlice,
  contactLabels: contactLabelsSlice,
  contactConversations: contactConversationSlice,
  teams: teamSlice,
  // TODO: Convert these to RTK toolkit typescript
  cannedResponses: cannedResponseSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  dashboardApps: dashboardAppSlice,
  conversationWatchers: conversationWatchersSlice,
});
