import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { setMinimised } from '@/store/call/callSlice';
import {
  selectFullScreenCall,
  selectIsCallMinimised,
  selectPlacingCall,
} from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { applyPendingCallAction } from '@/services/voice/callSessionCore';
import { useHaptic } from '@/utils';

import { FullScreenCall } from './FullScreenCall';
import { useCallSession } from './hooks/useCallSession';
import { useRecentsScreenshotGuard } from './hooks/useRecentsScreenshotGuard';

// Screens the system presents as sheets over the app
const MODAL_ROUTES = ['ContactDetails', 'Dashboard'];

// The call screen for the whole call lifecycle inside the app: an inbound ring where the
// OS has no call screen of its own, a call this device placed, and any call that is up.
// A further inbound call rings as a sheet over it. Back minimises to the banner.
export const InAppCallScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const hapticSelection = useHaptic();
  useCallSession();
  // A call answered on the notification before the app opened is taken before the first
  // frame is drawn, so the app opens onto the call screen
  useLayoutEffect(() => {
    applyPendingCallAction().catch(() => {});
  }, []);
  const isMinimised = useAppSelector(selectIsCallMinimised);
  const liveFullScreenCall = useAppSelector(selectFullScreenCall);
  const placingCall = useAppSelector(selectPlacingCall);
  // A call being placed fills the screen straight away, before the provider answers with
  // its call id, so the button press has something to show
  const placeholderCall: LiveCall | null = useMemo(
    () =>
      placingCall
        ? {
            callSid: '',
            provider: placingCall.provider,
            conversationId: placingCall.conversationId,
            inboxId: placingCall.inboxId,
            callDirection: 'outbound',
            isActive: false,
            addedAt: Date.now(),
          }
        : null,
    [placingCall],
  );
  const fullScreenCall = liveFullScreenCall ?? placeholderCall;
  useRecentsScreenshotGuard(!!fullScreenCall);
  const showing = !!fullScreenCall && !isMinimised;

  // The call screen is drawn by the app; the keyboard, native sheets and modal screens the
  // system draws would sit on top of it, so they are put away as it opens
  useEffect(() => {
    if (!showing) return;
    Keyboard.dismiss();
    TrueSheet.dismissAll().catch(() => {});
    const state = navigation.getState();
    const top = state?.routes[state.index ?? 0]?.name;
    if (top && MODAL_ROUTES.includes(top)) navigation.goBack();
  }, [navigation, showing]);

  const handleOpenConversation = useCallback(() => {
    const conversationId = fullScreenCall?.conversationId;
    if (!conversationId) return;
    hapticSelection?.();
    dispatch(setMinimised(true));
    // The chat already on top is the one asked for
    const state = navigation.getState();
    const top = state?.routes[state.index ?? 0];
    const params = top?.params as { conversationId?: number } | undefined;
    if (top?.name === 'ChatScreen' && params?.conversationId === conversationId) return;
    navigation.dispatch(StackActions.push('ChatScreen', { conversationId }));
  }, [dispatch, fullScreenCall, hapticSelection, navigation]);

  if (!fullScreenCall || isMinimised) return null;
  return (
    <FullScreenCall
      call={fullScreenCall}
      onMinimise={() => dispatch(setMinimised(true))}
      onOpenConversation={handleOpenConversation}
    />
  );
};
