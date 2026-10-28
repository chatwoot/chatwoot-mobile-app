import { useCallback, useState } from 'react';

import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import type { LiveCall } from '@/store/call/callTypes';
import { systemCall } from '@/services/voice/systemCall';
import { useHaptic } from '@/utils';
import { reportAnswerFailure, toastJoinOutcome } from '@/utils/voiceCallFeedback';

export const useCallActions = (call: LiveCall, isJoining: boolean) => {
  const hapticSelection = useHaptic();
  const [isEnding, setIsEnding] = useState(false);

  const answer = useCallback(async () => {
    if (isJoining) return;
    hapticSelection?.();
    try {
      const { status } = await systemCall.answer(store, call);
      toastJoinOutcome(status);
    } catch (error) {
      reportAnswerFailure(error);
    }
  }, [call, hapticSelection, isJoining]);

  const end = useCallback(async () => {
    if (isEnding) return;
    hapticSelection?.();
    setIsEnding(true);
    try {
      if (!call.callSid) {
        await store.dispatch(callActions.cancelPlacingCall());
        return;
      }
      await systemCall.end(store, call);
    } catch {
      // Local call cleanup runs despite failures.
    } finally {
      setIsEnding(false);
    }
  }, [call, hapticSelection, isEnding]);

  return { answer, end, isEnding };
};
