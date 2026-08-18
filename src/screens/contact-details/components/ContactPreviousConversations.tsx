import React from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { getLastMessage } from '@/utils';
import {
  selectContactConversationsByContactId,
  selectHasLoadedContactConversations,
} from '@/store/contact/contactConversationSlice';

import { PreviousConversationItem } from './PreviousConversationItem';

interface ContactPreviousConversationsProps {
  contactId: number;
  currentConversationId?: number;
}

export const ContactPreviousConversations = (props: ContactPreviousConversationsProps) => {
  const { contactId, currentConversationId } = props;

  const conversations = useAppSelector(selectContactConversationsByContactId(contactId));
  const hasLoaded = useAppSelector(selectHasLoadedContactConversations(contactId));

  const previousConversations = conversations.filter(
    conversation =>
      conversation.id !== currentConversationId &&
      getLastMessage({ ...conversation, messages: conversation.messages ?? [] }) !== null,
  );

  const renderContent = () => {
    if (!hasLoaded) {
      return (
        <Animated.View style={tailwind.style('items-center justify-center py-6')}>
          <ActivityIndicator />
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
        <Animated.View style={tailwind.style('rounded-[13px] overflow-hidden')}>
          {previousConversations.length === 0 ? (
            <Animated.View style={tailwind.style('items-center justify-center py-4 px-4')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-900',
                )}>
                {i18n.t('CONTACT_CONVERSATIONS.EMPTY')}
              </Animated.Text>
            </Animated.View>
          ) : (
            previousConversations.map(conversation => (
              <PreviousConversationItem key={conversation.id} conversation={conversation} />
            ))
          )}
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={tailwind.style('pt-10')}>
      <Animated.View style={tailwind.style('pl-4 pb-3')}>
        <Animated.Text
          style={tailwind.style(
            'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700',
          )}>
          {i18n.t('CONTACT_CONVERSATIONS.TITLE')}
        </Animated.Text>
      </Animated.View>
      {renderContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
      },
      android: {
        elevation: 4,
        backgroundColor: 'white',
      },
    }) || {},
});
