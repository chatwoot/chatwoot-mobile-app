import React, { Component } from 'react';
import { Provider } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';

import Router from './router';
import { store, persistor } from './store';

export default class Chatwoot extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router />
        </PersistGate>
      </Provider>
    );
  }
}
