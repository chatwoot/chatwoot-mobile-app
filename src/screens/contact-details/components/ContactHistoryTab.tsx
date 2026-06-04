import React, { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { MESSAGE_TYPES } from '@/constants';
import i18n from '@/i18n';
import { contactConversationActions } from '@/store/contact/contactConversationActions';
import { selectContactConversations } from '@/store/contact/contactConversationSlice';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { tailwind } from '@/theme';
import type { Contact, Conversation, Message } from '@/types';
import { getChannelIcon, getLastMessage } from '@/utils';
import { getPlainText } from '@/utils/messageFormatterUtils';
import { LastActivityTime } from '@/screens/conversations/components/conversation-item/LastActivityTime';
import { ConversationId } from '@/screens/conversations/components/conversation-item/ConversationId';
import { useAppDispatch, useAppSelector } from '@/hooks';

type ContactHistoryTabProps = {
  contactId?: number;
  contact?: Contact;
};

const getMessagePreview = (message?: Message | null) => {
  if (!message) {
    return i18n.t('CONTACT_DETAILS.HISTORY_EMPTY_PREVIEW');
  }

  const transcript = message.contentAttributes?.data?.transcript;
  const summary = message.contentAttributes?.data?.summary;
  const emailSubject = message.contentAttributes?.email?.subject;
  return getPlainText(message.content || transcript || summary || emailSubject || '');
};

const getSenderName = (message: Message | null | undefined, contact?: Contact) => {
  if (message?.messageType === MESSAGE_TYPES.ACTIVITY) {
    return i18n.t('CONTACT_DETAILS.HISTORY_SYSTEM_ACTOR');
  }

  return message?.sender?.name || contact?.name || i18n.t('CONTACTS.UNKNOWN');
};

const ConversationHistoryRow = ({
  conversation,
  contact,
}: {
  conversation: Conversation;
  contact?: Contact;
}) => {
  const navigation = useNavigation();
  const inbox = useAppSelector(state => selectInboxById(state, conversation.inboxId));
  const lastMessage = getLastMessage(conversation) || conversation.lastNonActivityMessage;
  const senderName = getSenderName(lastMessage, contact);
  const preview = getMessagePreview(lastMessage);
  const timestamp = conversation.lastActivityAt || conversation.createdAt;
  const contactName = contact?.name || conversation.meta?.sender?.name || senderName;
  const contactThumbnail = contact?.thumbnail || conversation.meta?.sender?.thumbnail;

  const openConversation = () => {
    navigation.dispatch(
      StackActions.replace('ChatScreen', {
        conversationId: conversation.id,
      }),
    );
  };

  return (
    <Pressable
      onPress={openConversation}
      style={({ pressed }) =>
        tailwind.style('px-4 py-3 border-b border-blackA-A3', pressed ? 'bg-gray-50' : '')
      }>
      <Animated.View style={tailwind.style('flex-row')}>
        <Avatar
          name={contactName}
          src={contactThumbnail ? { uri: contactThumbnail } : undefined}
          size="md"
        />
        <Animated.View style={tailwind.style('ml-3 flex-1')}>
          <Animated.View style={tailwind.style('flex-row items-center justify-between mb-1')}>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('text-base font-inter-medium-24 text-gray-950 flex-1')}>
              {contactName}
            </Animated.Text>
            {timestamp ? <LastActivityTime timestamp={timestamp} /> : null}
          </Animated.View>
          <Animated.Text
            numberOfLines={2}
            style={tailwind.style('text-sm font-inter-420-20 leading-[18px] text-gray-950')}>
            {preview}
          </Animated.Text>
          <Animated.View style={tailwind.style('flex-row items-center gap-2 mt-2')}>
            <ConversationId id={conversation.id} />
            {inbox ? (
              <>
                <Animated.View style={tailwind.style('w-px h-3 bg-gray-300')} />
                <Animated.View style={tailwind.style('flex-row items-center gap-1.5 flex-1')}>
                  <Animated.View
                    style={tailwind.style(
                      'h-5 w-5 rounded-full bg-gray-100 items-center justify-center',
                    )}>
                    <Icon
                      icon={getChannelIcon(
                        inbox.channelType,
                        inbox.medium,
                        '',
                        `${inbox.name} ${inbox.provider}`,
                      )}
                      size={12}
                    />
                  </Animated.View>
                  <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                      'text-sm font-inter-420-20 leading-[17px] text-gray-700 flex-1',
                    )}>
                    {inbox.name}
                  </Animated.Text>
                </Animated.View>
              </>
            ) : null}
          </Animated.View>
          {senderName !== contactName ? (
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('text-xs font-inter-420-20 leading-[16px] text-gray-700 mt-1')}>
              {i18n.t('CONTACT_DETAILS.HISTORY_SENDER', { sender: senderName })}
            </Animated.Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const ContactHistoryTab = ({ contactId, contact }: ContactHistoryTabProps) => {
  const dispatch = useAppDispatch();
  const conversationRecords = useAppSelector(selectContactConversations);
  const conversations = useMemo(
    () =>
      contactId
        ? [...(conversationRecords[contactId] || [])].sort(
            (current, next) =>
              (next.lastActivityAt || next.createdAt) -
              (current.lastActivityAt || current.createdAt),
          )
        : [],
    [contactId, conversationRecords],
  );

  useEffect(() => {
    if (contactId) {
      dispatch(contactConversationActions.getContactConversations({ contactId }));
    }
  }, [contactId, dispatch]);

  if (!contactId) {
    return (
      <Animated.Text
        style={tailwind.style(
          'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-10',
        )}>
        {i18n.t('CONTACT_DETAILS.HISTORY_UNAVAILABLE')}
      </Animated.Text>
    );
  }

  if (!conversations.length) {
    return (
      <View style={tailwind.style('items-center justify-center py-10 px-8')}>
        <Animated.Text
          style={tailwind.style('text-sm font-inter-420-20 text-gray-700 text-center')}>
          {i18n.t('CONTACT_DETAILS.HISTORY_EMPTY')}
        </Animated.Text>
      </View>
    );
  }

  return (
    <Animated.View style={tailwind.style('pt-3')}>
      {conversations.map(conversation => (
        <ConversationHistoryRow
          key={conversation.id}
          conversation={conversation}
          contact={contact}
        />
      ))}
    </Animated.View>
  );
};
