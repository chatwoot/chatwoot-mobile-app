import { combineReducers } from 'redux';
import locale from './locale';

const rootReducer = combineReducers({
  locale,
});

export default (state, action) => rootReducer(state, action);
