import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectChatwootVersion } from '@/store/settings/settingsSelectors';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { supportsVoipPush } from '@/utils/serverUtils';
import { systemCall } from '@/services/voice/systemCall';
import { addVoipTokenListener, getVoipToken } from '@/services/voice/chatwootCalls';

export const useVoipTokenRegistration = () => {
  const dispatch = useAppDispatch();
  const registeredTokenRef = useRef<string | null>(null);
  const pendingTokenRef = useRef<string | null>(null);
  const hasCallingInbox = useAppSelector(state => selectAllInboxes(state).some(isVoiceCallEnabled));
  const serverVersion = useAppSelector(selectChatwootVersion);
  const canRingPhone = hasCallingInbox && supportsVoipPush(serverVersion);

  useEffect(() => {
    if (!canRingPhone || !systemCall.isAvailable()) return undefined;
    const register = (token: string | null) => {
      if (!token || token === registeredTokenRef.current || token === pendingTokenRef.current) {
        return;
      }
      pendingTokenRef.current = token;
      dispatch(settingsActions.saveVoipToken())
        .unwrap()
        .then(() => {
          registeredTokenRef.current = token;
        })
        .catch(() => {})
        .finally(() => {
          if (pendingTokenRef.current === token) pendingTokenRef.current = null;
        });
    };
    register(getVoipToken() ?? null);
    const tokenSubscription = addVoipTokenListener(event => register(event.token));
    const appStateSubscription = AppState.addEventListener('change', next => {
      if (next === 'active') register(getVoipToken() ?? null);
    });
    return () => {
      tokenSubscription.remove();
      appStateSubscription.remove();
    };
  }, [canRingPhone, dispatch]);
};
