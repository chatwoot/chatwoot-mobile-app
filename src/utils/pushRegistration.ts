import { AppState } from 'react-native';
import { getMessaging, onTokenRefresh } from '@react-native-firebase/messaging';

// Re-register after token rotation or a failed startup request. Serialize requests so an
// older token cannot overwrite a newer registration, and stop queued work on logout.
export function subscribePushRegistration(
  register: (requestPermission: boolean) => Promise<unknown>,
) {
  let disposed = false;
  let queue = Promise.resolve();
  const refresh = (requestPermission = false) => {
    queue = queue
      .then(async () => {
        if (!disposed) await register(requestPermission);
      })
      .catch(() => {}); // The registration thunk reports errors and the next event retries.
  };
  const unsubscribeToken = onTokenRefresh(getMessaging(), () => refresh());
  let previousState = AppState.currentState;
  const appState = AppState.addEventListener('change', nextState => {
    if (nextState === 'active' && previousState !== 'active') refresh();
    previousState = nextState;
  });
  refresh(true);
  return () => {
    disposed = true;
    unsubscribeToken();
    appState.remove();
  };
}
