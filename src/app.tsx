import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AppNavigator } from '@/navigation';
import ErrorBoundaryScreen from '@/components-next/common/ErrorBoundaryScreen';
import ErrorBoundary from '@/components-next/common/ErrorBoundary';

import i18n from '@/i18n';

const Chatwoot = () => {
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <React.Suspense fallback={null}>
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <ErrorBoundaryScreen error={error} onRetry={resetErrorBoundary} />
            )}>
            <AppNavigator />
          </ErrorBoundary>
        </React.Suspense>
      </PersistGate>
    </Provider>
  );
};

export default Chatwoot;
