import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import { addCall, dismissCall, markCallDismissed } from '@/store/call/callSlice';
import { selectCalls, selectLocalCallSid } from '@/store/call/callSelectors';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { applyPendingCallAction } from '@/services/voice/callSessionCore';
import { systemCall, systemEndReason } from '@/services/voice/systemCall';
import actionCableConnector from '@/utils/actionCable';
import {
  type CallPushPayload,
  callFromPush,
  isCallCancelPush,
  isCallPush,
} from '@/utils/callNotifications';

let syncing = false;
let syncAgain = false;

// Reconciles this device's ringing calls with the server whenever the socket may have
// missed something: on launch, on every return to the foreground, and when a call push
// lands while the app is in front. Returns the sync so other hooks can trigger it.
export const useRingingSync = () => {
  const dispatch = useAppDispatch();
  const hasCallingInbox = useAppSelector(state => selectAllInboxes(state).some(isVoiceCallEnabled));
  const accountId = useAppSelector(selectCurrentUserAccountId);

  // Apply what the agent already chose on the native call screen, then surface calls that
  // rang while the socket was down and end system calls the server has moved on from
  const syncRinging = useCallback(() => {
    applyPendingCallAction().catch(() => {});
    // Only accounts with an inbox that can call have anything to sync. One sync runs at a
    // time; a request made during it runs once it finishes, since the account may have
    // changed under it
    if (!selectAllInboxes(store.getState()).some(isVoiceCallEnabled)) return;
    if (syncing) {
      syncAgain = true;
      return;
    }
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
        if (syncAgain) {
          syncAgain = false;
          syncRinging();
        }
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

  // The inboxes arrive after launch and change with the account; a call already ringing
  // then is found once they do
  useEffect(() => {
    if (hasCallingInbox) syncRinging();
  }, [accountId, hasCallingInbox, syncRinging]);

  // A call push arriving while the app is in front: the socket may have dropped, so the
  // ringing call is fetched rather than waited for. A ring for another account is taken
  // from the push, since the fetch only sees the account on screen. A ring that is over
  // leaves the app's ring UI, unless it is the call this device is on.
  useEffect(
    () =>
      onMessage(getMessaging(), async message => {
        const data = message.data as CallPushPayload | undefined;
        if (isCallCancelPush(data) && data?.call_id) {
          const state = store.getState();
          const call = selectCalls(state).find(entry => entry.callSid === data.call_id);
          // A cancel can arrive before the ring it ends; the ring is kept from showing
          if (!call) {
            dispatch(markCallDismissed(data.call_id));
            return;
          }
          if (call.isActive || selectLocalCallSid(state) === call.callSid) return;
          systemCall.endedBySid(
            store,
            call.callSid,
            systemEndReason(store, call.callSid, data.reason),
          );
          dispatch(dismissCall(call.callSid));
          return;
        }
        if (!isCallPush(data) || !data) return;
        actionCableConnector.ensureConnected();
        const pushed = callFromPush(data);
        const currentAccountId = selectCurrentUserAccountId(store.getState());
        if (pushed?.accountId && pushed.accountId !== currentAccountId) {
          dispatch(addCall(pushed));
          return;
        }
        syncRinging();
      }),
    [dispatch, syncRinging],
  );

  return syncRinging;
};
