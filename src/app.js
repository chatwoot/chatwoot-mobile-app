import React, { Component } from 'react';
import { Provider } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';
import { mapping } from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from 'react-native-ui-kitten';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { theme } from './theme';

import Router from './router';
import { store, persistor } from './store';

export default class Chatwoot extends Component {
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
