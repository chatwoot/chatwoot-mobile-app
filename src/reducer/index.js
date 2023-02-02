import { combineReducers } from 'redux';

import auth from './authSlice';
import inbox from './inbox';
import conversation from './conversation';
import settings from './settings';
import notification from './notification';
import cannedResponseSlice from './cannedResponseSlice';
import conversationSlice from './conversationSlice';
import inboxAgentsSlice from './inboxAgentsSlice';

export const rootReducer = combineReducers({
  auth,
  inbox,
  conversation,
  settings,
  notification,
  cannedResponses: cannedResponseSlice,
  conversations: conversationSlice,
  inboxAgents: inboxAgentsSlice,
});

// export default (state, action) =>
//   action.type === 'USER_LOGOUT'
//     ? rootReducer({ settings: state.settings }, action)
//     : rootReducer(state, action);
