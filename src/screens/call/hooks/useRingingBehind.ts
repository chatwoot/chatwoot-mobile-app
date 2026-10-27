import { useCallback, useMemo } from 'react';

import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { store } from '@/store';
import { selectIncomingCalls } from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { beginCallSwitch, endCallSwitch } from '@/services/voice/callSessionCore';
import { systemCall } from '@/services/voice/systemCall';
import { useHaptic } from '@/utils';
import { cancelCallNotification } from '@/utils/callNotifications';
import { showToast } from '@/utils/toastUtils';
import { reportAnswerFailure, toastJoinOutcome } from '@/utils/voiceCallFeedback';

type Options = {
  call: LiveCall;
  isJoining: boolean;
};

export const useRingingBehind = ({ call, isJoining }: Options) => {
  const hapticSelection = useHaptic();
  const incomingCalls = useAppSelector(selectIncomingCalls);

  const calls = useMemo(
    () =>
      incomingCalls
        .filter(entry => entry.callDirection === 'inbound' && entry.callSid !== call.callSid)
        .sort((a, b) => a.addedAt - b.addedAt),
    [call.callSid, incomingCalls],
  );
  const rungBySystem = calls.some(entry => systemCall.ringsInSystemUi(entry));

  const answer = useCallback(
    async (target: LiveCall) => {
      if (isJoining) return false;
      hapticSelection?.();
      cancelCallNotification();
      beginCallSwitch();
      try {
        const { status } = await systemCall.answer(store, target);
        toastJoinOutcome(status);
        return status === 'joined' || status === 'requested';
      } catch (error) {
        reportAnswerFailure(error);
        return false;
      } finally {
        endCallSwitch();
      }
    },
    [hapticSelection, isJoining],
  );

  const decline = useCallback(
    async (target: LiveCall) => {
      hapticSelection?.();
      cancelCallNotification();
      try {
        await systemCall.end(store, target);
        return true;
      } catch {
        showToast({ message: i18n.t('CONVERSATION.VOICE_WIDGET.REJECT_FAILED') });
        return false;
      }
    },
    [hapticSelection],
  );

  // Resolves with the calls whose decline failed
  const declineAll = useCallback(async () => {
    cancelCallNotification();
    const results = await Promise.allSettled(calls.map(target => systemCall.end(store, target)));
    return calls
      .filter((_, index) => results[index].status === 'rejected')
      .map(target => target.callSid);
  }, [calls]);

  return { calls, rungBySystem, answer, decline, declineAll };
};
