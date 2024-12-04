import { combineReducers } from 'redux';

import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';
import conversationFilterSlice from '@/store/conversation/conversationFilterSlice';
import conversationSelectedSlice from '@/store/conversation/conversationSelectedSlice';
import conversationHeaderSlice from '@/store/conversation/conversationHeaderSlice';
import conversationActionSlice from '@/store/conversation/conversationActionSlice';
import conversationSlice from '@/store/conversation/conversationSlice';
import inboxSlice from '@/store/inbox/inboxSlice';
import labelReducer from '@/store/label/labelSlice';
import contactSlice from '@/store/contact/contactSlice';
import assignableAgentSlice from '@/store/assignable-agent/assignableAgentSlice';
import conversationTypingSlice from '@/store/conversation/conversationTypingSlice';
import notificationSlice from '@/store/notification/notificationSlice';

import cannedResponseSlice from '@/reducer/cannedResponseSlice';
import conversationLabelsSlice from '@/reducer/conversationLabelSlice';
import customAttributeSlice from '@/reducer/customAttributeSlice';
import dashboardAppSlice from '@/reducer/dashboardAppSlice';
import conversationWatchersSlice from '@/reducer/conversationWatchersSlice';
import notificationFilterSlice from '@/store/notification/notificationFilterSlice';
export const appReducer = combineReducers({
  auth: authSlice,
  settings: settingsSlice,
  conversationFilter: conversationFilterSlice,
  selectedConversation: conversationSelectedSlice,
  conversationHeader: conversationHeaderSlice,
  conversations: conversationSlice,
  conversationAction: conversationActionSlice,
  contacts: contactSlice,
  labels: labelReducer,
  inboxes: inboxSlice,
  assignableAgents: assignableAgentSlice,
  conversationTyping: conversationTypingSlice,
  notifications: notificationSlice,
  notificationFilter: notificationFilterSlice,
  // TODO: Convert these to RTK toolkit typescript
  cannedResponses: cannedResponseSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  dashboardApps: dashboardAppSlice,
  conversationWatchers: conversationWatchersSlice,
});
