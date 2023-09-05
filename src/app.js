import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';
import * as Sentry from '@sentry/react-native';
import NoNetworkBar from 'components/NoNetworkBar';
import ErrorHelper from 'helpers/ErrorHelper';
import Router from './router';
import { store, persistor } from './store';
import i18n from './i18n/index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Chatwoot = () => {
  useEffect(() => {
    ErrorHelper.init();
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

export default !__DEV__ ? Sentry.wrap(Chatwoot) : Chatwoot;
