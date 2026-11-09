import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StackActions } from '@react-navigation/native';
import { Alert, BackHandler } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import { AppErrorBoundary } from '@/components-next/error-boundary';

import i18n from '@/i18n';
import { navigationRef } from '@/utils/navigationUtils';

const Chatwoot = () => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => subscription.remove();
  }, []);
  const handleBackButtonClick = () => {
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
        <AppErrorBoundary>
          <AppNavigator />
        </AppErrorBoundary>
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;
