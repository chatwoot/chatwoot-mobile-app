import type { LiveCall } from '@/store/call/callTypes';

import { callTimerStart } from '@/utils/voiceCallUtils';

import { callStatusText, type CallStatusFlags } from '../utils/callStatusText';
import { useCallDuration } from './useCallDuration';

export const useCallStatusText = (
  call: LiveCall,
  activeSince: number | undefined,
  flags: CallStatusFlags,
) => {
  const duration = useCallDuration(
    flags.isConnected ? callTimerStart(call, activeSince) : undefined,
  );
  return callStatusText(call, duration, flags);
};
