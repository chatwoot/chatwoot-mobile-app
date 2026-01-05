import { AppNavigator } from '@/navigation';
import React, { useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';

import i18n from '@/i18n';
import { getStore } from '@/store/storeAccessor';
import {
  extractParamsFromNotification,
  navigateToConversation,
} from '@/utils/notificationNavigationUtils';
import notifee, { EventType } from '@notifee/react-native';

if (Platform.OS === 'android') {
  notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: 4,
  });
}

const BACKGROUND_NAVIGATION_DELAY = 500;

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.PRESS || !detail.notification?.data) {
    return;
  }

  try {
    const state = getStore().getState();
    const installationUrl = state.settings?.installationUrl || '';
    const params = extractParamsFromNotification(
      detail.notification.data as Record<string, string>,
      installationUrl,
    );

    if (params) {
      setTimeout(async () => {
        await navigateToConversation(params);
      }, BACKGROUND_NAVIGATION_DELAY);
    }
  } catch (error) {
    console.error('[App] Error processing background notification:', error);
  }
});

const Chatwoot = () => {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
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
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;
