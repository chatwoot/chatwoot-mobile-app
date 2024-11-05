import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, StatusBar, StyleSheet, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';

import * as SplashScreen from 'expo-splash-screen';
import { store, persistor } from '@/store';
import NoNetworkBar from 'components/NoNetworkBar';
import Router from './router';

import i18n from 'i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// TODO: Please fix this
LogBox.ignoreLogs(['Require cycle:']);

const Chatwoot = () => {
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
  return (
    <GestureHandlerRootView style={styles.container}>
      <React.Fragment>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NoNetworkBar />
            <Router />
          </PersistGate>
        </Provider>
      </React.Fragment>
    </GestureHandlerRootView>
  );
};

export default Chatwoot;
