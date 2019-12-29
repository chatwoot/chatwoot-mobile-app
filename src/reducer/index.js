import { combineReducers } from 'redux';
import locale from './locale';
import auth from './auth';
import agent from './agent';
import conversation from './conversation';

const rootReducer = combineReducers({
  locale,
  auth,
  agent,
  conversation,
});

export default (state, action) =>
  action.type === 'USER_LOGOUT'
    ? rootReducer(undefined, action)
    : rootReducer(state, action);
