import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { store, persistor } from './store';
import NoNetworkBar from 'components/NoNetworkBar';
import Router from './router';
import { RefsProvider } from '@/context';

import i18n from 'i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Chatwoot = () => {
  const [fontsLoaded, error] = useFonts({
    'Inter-400-20': require('./assets/fonts/Inter-400-20.ttf'),
    'inter-420-20': require('./assets/fonts/Inter-420-20.ttf'),
    'Inter-500-24': require('./assets/fonts/Inter-500-24.ttf'),
    'Inter-600-20': require('./assets/fonts/Inter-600-20.ttf'),
    'inter-580-24': require('./assets/fonts/Inter-580-24.ttf'),
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
    <GestureHandlerRootView style={styles.container}>
      <React.Fragment>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <RefsProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NoNetworkBar />
              <Router />
            </PersistGate>
          </Provider>
        </RefsProvider>
      </React.Fragment>
    </GestureHandlerRootView>
  );
};

export default Chatwoot;
