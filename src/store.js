import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore, applyMiddleware } from 'redux';
// import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';

import rootReducer from './reducer'; // the value from combineReducers

const middleware = [];

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

if (__DEV__) {
  // middleware.push(createLogger());
  // const createDebugger = require('redux-flipper').default;
  // middleware.push(createDebugger());
}
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(...middleware, thunk));
const persistor = persistStore(store);

export { store, persistor };
