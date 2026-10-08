import React, { useCallback, useEffect } from 'react';
import { StackActions } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { useAppSelector } from '@/hooks';
import { tailwind } from '@/theme';
import { selectActiveCall } from '@/store/call/callSelectors';
import { setMinimised } from '@/store/call/callSlice';
import { store } from '@/store';
import { APP_FONTS } from '@/theme/fonts';
import {
  openAppFromLockScreen,
  setLockScreenCallSurfaceVisible,
} from '@/services/voice/chatwootCalls';
import { navigationRef } from '@/utils/navigationUtils';
import { resolveAccountSwitch, switchAccount } from '@/utils/accountUtils';

import { FullScreenCall } from './FullScreenCall';

const NAVIGATION_WAIT_MS = 10_000;

// The chat opens once the app's navigation is up, which on a cold start comes a moment
// after the app itself
const openConversationWhenReady = (conversationId: number) => {
  const startedAt = Date.now();
  const attempt = () => {
    const navigation = navigationRef.current;
    if (!navigation?.isReady()) {
      if (Date.now() - startedAt < NAVIGATION_WAIT_MS) setTimeout(attempt, 100);
      return;
    }
    const top = navigation.getCurrentRoute();
    const params = top?.params as { conversationId?: number } | undefined;
    if (top?.name === 'ChatScreen' && params?.conversationId === conversationId) return;
    navigation.dispatch(StackActions.push('ChatScreen', { conversationId }));
  };
  attempt();
};

// Opening the chat from the lock-screen call unlocks the phone first; the call then
// carries on minimised in the app with the chat open, in the call's account since
// conversation ids are per account
const openConversationInApp = async (conversationId: number, accountId?: number) => {
  const opened = await openAppFromLockScreen();
  if (!opened) return;
  store.dispatch(setMinimised(true));
  const targetAccountId = resolveAccountSwitch(accountId);
  if (targetAccountId && !switchAccount(store.dispatch, targetAccountId)) return;
  openConversationWhenReady(conversationId);
};

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

  const conversationId = call?.conversationId;
  const accountId = call?.accountId;
  const openConversation = useCallback(() => {
    if (conversationId) openConversationInApp(conversationId, accountId).catch(() => {});
  }, [accountId, conversationId]);

  if (!call || !ready) return null;
  return (
    <FullScreenCall
      call={call}
      onMinimise={noop}
      onOpenConversation={openConversation}
      onLockScreen
    />
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
