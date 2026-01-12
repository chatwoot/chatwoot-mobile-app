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
import { addNotification, removeNotification } from '@/store/notification/notificationSlice';
import { setCurrentUserAvailability } from '@/store/auth/authSlice';
import {
  NotificationCreatedResponse,
  NotificationRemovedResponse,
} from '@/store/notification/notificationTypes';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

// Deduplication: Track recently notified message IDs to prevent duplicates
const recentlyNotifiedMessages = new Set<string>();
const NOTIFICATION_DEDUP_TIMEOUT = 5000; // 5 seconds

const shouldShowNotification = (notificationKey: string): boolean => {
  if (recentlyNotifiedMessages.has(notificationKey)) {
    console.log('[ActionCable] ⚠️ Duplicate notification blocked:', notificationKey);
    return false; // Already notified
  }
  recentlyNotifiedMessages.add(notificationKey);
  // Clean up after timeout
  setTimeout(() => recentlyNotifiedMessages.delete(notificationKey), NOTIFICATION_DEDUP_TIMEOUT);
  return true;
};

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

      // TODO: Handle all these events later
      // 'conversation.contact_changed': this.onConversationContactChange,
      // 'contact.deleted': this.onContactDelete,
      // 'conversation.mentioned': this.onConversationMentioned,
      // 'first.reply.created': this.onFirstReplyCreated,
    };
  }

  onMessageCreated = async (data: Message) => {
    const message = transformMessage(data);
    const { conversation, conversationId } = message;
    const lastActivityAt = conversation?.lastActivityAt;
    store.dispatch(updateConversationLastActivity({ lastActivityAt, conversationId }));
    store.dispatch(addOrUpdateMessage(message));

    // Display notification for incoming message
    try {
      const currentUserId = store.getState().auth.user?.id;
      const senderId = message.sender?.id;
      const senderName = message.sender?.name || 'New Message';
      const messageContent = message.content || 'You have a new message';
      const messageType = message.messageType; // 0 = incoming, 1 = outgoing
      const senderType = message.sender?.type?.toLowerCase(); // 'contact' = real user, 'agent_bot' = AI
      
      console.log('[ActionCable] Message received:', {
        senderId,
        currentUserId,
        messageType,
        senderType,
        senderName,
      });
      
      // Only show notification if:
      // 1. Message is from someone else (not current user) OR senderId is undefined (contact message)
      // 2. Message is incoming (messageType === 0)
      // 3. Sender is not an AI bot
      const isNotFromCurrentUser = !senderId || senderId !== currentUserId;
      const isIncoming = messageType === 0;
      const isNotBot = senderType !== 'agent_bot' && senderType !== 'agentbot';
      
      const shouldNotify = isNotFromCurrentUser && isIncoming && isNotBot;
      
      console.log('[ActionCable] Notification check:', {
        isNotFromCurrentUser,
        isIncoming,
        isNotBot,
        shouldNotify,
      });
      
      if (shouldNotify && message.id && shouldShowNotification(`msg_${message.id}`)) {
        console.log('[ActionCable] 🔔 Displaying notification for message from:', senderName);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: senderName,
            body: messageContent,
            data: {
              conversationId: String(conversationId),
              notificationType: 'message_created',
              messageId: message.id,
            },
            sound: 'default',
            badge: 1,
            ...(Platform.OS === 'android' && {
              channelId: 'aloochat_messages',
            }),
          },
          trigger: null,
        });
        
        console.log('[ActionCable] ✅ Notification displayed successfully');
      } else {
        console.log('[ActionCable] ⏭️ Skipping notification - bot or outgoing message');
      }
    } catch (error) {
      console.error('[ActionCable] ❌ Failed to display notification:', error);
    }
  };

  onConversationCreated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(addConversation(conversation));
    store.dispatch(addContact(conversation));
  };

  onMessageUpdated = (data: Message) => {
    const message = transformMessage(data);
    store.dispatch(addOrUpdateMessage(message));
  };

  onConversationUpdated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    store.dispatch(addContact(conversation));
  };

  onAssigneeChanged = async (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));

    // Display notification for conversation assignment
    try {
      const currentUserId = store.getState().auth.user?.id;
      const assigneeId = conversation.meta?.assignee?.id;
      
      // Only show notification if conversation is assigned to current user
      const assignmentKey = `assign_${conversation.id}_${assigneeId}`;
      if (assigneeId && assigneeId === currentUserId && shouldShowNotification(assignmentKey)) {
        console.log('[ActionCable] Conversation assigned to you - displaying notification');
        
        const contactName = conversation.meta?.sender?.name || 'Unknown';
        const conversationId = conversation.id;
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📋 Conversation Assigned',
            body: `New conversation from ${contactName} has been assigned to you`,
            data: {
              conversationId: String(conversationId),
              notificationType: 'conversation_assignment',
            },
            sound: 'default',
            badge: 1,
            ...(Platform.OS === 'android' && {
              channelId: 'aloochat_messages',
            }),
          },
          trigger: null,
        });
        
        console.log('[ActionCable] ✅ Notification displayed for assignment');
      }
    } catch (error) {
      console.error('[ActionCable] Failed to display assignment notification:', error);
    }
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

  onNotificationCreated = async (data: NotificationCreatedResponse) => {
    const notification: NotificationCreatedResponse = transformNotificationCreatedResponse(data);
    store.dispatch(addNotification(notification));
    
    // Display notification for notification activities
    try {
      const notificationType = notification.notificationType;
      const primaryActor = notification.primaryActor;
      const senderName = (primaryActor?.meta?.sender as any)?.name || 'AlooChat';
      const messageContent = (primaryActor?.meta?.lastMessage as any)?.content || '';
      const conversationId = primaryActor?.conversationId || primaryActor?.id;
      
      console.log('[ActionCable] Notification created:', {
        notificationType,
        senderName,
        conversationId,
      });
      
      // Define which notification types should show a notification
      const notifiableTypes = [
        'conversation_creation',
        'conversation_assignment', 
        'assigned_conversation_new_message',
        'participating_conversation_new_message',
        'conversation_mention',
        'sla_missed_first_response',
        'sla_missed_next_response',
        'sla_missed_resolution',
      ];
      
      if (notifiableTypes.includes(notificationType)) {
        let title = 'AlooChat';
        let body = 'You have a new notification';
        
        switch (notificationType) {
          case 'conversation_assignment':
            title = '📋 Conversation Assigned';
            body = `A conversation from ${senderName} has been assigned to you`;
            break;
          case 'assigned_conversation_new_message':
          case 'participating_conversation_new_message':
            title = senderName;
            body = messageContent || 'New message received';
            break;
          case 'conversation_mention':
            title = '🔔 You were mentioned';
            body = `${senderName} mentioned you in a conversation`;
            break;
          case 'conversation_creation':
            title = '💬 New Conversation';
            body = `New conversation from ${senderName}`;
            break;
          case 'sla_missed_first_response':
          case 'sla_missed_next_response':
          case 'sla_missed_resolution':
            title = '⚠️ SLA Alert';
            body = `Conversation #${conversationId} requires attention`;
            break;
          default:
            title = notification.pushMessageTitle || senderName;
            body = messageContent || 'You have a new notification';
        }
        
        console.log('[ActionCable] 🔔 Displaying notification:', { title, body });
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              conversationId: String(conversationId || ''),
              notificationType,
            },
            sound: 'default',
            badge: 1,
            ...(Platform.OS === 'android' && {
              channelId: 'aloochat_messages',
            }),
          },
          trigger: null,
        });
        
        console.log('[ActionCable] ✅ Notification displayed for:', notificationType);
      }
    } catch (error) {
      console.error('[ActionCable] ❌ Failed to display notification:', error);
    }
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
    // Always clear existing timer before creating new one
    this.clearTimer(conversationId);
    
    this.CancelTyping[conversationId] = setTimeout(() => {
      this.onTypingOff(data);
      this.CancelTyping[conversationId] = null;
    }, 30000);
  };

  private clearTimer = (conversationId: number) => {
    if (this.CancelTyping[conversationId]) {
      clearTimeout(this.CancelTyping[conversationId]!);
      this.CancelTyping[conversationId] = null;
    }
  };

  // Clear all timers on disconnect
  clearAllTimers = () => {
    Object.keys(this.CancelTyping).forEach(key => {
      const conversationId = parseInt(key);
      this.clearTimer(conversationId);
    });
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

// Singleton instance to prevent multiple connections
let instance: ActionCableConnector | null = null;

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }: ActionCableConfig) {
    // Return existing instance if already connected with same config
    if (instance) {
      console.log('[ActionCable] ⚠️ Already connected - reusing existing instance');
      return instance;
    }
    
    console.log('[ActionCable] 🔌 Creating new connection');
    instance = new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);
    return instance;
  },
  
  // Allow resetting for logout scenarios
  reset() {
    console.log('[ActionCable] 🔄 Resetting connection');
    instance = null;
  },
};
