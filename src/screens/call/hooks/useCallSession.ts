import { useEffect } from 'react';

import { attachCallSessionCore } from '@/services/voice/callSessionCore';

import { useCallNotificationDismissal } from './useCallNotificationDismissal';
import { useMediaDebugLog } from './useMediaDebugLog';
import { useMicrophonePrompt } from './useMicrophonePrompt';
import { useRingTimeouts } from './useRingTimeouts';
import { useRingingCallsFromCache } from './useRingingCallsFromCache';
import { useRingingSync } from './useRingingSync';
import { useRingtone } from './useRingtone';
import { useSystemCallBridge } from './useSystemCallBridge';
import { useVoipTokenRegistration } from './useVoipTokenRegistration';

// Mounted once while the agent is logged in. Owns everything a call needs outside its
// screen: the media engines' end-of-call signals, the ringtone, the ring timeouts, the
// re-seeding of rings the socket missed, and the OS call UI.
export const useCallSession = () => {
  useEffect(() => attachCallSessionCore(), []);
  const syncRinging = useRingingSync();
  useRingtone();
  useRingTimeouts();
  useRingingCallsFromCache();
  useCallNotificationDismissal();
  useSystemCallBridge(syncRinging);
  useVoipTokenRegistration();
  useMediaDebugLog();
  useMicrophonePrompt();
};
