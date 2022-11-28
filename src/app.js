import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, Platform, StatusBar, StyleSheet } from 'react-native';
import BackgroundColor from 'react-native-background-color';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as Sentry from '@sentry/react-native';
import NoNetworkBar from 'components/NoNetworkBar';
import ErrorHelper from 'helpers/ErrorHelper';
import { theme } from './theme';
import Router from './router';
import { store, persistor } from './store';
import i18n from './i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Chatwoot = () => {
  useEffect(() => {
    ErrorHelper.init();
    // To hide splash screen
    SplashScreen.hide();
    if (Platform.OS === 'android') {
      BackgroundColor.setColor('#FFFFFF');
    }
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
        <StatusBar barStyle="dark-content" />
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={theme}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NoNetworkBar />
              <Router />
            </PersistGate>
          </Provider>
        </ApplicationProvider>
      </React.Fragment>
    </GestureHandlerRootView>
  );
};
export default Sentry.wrap(Chatwoot);
