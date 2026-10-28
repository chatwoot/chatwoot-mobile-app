import { AppState } from 'react-native';
import { getMessaging, onTokenRefresh } from '@react-native-firebase/messaging';

// Re-register after token rotation or a failed startup request. Serialize requests so an
// older token cannot overwrite a newer registration, and stop queued work on logout.
export function subscribePushRegistration(
  register: () => Promise<unknown>,
  prepare: () => Promise<void>,
) {
  let disposed = false;
  // Keep the existing notification prompt, inbox load and call readiness ahead of startup.
  let queue = Promise.resolve()
    .then(async () => {
      if (!disposed) await prepare();
    })
    .catch(() => {}); // A failed permission/readiness check must not prevent registration.
  const refresh = () => {
    queue = queue
      .then(async () => {
        if (!disposed) await register();
      })
      .catch(() => {}); // The registration thunk reports errors and the next event retries.
  };
  const unsubscribeToken = onTokenRefresh(getMessaging(), () => refresh());
  let previousState = AppState.currentState;
  const appState = AppState.addEventListener('change', nextState => {
    if (nextState === 'active' && previousState !== 'active') refresh();
    previousState = nextState;
  });
  refresh();
  return () => {
    disposed = true;
    unsubscribeToken();
    appState.remove();
  };
}
