import type { AppDispatch } from '@/store';
import type { Account } from '@/types/Account';
import { getStore } from '@/store/storeAccessor';
import { setAccount } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { clearAllContacts } from '@/store/contact/contactSlice';
import { resetNotifications } from '@/store/notification/notificationSlice';
import { clearSearchResults } from '@/store/search/searchSlice';
import { clearSelection } from '@/store/conversation/conversationSelectedSlice';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { resetFilters } from '@/store/conversation/conversationFilterSlice';
import { clearAssignableAgents } from '@/store/assignable-agent/assignableAgentSlice';
import { clearAllParticipants } from '@/store/conversation-participant/conversationParticipantSlice';
import { resetCopilot } from '@/store/copilot/copilotSlice';
import { resetSentMessage } from '@/store/conversation/sendMessageSlice';
import { keepOnlyLocalCall } from '@/store/call/callSlice';
import { selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import {
  selectActiveCall,
  selectCallsState,
  selectLocalCallSid,
  selectPlacingCall,
} from '@/store/call/callSelectors';
import i18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';

// The account of the call this device is on, joining or placing, or null with none. The
// socket follows the account on screen, so a call's signaling stops on a switch away.
const accountWithCall = (): number | null => {
  const state = getStore().getState();
  const calls = selectCallsState(state);
  const ownSid = calls.joiningCallSid ?? selectLocalCallSid(state);
  const call = selectActiveCall(state) ?? calls.calls.find(entry => entry.callSid === ownSid);
  const placing = selectPlacingCall(state);
  if (!call && !placing && !calls.isJoining) return null;
  return call?.accountId ?? placing?.accountId ?? selectCurrentUserAccountId(state) ?? null;
};

// Switches the account on screen. While a call is on this device the switch is refused,
// unless it is to the call's own account; returns whether it switched.
export const switchAccount = (dispatch: AppDispatch, accountId: number) => {
  const callAccountId = accountWithCall();
  if (callAccountId != null && Number(callAccountId) !== Number(accountId)) {
    showToast({ message: i18n.t('CONVERSATION.VOICE_WIDGET.END_CALL_TO_SWITCH_ACCOUNT') });
    return false;
  }
  dispatch(clearAllContacts());
  dispatch(clearAllConversations());
  dispatch(resetNotifications());
  dispatch(clearSearchResults());
  dispatch(clearSelection());
  dispatch(setCurrentState('none'));
  dispatch(resetFilters());
  dispatch(clearAssignableAgents());
  dispatch(clearAllParticipants());
  dispatch(resetCopilot());
  dispatch(resetSentMessage());
  // The account being left, read before it changes
  dispatch((keep, getState) =>
    keep(
      keepOnlyLocalCall({ leaving: selectCurrentUserAccountId(getState()), entering: accountId }),
    ),
  );
  dispatch(setAccount(accountId));
  dispatch(authActions.setActiveAccount({ profile: { account_id: accountId } }));
  return true;
};

// Returns null when no switch is needed or possible: id missing, already active, or not a member.
export const resolveAccountSwitch = (accountId?: number | null): number | null => {
  if (!accountId) {
    return null;
  }
  const { user } = getStore().getState().auth;
  if (!user || Number(user.account_id) === Number(accountId)) {
    return null;
  }
  const hasAccess = (user.accounts ?? []).some(
    (account: Account) => Number(account.id) === Number(accountId),
  );
  return hasAccess ? accountId : null;
};
