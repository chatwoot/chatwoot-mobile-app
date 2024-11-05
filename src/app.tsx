import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, LogBox } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';

import i18n from '@/i18n';

// TODO: Please fix this
LogBox.ignoreLogs(['Require cycle:']);

const Chatwoot = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fontsLoaded, error] = useFonts({
    'Inter-400-20': require('./assets/fonts/Inter-400-20.ttf'),
    'Inter-420-20': require('./assets/fonts/Inter-420-20.ttf'),
    'Inter-500-24': require('./assets/fonts/Inter-500-24.ttf'),
    'Inter-580-24': require('./assets/fonts/Inter-580-24.ttf'),
    'Inter-600-20': require('./assets/fonts/Inter-600-20.ttf'),
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;
