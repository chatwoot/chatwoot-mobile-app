import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { Keyboard } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { setMinimised } from '@/store/call/callSlice';
import { selectIsCallMinimised } from '@/store/call/callSelectors';
import { applyPendingCallAction } from '@/services/voice/callSessionCore';
import { useHaptic } from '@/utils';
import { resolveAccountSwitch, switchAccount } from '@/utils/accountUtils';

import { FullScreenCall } from './FullScreenCall';
import { useCallSession } from './hooks/useCallSession';
import { useRecentsScreenshotGuard } from './hooks/useRecentsScreenshotGuard';
import { useScreenCall } from './hooks/useScreenCall';

const MODAL_ROUTES = ['ContactDetails', 'Dashboard'];

export const InAppCallScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const hapticSelection = useHaptic();
  useCallSession();
  // Apply notification answers before first paint.
  useLayoutEffect(() => {
    applyPendingCallAction().catch(() => {});
  }, []);
  const isMinimised = useAppSelector(selectIsCallMinimised);
  const fullScreenCall = useScreenCall();
  useRecentsScreenshotGuard(!!fullScreenCall);
  const showing = !!fullScreenCall && !isMinimised;

  // Native modals otherwise cover the call.
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
    const targetAccountId = resolveAccountSwitch(fullScreenCall?.accountId);
    if (targetAccountId) {
      if (!switchAccount(dispatch, targetAccountId)) return;
      dispatch(setMinimised(true));
      navigation.dispatch(StackActions.push('ChatScreen', { conversationId }));
      return;
    }
    dispatch(setMinimised(true));
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
