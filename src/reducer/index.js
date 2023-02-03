import { combineReducers } from 'redux';

import auth from './authSlice';
import inboxSlice from './inboxSlice';
import conversation from './conversation';
import settings from './settings';
import notification from './notification';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import inboxAgentsSlice from './inboxAgentsSlice';
import conversationTypingSlice from './conversationTypingSlice';
export const rootReducer = combineReducers({
  auth,
  inbox: inboxSlice,
  conversation,
  settings,
  notification,
  conversationTypingStatus: conversationTypingSlice,
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  inboxAgents: inboxAgentsSlice,
});
