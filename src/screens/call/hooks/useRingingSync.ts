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

export const useRingingSync = () => {
  const dispatch = useAppDispatch();
  const hasCallingInbox = useAppSelector(state => selectAllInboxes(state).some(isVoiceCallEnabled));
  const accountId = useAppSelector(selectCurrentUserAccountId);

  const syncRinging = useCallback(() => {
    applyPendingCallAction().catch(() => {});
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

  useEffect(() => {
    if (hasCallingInbox) syncRinging();
  }, [accountId, hasCallingInbox, syncRinging]);

  // Cross-account rings bypass the account-scoped fetch.
  useEffect(
    () =>
      onMessage(getMessaging(), async message => {
        const data = message.data as CallPushPayload | undefined;
        if (isCallCancelPush(data) && data?.call_id) {
          const state = store.getState();
          const call = selectCalls(state).find(entry => entry.callSid === data.call_id);
          // Cancel pushes can precede their rings.
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
