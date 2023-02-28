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
export const rootReducer = combineReducers({
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
});
