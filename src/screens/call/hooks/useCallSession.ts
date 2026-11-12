import { useEffect } from 'react';

import { attachCallSessionCore } from '@/services/voice/callSessionCore';

import { useCallNotificationDismissal } from './useCallNotificationDismissal';
import { useMediaDebugLog } from './useMediaDebugLog';
import { useMicrophonePrompt } from './useMicrophonePrompt';
import { useRingTimeouts } from './useRingTimeouts';
import { useRingingCallsFromCache } from './useRingingCallsFromCache';
import { useRingingSync } from './useRingingSync';
import { useRingback } from './useRingback';
import { useRingtone } from './useRingtone';
import { useSystemCallBridge } from './useSystemCallBridge';
import { useVoipTokenRegistration } from './useVoipTokenRegistration';

export const useCallSession = () => {
  useEffect(() => attachCallSessionCore(), []);
  const syncRinging = useRingingSync();
  useRingtone();
  useRingback();
  useRingTimeouts();
  useRingingCallsFromCache();
  useCallNotificationDismissal();
  useSystemCallBridge(syncRinging);
  useVoipTokenRegistration();
  useMediaDebugLog();
  useMicrophonePrompt();
};
