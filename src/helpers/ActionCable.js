import BaseActionCableConnector from './BaseActionCableConnector';

import {
  addMessage,
  addConversation,
  updateConversation,
  updateContactsPresence,
} from 'reducer/conversationSlice';

import conversationActions from 'reducer/conversationSlice.action';
import { addOrUpdateActiveUsers } from '../actions/auth';
import { store } from '../store';
import { addUserToTyping, destroyUserFromTyping } from 'reducer/conversationTypingSlice';

import { updateAgentsPresence } from 'reducer/inboxAgentsSlice';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubsubToken, webSocketUrl, accountId, userId) {
    super(pubsubToken, webSocketUrl, accountId, userId);
    this.CancelTyping = [];
    this.events = {
      'message.created': this.onMessageCreated,
      'message.updated': this.onMessageUpdated,
      'conversation.created': this.onConversationCreated,
      'conversation.status_changed': this.onStatusChange,
      'assignee.changed': this.onAssigneeChanged,
      'conversation.read': this.onConversationRead,
      'conversation.updated': this.onConversationUpdated,
      'presence.update': this.onPresenceUpdate,
      'conversation.typing_on': this.onTypingOn,
      'conversation.typing_off': this.onTypingOff,
      // TODO: Handle all these events
      //   'conversation.contact_changed': this.onConversationContactChange,
      //   'contact.deleted': this.onContactDelete,
      //   'contact.updated': this.onContactUpdate,
      //   'conversation.mentioned': this.onConversationMentioned,
      //   'notification.created': this.onNotificationCreated,
      //   'first.reply.created': this.onFirstReplyCreated,
    };
  }

  onMessageCreated = message => {
    store.dispatch(addMessage(message));
  };

  onMessageUpdated = data => {
    store.dispatch(addMessage(data));
  };

  onConversationCreated = data => {
    store.dispatch(addConversation(data));
    store.dispatch(conversationActions.fetchConversationStats({}));
  };

  onStatusChange = data => {
    store.dispatch(updateConversation(data));
    store.dispatch(conversationActions.fetchConversationStats({}));
  };

  onAssigneeChanged = data => {
    const { id } = data;
    if (id) {
      store.dispatch(updateConversation(data));
    }
    store.dispatch(conversationActions.fetchConversationStats({}));
  };

  onConversationRead = data => {
    store.dispatch(updateConversation(data));
  };

  onConversationUpdated = data => {
    const { id } = data;
    if (id) {
      store.dispatch(updateConversation(data));
    }
    store.dispatch(conversationActions.fetchConversationStats({}));
  };

  onPresenceUpdate = ({ contacts, users }) => {
    store.dispatch(
      updateAgentsPresence({
        users,
      }),
    );
    store.dispatch(
      addOrUpdateActiveUsers({
        users,
      }),
    );
    store.dispatch(
      updateContactsPresence({
        contacts,
      }),
    );
  };

  onTypingOn = ({ conversation, user }) => {
    const conversationId = conversation.id;

    this.clearTimer(conversationId);

    store.dispatch(
      addUserToTyping({
        conversationId,
        user,
      }),
    );
    this.initTimer({ conversation, user });
  };

  onTypingOff = ({ conversation, user }) => {
    const conversationId = conversation.id;

    this.clearTimer(conversationId);

    store.dispatch(
      destroyUserFromTyping({
        conversationId,
        user,
      }),
    );
  };

  initTimer = ({ conversation, user }) => {
    const conversationId = conversation.id;
    // Turn off typing automatically after 30 seconds
    this.CancelTyping[conversationId] = setTimeout(() => {
      this.onTypingOff({ conversation, user });
    }, 30000);
  };

  clearTimer = conversationId => {
    const timerEvent = this.CancelTyping.length && this.CancelTyping[conversationId];

    if (timerEvent) {
      clearTimeout(timerEvent);
      this.CancelTyping[conversationId] = null;
    }
  };
}

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }) {
    const actionCable = new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);

    return actionCable;
  },
};
