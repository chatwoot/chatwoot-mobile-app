import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { useAppSelector } from '@/hooks';
import { tailwind } from '@/theme';
import { selectActiveCall } from '@/store/call/callSelectors';
import { store } from '@/store';
import { APP_FONTS } from '@/theme/fonts';
import {
  openAppFromLockScreen,
  setLockScreenCallSurfaceVisible,
} from '@/services/voice/chatwootCalls';

import { FullScreenCall } from './FullScreenCall';

const noop = () => {};

// Rendered by Android's lock-screen call activity once the agent answers there. It draws
// nothing until the call is up, so the native "Connecting…" state shows underneath, and
// then it covers that screen with the same call screen the app uses.
const LockScreenCall = () => {
  const call = useAppSelector(selectActiveCall);
  const [fontsLoaded] = useFonts(APP_FONTS);
  const ready = !!call && fontsLoaded;

  useEffect(() => {
    setLockScreenCallSurfaceVisible(ready);
  }, [ready]);

  if (!call || !ready) return null;
  return (
    <FullScreenCall call={call} onMinimise={noop} onOpenConversation={openAppFromLockScreen} />
  );
};

export const LockScreenCallRoot = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <GestureHandlerRootView style={tailwind.style('flex-1')}>
        <LockScreenCall />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  </Provider>
);
