import React, { useCallback, useMemo } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { setMinimised } from '@/store/call/callSlice';
import {
  selectFullScreenCall,
  selectIsCallMinimised,
  selectPlacingCall,
} from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { useHaptic } from '@/utils';

import { FullScreenCall } from './FullScreenCall';
import { useCallSession } from './hooks/useCallSession';
import { useRecentsScreenshotGuard } from './hooks/useRecentsScreenshotGuard';

// The call screen for the whole call lifecycle inside the app: an inbound ring where the
// OS has no call screen of its own, a call this device placed, and any call that is up.
// A further inbound call rings as a sheet over it. Back minimises to the banner.
export const InAppCallScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const hapticSelection = useHaptic();
  useCallSession();
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

  const handleOpenConversation = useCallback(() => {
    const conversationId = fullScreenCall?.conversationId;
    if (!conversationId) return;
    hapticSelection?.();
    dispatch(setMinimised(true));
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
