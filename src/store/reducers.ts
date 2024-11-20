import { combineReducers } from 'redux';

import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';
import conversationFilterSlice from '@/store/conversation/conversationFilterSlice';
import conversationSelectedSlice from '@/store/conversation/conversationSelectedSlice';
import conversationHeaderSlice from '@/store/conversation/conversationHeaderSlice';
import conversationActionSlice from '@/store/conversation/conversationActionSlice';
import conversationSlice from '@/store/conversation/conversationSlice';
import contactSlice from '@/store/contact/contactSlice';
import inboxSlice from '@/store/inbox/inboxSlice';
import labelSlice from '@/store/label/labelSlice';
import inboxAgentSlice from '@/store/inbox-agent/inboxAgentSlice';

import cannedResponseSlice from '@/reducer/cannedResponseSlice';
import conversationLabelsSlice from '@/reducer/conversationLabelSlice';
import customAttributeSlice from '@/reducer/customAttributeSlice';
import dashboardAppSlice from '@/reducer/dashboardAppSlice';
import conversationWatchersSlice from '@/reducer/conversationWatchersSlice';

export const appReducer = combineReducers({
  auth: authSlice,
  // notifications: notificationSlice,
  settings: settingsSlice,
  conversationFilter: conversationFilterSlice,
  selectedConversation: conversationSelectedSlice,
  conversationHeader: conversationHeaderSlice,
  conversations: conversationSlice,
  conversationAction: conversationActionSlice,
  contacts: contactSlice,
  labels: labelSlice,
  inboxes: inboxSlice,
  inboxAgents: inboxAgentSlice,
  // TODO: Convert these to RTK toolkit typescript
  cannedResponses: cannedResponseSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  dashboardApps: dashboardAppSlice,
  conversationWatchers: conversationWatchersSlice,
});
