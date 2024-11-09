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

import inboxSlice from '@/reducer/inboxSlice';
import cannedResponseSlice from '@/reducer/cannedResponseSlice';
import inboxAgentsSlice from '@/reducer/inboxAgentsSlice';
import conversationTypingSlice from '@/reducer/conversationTypingSlice';
import labelSlice from '@/reducer/labelSlice';
import conversationLabelsSlice from '@/reducer/conversationLabelSlice';
import teamSlice from '@/reducer/teamSlice';
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

  cannedResponses: cannedResponseSlice,
  labels: labelSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  inboxes: inboxSlice,
  inboxAgents: inboxAgentsSlice,
  conversationTypingStatus: conversationTypingSlice,
  teams: teamSlice,
  dashboardApps: dashboardAppSlice,
  conversationWatchers: conversationWatchersSlice,
});
