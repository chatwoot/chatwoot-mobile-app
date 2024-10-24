import { combineReducers } from 'redux';

import authSlice from './authSlice';
import inboxSlice from './inboxSlice';
import settingsSlice from './settingsSlice';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import inboxAgentsSlice from './inboxAgentsSlice';
import conversationTypingSlice from './conversationTypingSlice';
import labelSlice from './labelSlice';
import conversationLabelsSlice from './conversationLabelSlice';
import teamSlice from './teamSlice';
import customAttributeSlice from './customAttributeSlice';
import notificationSlice from './notificationSlice';
import dashboardAppSlice from './dashboardAppSlice';
import conversationWatchersSlice from './conversationWatchersSlice';
import contactsSlice from './contactSlice';
import cannedTemplatesSlice from './cannedTemplates';
import authv4Slice from '../store/auth/authSlice';

export const appReducer = combineReducers({
  cannedTemplates: cannedTemplatesSlice,
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
  authv4: authv4Slice,
});
