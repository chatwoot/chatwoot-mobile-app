import { combineReducers } from 'redux';

import auth from './authSlice';
import inboxSlice from './inboxSlice';
import settingsSlice from './settingsSlice';
import notification from './notification';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import inboxAgentsSlice from './inboxAgentsSlice';
import conversationTypingSlice from './conversationTypingSlice';
import labelSlice from './labelSlice';
import conversationLabelsSlice from './conversationLabelSlice';
import teamSlice from './teamSlice';
import customAttributeSlice from './customAttributeSlice';
export const rootReducer = combineReducers({
  auth,
  settings: settingsSlice,
  notification,
  conversationTypingStatus: conversationTypingSlice,
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  inboxAgents: inboxAgentsSlice,
  labels: labelSlice,
  inboxes: inboxSlice,
  conversationLabels: conversationLabelsSlice,
  teams: teamSlice,
  customAttributes: customAttributeSlice,
});
