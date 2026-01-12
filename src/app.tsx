import React, { useEffect, useCallback, useState } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, Platform } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import { ErrorBoundary } from '@/utils/ErrorBoundary';
import { CustomSplashScreen } from '@/screens/splash/CustomSplashScreen';

import i18n from '@/i18n';

const AlooChat = () => {
  const [showSplash, setShowSplash] = useState(Platform.OS === 'ios');
  const handleBackButtonClick = useCallback(() => {
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
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      backHandler.remove();
    };
  }, [handleBackButtonClick]);

  // Show custom splash on iOS only
  if (showSplash && Platform.OS === 'ios') {
    return (
      <CustomSplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default AlooChat;
