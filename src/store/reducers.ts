import { combineReducers } from 'redux';

import authSlice from '@/store/auth/authSlice';
import settingsSlice from '@/store/settings/settingsSlice';

import inboxSlice from '@/reducer/inboxSlice';
import cannedResponseSlice from '@/reducer/cannedResponseSlice';
import conversationSlice from '@/reducer/conversationSlice';
import inboxAgentsSlice from '@/reducer/inboxAgentsSlice';
import conversationTypingSlice from '@/reducer/conversationTypingSlice';
import labelSlice from '@/reducer/labelSlice';
import conversationLabelsSlice from '@/reducer/conversationLabelSlice';
import teamSlice from '@/reducer/teamSlice';
import customAttributeSlice from '@/reducer/customAttributeSlice';
import notificationSlice from '@/reducer/notificationSlice';
import dashboardAppSlice from '@/reducer/dashboardAppSlice';
import conversationWatchersSlice from '@/reducer/conversationWatchersSlice';
import contactsSlice from '@/reducer/contactSlice';

export const appReducer = combineReducers({
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  labels: labelSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  inboxes: inboxSlice,
  inboxAgents: inboxAgentsSlice,
  conversationTypingStatus: conversationTypingSlice,
  settings: settingsSlice,
  teams: teamSlice,
  auth: authSlice,
  notifications: notificationSlice,
  dashboardApps: dashboardAppSlice,
  conversationWatchers: conversationWatchersSlice,
  contacts: contactsSlice,
});
