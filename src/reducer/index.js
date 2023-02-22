import { combineReducers } from 'redux';

import auth from './auth';
import conversation from './conversation';
import settings from './settings';
import notification from './notification';
import agent from './agent';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import customAttributeSlice from './customAttributeSlice';
import inboxSlice from './inboxSlice';
import inboxAgentsSlice from './inboxAgentsSlice';
import conversationTypingSlice from './conversationTypingSlice';
export const rootReducer = combineReducers({
  auth,
  conversation,
  settings,
  notification,
  agent,
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  customAttributes: customAttributeSlice,
  inboxes: inboxSlice,
  inboxAgents: inboxAgentsSlice,
  conversationTypingStatus: conversationTypingSlice,
});

// export default (state, action) =>
//   action.type === 'USER_LOGOUT'
//     ? rootReducer({ settings: state.settings }, action)
//     : rootReducer(state, action);
