import React, { Component } from 'react';
import { Provider } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';
import { mapping } from '@eva-design/eva';
import { ApplicationProvider } from 'react-native-ui-kitten';

import { theme } from './theme';

import Router from './router';
import { store, persistor } from './store';

export default class Chatwoot extends Component {
  render() {
    return (
      <ApplicationProvider mapping={mapping} theme={theme}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Router />
          </PersistGate>
        </Provider>
      </ApplicationProvider>
    );
  }
}
