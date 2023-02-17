import { combineReducers } from 'redux';

import auth from './auth';
import inbox from './inbox';
import conversation from './conversation';
import settings from './settings';
import notification from './notification';
import agent from './agent';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import customAttributeSlice from './customAttributeSlice';
export const rootReducer = combineReducers({
  auth,
  inbox,
  conversation,
  settings,
  notification,
  agent,
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  customAttributes: customAttributeSlice,
});

// export default (state, action) =>
//   action.type === 'USER_LOGOUT'
//     ? rootReducer({ settings: state.settings }, action)
//     : rootReducer(state, action);
