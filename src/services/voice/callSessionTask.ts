import { persistor, store } from '@/store';
import {
  selectCurrentUserAccountId,
  selectLoggedIn,
  selectPubSubToken,
  selectUserId,
} from '@/store/auth/authSelectors';
import { selectWebSocketUrl } from '@/store/settings/settingsSelectors';
import {
  selectHasActiveCall,
  selectLocalCallSid,
  selectIsJoining,
} from '@/store/call/callSelectors';
import actionCableConnector from '@/utils/actionCable';
import { reportNativeCallState } from '@/services/voice/chatwootCalls';

import { discardPendingCallActions } from '@/utils/callNotifications';
import { applyPendingCallAction, attachCallSessionCore } from './callSessionCore';

// Keep JavaScript alive for lock-screen calls.

export const CALL_SESSION_TASK = 'ChatwootCallSession';

const SESSION_LIMIT_MS = 4 * 60 * 60 * 1000;

const waitForRehydration = () =>
  new Promise<void>(resolve => {
    if (persistor.getState().bootstrapped) {
      resolve();
      return;
    }
    const unsubscribe = persistor.subscribe(() => {
      if (!persistor.getState().bootstrapped) return;
      unsubscribe();
      resolve();
    });
  });

// Headless tasks have no navigator lifecycle.
const ensureCable = () => {
  if (actionCableConnector.isInitialised()) {
    actionCableConnector.ensureConnected();
    return;
  }
  const state = store.getState();
  const pubSubToken = selectPubSubToken(state);
  const webSocketUrl = selectWebSocketUrl(state);
  const accountId = selectCurrentUserAccountId(state);
  const userId = selectUserId(state);
  if (pubSubToken && webSocketUrl && accountId && userId) {
    actionCableConnector.init({ pubSubToken, webSocketUrl, accountId, userId });
  }
};

const waitForCallToEnd = () =>
  new Promise<void>(resolve => {
    const settled = () => {
      const state = store.getState();
      return !selectHasActiveCall(state) && !selectIsJoining(state) && !selectLocalCallSid(state);
    };
    const timer = setTimeout(finish, SESSION_LIMIT_MS);
    const unsubscribe = store.subscribe(() => {
      if (settled()) finish();
    });
    function finish() {
      clearTimeout(timer);
      unsubscribe();
      resolve();
    }
    if (settled()) finish();
  });

export const runCallSessionTask = async () => {
  await waitForRehydration();
  if (!selectLoggedIn(store.getState())) {
    discardPendingCallActions();
    reportNativeCallState('failed');
    return;
  }
  ensureCable();
  const detach = attachCallSessionCore();
  try {
    await applyPendingCallAction();
    await waitForCallToEnd();
  } finally {
    detach();
  }
};
