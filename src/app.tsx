import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BackHandler } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { navigationRef } from '@/utils/navigationUtils';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import { AppErrorBoundary } from '@/components-next/error-boundary';

const Chatwoot = () => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const navigation = navigationRef.current;
      if (!navigation?.isReady()) return false;

      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      // A cold notification/deep link can open a chat without a list beneath it.
      if (navigation.getCurrentRoute()?.name === 'ChatScreen') {
        navigation.dispatch(StackActions.replace('Tab'));
        return true;
      }

      // Let Android put the root screen in the background without an exit prompt.
      return false;
    });
    return () => subscription.remove();
  }, []);

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
