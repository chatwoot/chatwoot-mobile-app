import {
  updateConversation,
  updateConversationLastActivity,
  addConversation,
  addOrUpdateMessage,
} from '@/store/conversation/conversationSlice';
import { addContact, updateContact, updateContactsPresence } from '@/store/contact/contactSlice';
import { setTypingUsers, removeTypingUser } from '@/store/conversation/conversationTypingSlice';
import BaseActionCableConnector from './baseActionCableConnector';
import { store } from '@/store';
import { Contact, Conversation, Message, PresenceUpdateData, TypingData } from '@/types';
import {
  transformMessage,
  transformConversation,
  transformTypingData,
  transformContact,
  transformNotificationCreatedResponse,
  transformNotificationRemovedResponse,
} from './camelCaseKeys';
import { addNotification } from '@/store/notification/notificationSlice';
import { setCurrentUserAvailability } from '@/store/auth/authSlice';
import { removeNotification } from '@/store/notification/notificationSlice';
import {
  NotificationCreatedResponse,
  NotificationRemovedResponse,
} from '@/store/notification/notificationTypes';
import {
  addCall,
  handleCallStatusChanged,
  isTerminalCallStatus,
  markCallDismissed,
  removeCall,
  setCallActive,
  setCallProviderStatus,
} from '@/store/call/callSlice';
import {
  selectCalls,
  selectDismissedCallSids,
  selectLocalCallSid,
  selectPlacingCall,
} from '@/store/call/callSelectors';
import {
  holdEarlyAccept,
  holdEarlyAnswer,
  holdEarlyProviderStatus,
} from '@/store/call/earlyOutboundEvents';
import type { VoiceCallIncomingEvent, VoiceCallStatusEvent } from '@/store/call/callTypes';
import { selectCurrentUserReceivesCalls, selectUserId } from '@/store/auth/authSelectors';
import {
  callsHiddenByConversationUpdate,
  extractCallData,
  isVoiceCallMessage,
  routeVoiceCallCreated,
  routeVoiceCallUpdated,
  RoutingDecision,
} from './voiceCallRouting';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import { activeMediaProvider, callEngine } from '@/services/voice/callEngine';
import { cancelJoin, pendingJoin } from '@/services/voice/pendingJoins';
import { systemCall, systemEndReason } from '@/services/voice/systemCall';

import { callActions } from '@/store/call/callActions';
import { clearActiveCall, clearLocalCall } from '@/store/call/callSlice';

interface ActionCableConfig {
  pubSubToken: string;
  webSocketUrl: string;
  accountId: number;
  userId: number;
}

class ActionCableConnector extends BaseActionCableConnector {
  private CancelTyping: { [key: number]: NodeJS.Timeout | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected events: { [key: string]: (data: any) => void };

  constructor(pubSubToken: string, webSocketUrl: string, accountId: number, userId: number) {
    super(pubSubToken, webSocketUrl, accountId, userId);
    this.CancelTyping = {};
    this.events = {
      'message.created': this.onMessageCreated,
      'message.updated': this.onMessageUpdated,
      'conversation.created': this.onConversationCreated,
      'conversation.status_changed': this.onStatusChange,
      'conversation.read': this.onConversationRead,
      'assignee.changed': this.onAssigneeChanged,
      'conversation.updated': this.onConversationUpdated,
      'conversation.typing_on': this.onTypingOn,
      'conversation.typing_off': this.onTypingOff,
      'contact.updated': this.onContactUpdate,
      'notification.created': this.onNotificationCreated,
      'notification.deleted': this.onNotificationRemoved,
      'presence.update': this.onPresenceUpdate,
      'voice_call.incoming': this.onVoiceCallIncoming,
      'voice_call.accepted': this.onVoiceCallAccepted,
      'voice_call.outbound_connected': this.onVoiceCallOutboundConnected,
      'voice_call.outbound_accepted': this.onVoiceCallOutboundAccepted,
      'voice_call.ended': this.onVoiceCallEnded,

      // TODO: Handle all these events later
      // 'conversation.contact_changed': this.onConversationContactChange,
      // 'contact.deleted': this.onContactDelete,
      // 'conversation.mentioned': this.onConversationMentioned,
      // 'first.reply.created': this.onFirstReplyCreated,
    };
  }

  onMessageCreated = (data: Message) => {
    const message = transformMessage(data);
    const { conversation, conversationId } = message;
    const lastActivityAt = conversation?.lastActivityAt;
    store.dispatch(updateConversationLastActivity({ lastActivityAt, conversationId }));
    store.dispatch(addOrUpdateMessage(message));
    this.applyRouting(routeVoiceCallCreated(message, this.routingContext()));
  };

  onConversationCreated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(addConversation(conversation));
    store.dispatch(addContact(conversation));
  };

  onMessageUpdated = (data: Message) => {
    const message = transformMessage(data);
    store.dispatch(addOrUpdateMessage(message));
    if (isVoiceCallMessage(message)) {
      const { callSid, status } = extractCallData(message);
      if (callSid && isTerminalCallStatus(status)) {
        systemCall.endedBySid(store, callSid, systemEndReason(store, callSid, status));
        this.hangupIfLocal(callSid);
      }
      if (callSid) store.dispatch(handleCallStatusChanged({ callSid, status }));
      if (callSid && message.call) {
        const state = store.getState();
        const known = selectCalls(state).some(call => call.callSid === callSid);
        if (!known && selectPlacingCall(state) && message.call.providerStatus) {
          holdEarlyProviderStatus(callSid, message.call.providerStatus);
        }
        store.dispatch(
          setCallProviderStatus({ callSid, providerStatus: message.call.providerStatus }),
        );
      }
      this.applyRouting(routeVoiceCallUpdated(message, this.routingContext()));
    }
  };

  onConversationUpdated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    store.dispatch(addContact(conversation));
    this.syncCallVisibility(conversation);
  };

  onAssigneeChanged = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    this.syncCallVisibility(conversation);
  };

  private routingContext = () => {
    const state = store.getState();
    return {
      currentUserId: selectUserId(state),
      receivesCalls: selectCurrentUserReceivesCalls(state),
      dismissedCallSids: selectDismissedCallSids(state),
      localCallSid: selectLocalCallSid(state),
    };
  };

  private applyRouting = (decision: RoutingDecision) => {
    if (decision.action === 'add') store.dispatch(addCall(decision.call));
    if (decision.action === 'remove') store.dispatch(removeCall(decision.callSid));
  };

  private syncCallVisibility = (conversation: Conversation) => {
    const state = store.getState();
    callsHiddenByConversationUpdate(
      conversation,
      selectCalls(state),
      selectUserId(state),
      selectLocalCallSid(state),
    ).forEach(callSid => store.dispatch(removeCall(callSid)));
  };

  // Socket conversation IDs are database IDs.
  onVoiceCallIncoming = (data: VoiceCallIncomingEvent) => {
    if (data?.provider !== VOICE_CALL_PROVIDERS.WHATSAPP) return;
    if (!selectCurrentUserReceivesCalls(store.getState())) return;
    store.dispatch(
      addCall({
        callSid: data.call_id,
        callId: data.id,
        inboxId: data.inbox_id,
        accountId: data.account_id,
        callDirection: 'inbound',
        provider: VOICE_CALL_PROVIDERS.WHATSAPP,
        sdpOffer: data.sdp_offer,
        iceServers: data.ice_servers,
        caller: data.caller,
      }),
    );
  };

  onVoiceCallAccepted = (data: VoiceCallStatusEvent) => {
    if (!data?.provider) return;
    store.dispatch(markCallDismissed(data.call_id));
    if (selectLocalCallSid(store.getState()) === data.call_id) return;
    systemCall.endedBySid(store, data.call_id, 'answered_elsewhere');
    store.dispatch(removeCall(data.call_id));
  };

  onVoiceCallOutboundConnected = (data: VoiceCallStatusEvent) => {
    if (data?.provider !== VOICE_CALL_PROVIDERS.WHATSAPP || !data.sdp_answer) return;
    const state = store.getState();
    if (!selectCalls(state).some(call => call.callSid === data.call_id)) {
      if (selectPlacingCall(state)) holdEarlyAnswer(data.call_id, data.sdp_answer);
      return;
    }
    if (selectLocalCallSid(state) === data.call_id) {
      callEngine.whatsapp
        .applyAnswer(data.sdp_answer)
        .catch(() => store.dispatch(callActions.rejectIncomingCall(data.call_id)));
    }
  };

  private hangupIfLocal = (callSid: string) => {
    const pending = pendingJoin(callSid);
    if (pending) {
      cancelJoin(callSid);
      this.releaseMediaIfLocal(callSid);
      const release = () => this.hangupIfLocal(callSid);
      pending.then(release, release);
      return;
    }
    if (!this.releaseMediaIfLocal(callSid)) return;
    store.dispatch(clearActiveCall());
    store.dispatch(clearLocalCall(callSid));
  };

  private releaseMediaIfLocal = (callSid: string) => {
    const state = store.getState();
    if (selectLocalCallSid(state) !== callSid) return false;
    const call = selectCalls(state).find(entry => entry.callSid === callSid);
    callEngine.hangup(call?.provider ?? activeMediaProvider() ?? 'whatsapp').catch(() => {});
    return true;
  };

  onVoiceCallOutboundAccepted = (data: VoiceCallStatusEvent) => {
    if (data?.provider !== VOICE_CALL_PROVIDERS.WHATSAPP) return;
    const state = store.getState();
    const exists = selectCalls(state).some(call => call.callSid === data.call_id);
    if (!exists) {
      if (selectPlacingCall(state)) holdEarlyAccept(data.call_id);
      return;
    }
    store.dispatch(setCallActive(data.call_id));
  };

  onVoiceCallEnded = (data: VoiceCallStatusEvent) => {
    if (!data?.provider) return;
    store.dispatch(markCallDismissed(data.call_id));
    systemCall.endedBySid(store, data.call_id, systemEndReason(store, data.call_id, data.status));
    this.hangupIfLocal(data.call_id);
    store.dispatch(removeCall(data.call_id));
  };

  onStatusChange = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
  };

  onConversationRead = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
  };

  onContactUpdate = (data: Contact) => {
    const contact = transformContact(data);
    store.dispatch(updateContact(contact));
  };

  onNotificationCreated = (data: NotificationCreatedResponse) => {
    const notification: NotificationCreatedResponse = transformNotificationCreatedResponse(data);
    store.dispatch(addNotification(notification));
  };

  onNotificationRemoved = (data: NotificationRemovedResponse) => {
    const notification: NotificationRemovedResponse = transformNotificationRemovedResponse(data);
    store.dispatch(removeNotification(notification));
  };

  onTypingOn = (data: TypingData) => {
    const typingData = transformTypingData(data);
    const { conversation, user } = typingData;
    const conversationId = conversation.id;
    store.dispatch(setTypingUsers({ conversationId, user }));
    this.initTimer(typingData);
  };

  onTypingOff = (data: TypingData) => {
    const typingData = transformTypingData(data);
    const { conversation, user } = typingData;
    const conversationId = conversation.id;
    store.dispatch(removeTypingUser({ conversationId, user }));
    this.clearTimer(conversationId);
  };

  private initTimer = (data: TypingData) => {
    const { conversation } = data;
    const conversationId = conversation.id;
    if (this.CancelTyping[conversationId]) {
      clearTimeout(this.CancelTyping[conversationId]!);
      this.CancelTyping[conversationId] = null;
    }
    this.CancelTyping[conversationId] = setTimeout(() => {
      this.onTypingOff(data);
    }, 30000);
  };

  private clearTimer = (conversationId: number) => {
    if (this.CancelTyping[conversationId]) {
      clearTimeout(this.CancelTyping[conversationId]!);
      this.CancelTyping[conversationId] = null;
    }
  };

  onPresenceUpdate = (data: PresenceUpdateData) => {
    const { contacts, users } = data;
    store.dispatch(
      updateContactsPresence({
        contacts,
      }),
    );
    store.dispatch(
      setCurrentUserAvailability({
        users,
      }),
    );
  };
}

let currentConnector: ActionCableConnector | null = null;

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }: ActionCableConfig) {
    currentConnector?.disconnect();
    currentConnector = new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);
    return currentConnector;
  },

  ensureConnected() {
    currentConnector?.ensureConnected();
  },

  isInitialised() {
    return currentConnector !== null;
  },
};
