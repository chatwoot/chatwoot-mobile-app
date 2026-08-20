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

export const switchAccount = (dispatch: AppDispatch, accountId: number) => {
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
  dispatch(setAccount(accountId));
  dispatch(authActions.setActiveAccount({ profile: { account_id: accountId } }));
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
