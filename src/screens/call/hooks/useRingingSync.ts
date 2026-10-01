import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import { useAppDispatch } from '@/hooks';
import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import { dismissCall } from '@/store/call/callSlice';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { applyPendingCallAction } from '@/services/voice/callSessionCore';
import { systemCall, systemEndReason } from '@/services/voice/systemCall';
import actionCableConnector from '@/utils/actionCable';
import { isCallPush } from '@/utils/callNotifications';

let syncing = false;

// Reconciles this device's ringing calls with the server whenever the socket may have
// missed something: on launch, on every return to the foreground, and when a call push
// lands while the app is in front. Returns the sync so other hooks can trigger it.
export const useRingingSync = () => {
  const dispatch = useAppDispatch();

  // Apply what the agent already chose on the native call screen, then surface calls that
  // rang while the socket was down and end system calls the server has moved on from
  const syncRinging = useCallback(() => {
    applyPendingCallAction().catch(() => {});
    // Only accounts with an inbox that can call have anything to sync, and one sync at a
    // time is enough
    if (syncing || !selectAllInboxes(store.getState()).some(isVoiceCallEnabled)) return;
    syncing = true;
    dispatch(callActions.syncRingingCalls())
      .unwrap()
      .then(result => {
        result.ended.forEach(({ callSid, status }) => {
          // The OS call is ended while the call is still known, then it is dropped
          systemCall.endedBySid(store, callSid, systemEndReason(store, callSid, status));
          dispatch(dismissCall(callSid));
        });
      })
      .catch(() => {})
      .finally(() => {
        syncing = false;
      });
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

  return syncRinging;
};
