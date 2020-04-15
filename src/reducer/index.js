import { combineReducers } from 'redux';
import locale from './locale';
import auth from './auth';
import inbox from './inbox';
import conversation from './conversation';
import settings from './settings';

const rootReducer = combineReducers({
  locale,
  auth,
  inbox,
  conversation,
  settings,
});

export default (state, action) =>
  action.type === 'USER_LOGOUT'
    ? rootReducer(undefined, action)
    : rootReducer(state, action);
