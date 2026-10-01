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
  selectIncomingCalls,
  selectIsJoining,
} from '@/store/call/callSelectors';
import actionCableConnector from '@/utils/actionCable';
import { reportNativeCallState } from '@/services/voice/chatwootCalls';

import { applyPendingCallAction, attachCallSessionCore } from './callSessionCore';

// Carries a call the agent answered on Android's native call screen while the phone was
// locked. It runs as a headless task, so the call has JavaScript, the socket and the media
// engines behind it without any activity being shown; the app itself only appears if the
// agent unlocks the phone, and it then finds the call already in the store.

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

// The app's navigator normally opens the socket; without it, the task does
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
      return (
        !selectHasActiveCall(state) &&
        !selectIsJoining(state) &&
        selectIncomingCalls(state).length === 0
      );
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
