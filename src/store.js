import AsyncStorage from '@react-native-community/async-storage';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';

import rootReducer from './reducer';
// Middleware: Redux Persist Config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [],
  blacklist: [],
};
// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
// Redux: Store
const store = createStore(persistedReducer, applyMiddleware(createLogger()));
// Middleware: Redux Persist Persister
let persistor = persistStore(store);

export { store, persistor };
