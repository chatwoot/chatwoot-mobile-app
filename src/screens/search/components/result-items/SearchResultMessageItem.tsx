import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components-next/common';
import { tailwind } from '@/theme';
import type { Message } from '@/types/Message';
import { HighlightedText } from '../shared/HighlightedText';
import { useScaleAnimation } from '@/utils';
import { getChannelIcon } from '@/utils/getChannelIcon';
import { LockIcon } from '@/svg-icons';
import { useAppSelector } from '@/hooks';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { LastActivityTime } from '@/screens/conversations/components/conversation-item/LastActivityTime';
import { ConversationId } from '@/screens/conversations/components/conversation-item/ConversationId';

type SearchResultMessageItemProps = {
  message: Message;
  searchQuery: string;
  onPress: () => void | Promise<void>;
  isLast?: boolean;
};

export const SearchResultMessageItem = ({
  message,
  searchQuery,
  onPress,
  isLast = false,
}: SearchResultMessageItemProps) => {
  const senderName = message.sender?.name || 'Bot';
  const conversationId = message.conversationId;
  const inboxId = message.inboxId;
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : null));
  const inboxName = inbox?.name || '';
  const channelType = inbox?.channelType;
  const medium = inbox?.medium || '';
  const additionalType =
    (message.conversation as { additionalAttributes?: { type?: string } } | undefined)
      ?.additionalAttributes?.type || '';
  const createdAt = message.createdAt;

  const audioAttachment = message.attachments?.find(a => a.fileType === 'audio');
  const transcribedText =
    (audioAttachment as { transcribedText?: string; transcribed_text?: string } | undefined)
      ?.transcribedText ||
    (audioAttachment as { transcribedText?: string; transcribed_text?: string } | undefined)
      ?.transcribed_text ||
    '';
  const messageContent =
    message.content || message.contentAttributes?.email?.subject || transcribedText || '';

  const { animatedStyle, handlers } = useScaleAnimation();

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          tailwind.style(
            'px-4 py-3',
            !isLast && 'border-b border-b-blackA-A3',
            pressed ? 'bg-gray-50' : '',
          ),
        ]}
        {...handlers}>
        <Animated.View style={animatedStyle}>
          <Animated.View style={tailwind.style('flex-row items-center justify-between mb-2')}>
            <Animated.View style={tailwind.style('flex-row items-center gap-3 flex-1')}>
              <ConversationId id={conversationId} />
              {inboxName && (
                <>
                  <Animated.View style={tailwind.style('w-px h-3 bg-gray-300')} />
                  <Animated.View style={tailwind.style('flex-row items-center gap-1.5')}>
                    {inbox && channelType && (
                      <Animated.View
                        style={tailwind.style(
                          'h-4 w-4 rounded-full bg-gray-100 items-center justify-center',
                        )}>
                        <Icon
                          icon={getChannelIcon(channelType, medium, additionalType)}
                          size={10}
                        />
                      </Animated.View>
                    )}
                    <Animated.Text
                      style={tailwind.style(
                        'text-sm font-inter-420-20 leading-[17px] text-gray-950',
                      )}>
                      {inboxName}
                    </Animated.Text>
                  </Animated.View>
                </>
              )}
              {message.private && (
                <>
                  <Animated.View style={tailwind.style('w-px h-3 bg-gray-300')} />
                  <Animated.View style={tailwind.style('flex-row items-center gap-1.5')}>
                    <Icon icon={<LockIcon fill={tailwind.color('text-amber-700')} />} size={14} />
                    <Animated.Text
                      style={tailwind.style(
                        'text-sm font-inter-420-20 leading-[17px] text-amber-700',
                      )}>
                      Private note
                    </Animated.Text>
                  </Animated.View>
                </>
              )}
            </Animated.View>
            {createdAt && <LastActivityTime timestamp={createdAt} />}
          </Animated.View>
          {messageContent && (
            <Animated.View style={tailwind.style('mt-1')}>
              <Animated.Text numberOfLines={2}>
                <Animated.Text
                  style={tailwind.style('text-sm font-inter-420-20 leading-[17px] text-gray-600')}>
                  {senderName} wrote:{' '}
                </Animated.Text>
                <HighlightedText
                  text={messageContent}
                  searchQuery={searchQuery}
                  style={tailwind.style('text-sm font-inter-420-20 leading-[17px] text-gray-800')}
                />
              </Animated.Text>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
