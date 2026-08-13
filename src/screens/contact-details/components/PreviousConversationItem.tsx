import React from 'react';
import Animated, { runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StackActions, useNavigation } from '@react-navigation/native';

import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { Conversation } from '@/types';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { getLastMessage } from '@/utils';
import { ConversationItemDetailContent } from '@/screens/conversations/components/conversation-item/ConversationItemDetail';

type PreviousConversationItemProps = {
  conversation: Conversation;
};

export const PreviousConversationItem = ({ conversation }: PreviousConversationItemProps) => {
  const navigation = useNavigation();
  const inbox = useAppSelector(state => selectInboxById(state, conversation.inboxId));
  const allLabels = useAppSelector(selectAllLabels);

  const lastMessage = getLastMessage({
    ...conversation,
    messages: conversation.messages ?? [],
  });

  const navigateToConversation = () => {
    navigation.dispatch(
      StackActions.replace('ChatScreen', {
        conversationId: conversation.id,
        isConversationOpenedExternally: false,
      }),
    );
  };

  const tapGesture = Gesture.Tap().onEnd(() => runOnJS(navigateToConversation)());

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={tailwind.style('px-3 flex-row')}>
        <ConversationItemDetailContent
          id={conversation.id}
          priority={conversation.priority}
          unreadCount={conversation.unreadCount}
          labels={conversation.labels}
          assignee={conversation.meta?.assignee ?? null}
          senderName={conversation.meta?.sender?.name ?? ''}
          timestamp={conversation.lastActivityAt || conversation.timestamp}
          inbox={inbox ?? null}
          lastMessage={lastMessage}
          inboxId={conversation.inboxId}
          slaPolicyId={conversation.appliedSla ? conversation.slaPolicyId : null}
          appliedSla={conversation.appliedSla}
          appliedSlaConversationDetails={{
            firstReplyCreatedAt: conversation.firstReplyCreatedAt,
            waitingSince: conversation.waitingSince,
            status: conversation.status,
          }}
          additionalAttributes={conversation.additionalAttributes}
          allLabels={allLabels}
        />
      </Animated.View>
    </GestureDetector>
  );
};

PreviousConversationItem.displayName = 'PreviousConversationItem';
