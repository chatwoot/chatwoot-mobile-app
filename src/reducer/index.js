import { combineReducers } from 'redux';
import locale from './locale';
import auth from './auth';

const rootReducer = combineReducers({
  locale,
  auth,
});

export default (state, action) =>
  action.type === 'USER_LOGOUT'
    ? rootReducer(undefined, action)
    : rootReducer(state, action);
