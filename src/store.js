import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { rootReducer } from './reducer';

const persistConfig = {
  key: 'Root',
  version: 1,
  storage: AsyncStorage,
};

const middlewares = [];

const allReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = { settings: state.settings };
  }
  return rootReducer(state, action);
};

if (__DEV__) {
  // const createDebugger = require('redux-flipper').default;
  // middlewares.push(createDebugger());
}

const persistedReducer = persistReducer(persistConfig, allReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // warnAfter: 128,
      },
      immutableCheck: { warnAfter: 128 },
    }).concat(middlewares),
});
export const persistor = persistStore(store);
