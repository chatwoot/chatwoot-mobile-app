import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import notifee from '@notifee/react-native';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import { useAppDispatch } from '@/hooks';
import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import { applyPendingCallAction } from '@/services/voice/callSessionCore';
import { systemCall, systemEndReason } from '@/services/voice/systemCall';
import actionCableConnector from '@/utils/actionCable';
import { handleCallNotificationEvent, isCallPush } from '@/utils/callNotifications';

// Reconciles this device's ringing calls with the server whenever the socket may have
// missed something: on launch, on every return to the foreground, and when a call push
// lands while the app is in front. Returns the sync so other hooks can trigger it.
export const useRingingSync = () => {
  const dispatch = useAppDispatch();

  // Apply what the agent already chose on the native call screen, then surface calls that
  // rang while the socket was down and end system calls the server has moved on from
  const syncRinging = useCallback(() => {
    applyPendingCallAction().catch(() => {});
    dispatch(callActions.syncRingingCalls())
      .unwrap()
      .then(result => {
        result.ended.forEach(({ callSid, status }) =>
          systemCall.endedBySid(store, callSid, systemEndReason(store, callSid, status)),
        );
      })
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    syncRinging();
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', next => {
      const cameToForeground = previous.match(/inactive|background/) && next === 'active';
      previous = next;
      if (cameToForeground) syncRinging();
    });
    return () => subscription.remove();
  }, [syncRinging]);

  // A call push arriving while the app is in front: the socket may have dropped, so the
  // ringing call is fetched rather than waited for
  useEffect(
    () =>
      onMessage(getMessaging(), async message => {
        if (!isCallPush(message.data)) return;
        actionCableConnector.ensureConnected();
        syncRinging();
      }),
    [syncRinging],
  );

  // Presses on the call notification while the app is running
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async event => {
      await handleCallNotificationEvent(event);
      await applyPendingCallAction();
    });
    return () => unsubscribe();
  }, []);

  return syncRinging;
};
