import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, Platform } from 'react-native';
import BackgroundColor from 'react-native-background-color';
import SplashScreen from 'react-native-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import ErrorHelper from './helpers/ErrorHelper';

import { theme } from './theme';

import NoNetworkBar from './components/NoNetworkBar';

import Router from './router';
import { store, persistor } from './store';

import i18n from './i18n';

export default class Chatwoot extends Component {
  componentDidMount() {
    ErrorHelper.init();
    // To hide splash screen
    SplashScreen.hide();
    if (Platform.OS === 'android') {
      BackgroundColor.setColor('#FFFFFF');
    }

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick = () => {
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

  render() {
    return (
      <React.Fragment>
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
    );
  }
}
