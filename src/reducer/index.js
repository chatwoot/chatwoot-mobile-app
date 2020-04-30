import { combineReducers } from 'redux';

import auth from './auth';
import inbox from './inbox';
import conversation from './conversation';
import settings from './settings';

const rootReducer = combineReducers({
  auth,
  inbox,
  conversation,
  settings,
});

export default (state, action) =>
  action.type === 'USER_LOGOUT'
    ? rootReducer({ settings: state.settings }, action)
    : rootReducer(state, action);
