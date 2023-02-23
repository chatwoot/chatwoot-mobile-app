import { combineReducers } from 'redux';

import auth from './auth';
import conversation from './conversation';
import settings from './settings';
import agent from './agent';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import labelSlice from './labelSlice';
import conversationLabelsSlice from './conversationLabelSlice';
import customAttributeSlice from './customAttributeSlice';
import inboxSlice from './inboxSlice';
import inboxAgentsSlice from './inboxAgentsSlice';
import conversationTypingSlice from './conversationTypingSlice';
import teamSlice from './teamSlice';
import notificationSlice from './notificationSlice';
export const rootReducer = combineReducers({
  auth,
  conversation,
  settings,
  agent,
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  labels: labelSlice,
  conversationLabels: conversationLabelsSlice,
  customAttributes: customAttributeSlice,
  inboxes: inboxSlice,
  inboxAgents: inboxAgentsSlice,
  conversationTypingStatus: conversationTypingSlice,
  teams: teamSlice,
  notifications: notificationSlice,
});

// export default (state, action) =>
//   action.type === 'USER_LOGOUT'
//     ? rootReducer({ settings: state.settings }, action)
//     : rootReducer(state, action);
