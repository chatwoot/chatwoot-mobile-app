import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, Platform } from 'react-native';
import BackgroundColor from 'react-native-background-color';
import SplashScreen from 'react-native-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import NoNetworkBar from 'components/NoNetworkBar';
import ErrorHelper from 'helpers/ErrorHelper';
import { theme } from './theme';
import Router from './router';
import { store, persistor } from './store';
import i18n from './i18n';

import { ThemeContext } from './theme-context';

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

  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ApplicationProvider {...eva} theme={eva[theme]}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NoNetworkBar />
              <Router />
            </PersistGate>
          </Provider>
        </ApplicationProvider>
      </ThemeContext.Provider>
    </React.Fragment>
  );
};
export default Chatwoot;
