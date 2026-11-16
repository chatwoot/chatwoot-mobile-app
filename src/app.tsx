import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import { AppErrorBoundary } from '@/components-next/error-boundary';

import i18n from '@/i18n';
import { AppearanceProvider } from '@/theme/appearance';
import { loadCloudflareAccess } from '@/services/cloudflareAccess';

// The URL screen belongs to the auth stack. Keep it reachable when credentials
// cannot be read, including when a Chatwoot login was restored from persistence.
const loadAccessCredentials = () =>
  loadCloudflareAccess().catch(() => {
    store.dispatch({ type: 'auth/logout' });
  });

const Chatwoot = () => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => subscription.remove();
  }, []);
  const handleBackButtonClick = () => {
    Alert.alert(
      i18n.t('EXIT.TITLE'),
      i18n.t('EXIT.SUBTITLE'),
      [
        {
          text: i18n.t('EXIT.CANCEL'),
          onPress: () => {},
          style: 'cancel',
        },
        { text: i18n.t('EXIT.OK'), onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
    return true;
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} onBeforeLift={loadAccessCredentials}>
        <AppearanceProvider>
          <AppErrorBoundary>
            <AppNavigator />
          </AppErrorBoundary>
        </AppearanceProvider>
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;
