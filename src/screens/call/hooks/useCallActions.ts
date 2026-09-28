import { useCallback, useState } from 'react';

import { store } from '@/store';
import type { LiveCall } from '@/store/call/callTypes';
import { systemCall } from '@/services/voice/systemCall';
import { useHaptic } from '@/utils';
import { reportAnswerFailure, toastJoinOutcome } from '@/utils/voiceCallFeedback';

// Answer and end for the call on screen, routed through the OS call UI where there is one
export const useCallActions = (call: LiveCall, isJoining: boolean) => {
  const hapticSelection = useHaptic();
  const [isEnding, setIsEnding] = useState(false);

  // Answering from the full screen, used where the OS has no call screen of its own
  const answer = useCallback(async () => {
    if (isJoining) return;
    hapticSelection?.();
    try {
      const result = await systemCall.answer(store, call);
      if (result) toastJoinOutcome(result.status);
    } catch (error) {
      reportAnswerFailure(error);
    }
  }, [call, hapticSelection, isJoining]);

  const end = useCallback(async () => {
    if (isEnding) return;
    hapticSelection?.();
    setIsEnding(true);
    try {
      await systemCall.end(store, call);
    } catch {
      // The call state is cleared locally whatever the request did
    } finally {
      setIsEnding(false);
    }
  }, [call, hapticSelection, isEnding]);

  return { answer, end, isEnding };
};
