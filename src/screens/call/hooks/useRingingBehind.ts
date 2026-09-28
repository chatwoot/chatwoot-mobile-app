import { useCallback, useMemo } from 'react';

import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import { selectIncomingCalls } from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { beginCallSwitch, endCallSwitch } from '@/services/voice/callSessionCore';
import { systemCall } from '@/services/voice/systemCall';
import { useHaptic } from '@/utils';
import { cancelCallNotification } from '@/utils/callNotifications';
import { showToast } from '@/utils/toastUtils';
import { reportAnswerFailure, toastJoinOutcome } from '@/utils/voiceCallFeedback';

type Options = {
  // The call on screen, which the ringing ones queue behind
  call: LiveCall;
  activeCall: LiveCall | null;
  isJoining: boolean;
};

// The inbound calls ringing behind the one on screen, longest waiting first, with the
// actions the sheet offers on them. Where the OS rings the calls itself it shows one at a
// time and offers no way to pick among them, so the list is still kept, with its actions
// routed through the OS. The answer and decline handlers resolve false when nothing
// happened, so a swiped row can spring back.
export const useRingingBehind = ({ call, activeCall, isJoining }: Options) => {
  const hapticSelection = useHaptic();
  const incomingCalls = useAppSelector(selectIncomingCalls);

  const calls = useMemo(
    () =>
      incomingCalls
        .filter(entry => entry.callDirection === 'inbound' && entry.callSid !== call.callSid)
        .sort((a, b) => a.addedAt - b.addedAt),
    [call.callSid, incomingCalls],
  );
  // The OS already prompts for these calls, so the sheet waits as a strip until asked for
  const rungBySystem = calls.some(entry => systemCall.ringsInSystemUi(entry));

  // Taking a ringing call ends the one in progress first; a call can only be joined alone
  const answer = useCallback(
    async (target: LiveCall) => {
      if (isJoining) return false;
      hapticSelection?.();
      cancelCallNotification();
      beginCallSwitch();
      try {
        if (activeCall) await store.dispatch(callActions.endCall()).unwrap();
        const result = await systemCall.answer(store, target);
        if (!result) return false;
        toastJoinOutcome(result.status);
        return true;
      } catch (error) {
        reportAnswerFailure(error);
        return false;
      } finally {
        endCallSwitch();
      }
    },
    [activeCall, hapticSelection, isJoining],
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

  const declineAll = useCallback(() => {
    hapticSelection?.();
    cancelCallNotification();
    calls.forEach(target => {
      systemCall.end(store, target).catch(() => {});
    });
  }, [calls, hapticSelection]);

  return { calls, rungBySystem, answer, decline, declineAll };
};
