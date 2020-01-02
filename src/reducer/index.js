import { combineReducers } from 'redux';
import locale from './locale';
import auth from './auth';
import inbox from './inbox';
import conversation from './conversation';

const rootReducer = combineReducers({
  locale,
  auth,
  inbox,
  conversation,
});

export default (state, action) =>
  action.type === 'USER_LOGOUT'
    ? rootReducer(undefined, action)
    : rootReducer(state, action);
