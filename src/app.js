import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler } from 'react-native';

import { PersistGate } from 'redux-persist/integration/react';
import { mapping } from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from 'react-native-ui-kitten';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { theme } from './theme';

import Router from './router';
import { store, persistor } from './store';

import i18n from './i18n';

export default class Chatwoot extends Component {
  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
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
        <ApplicationProvider mapping={mapping} theme={theme}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Router />
            </PersistGate>
          </Provider>
        </ApplicationProvider>
      </React.Fragment>
    );
  }
}
