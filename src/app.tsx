import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import { AppErrorBoundary } from '@/components-next/error-boundary';

const Chatwoot = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppErrorBoundary>
          <AppNavigator />
        </AppErrorBoundary>
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;
