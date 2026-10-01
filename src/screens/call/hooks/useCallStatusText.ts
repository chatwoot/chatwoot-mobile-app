import type { LiveCall } from '@/store/call/callTypes';

import { callStatusText, type CallStatusFlags } from '../utils/callStatusText';
import { useCallDuration } from './useCallDuration';

// The call's phase, or its running timer once connected. Only the component that shows it
// re-renders with the timer.
export const useCallStatusText = (
  call: LiveCall,
  activeSince: number | undefined,
  flags: CallStatusFlags,
) => {
  const duration = useCallDuration(flags.isConnected ? activeSince : undefined);
  return callStatusText(call, duration, flags);
};
