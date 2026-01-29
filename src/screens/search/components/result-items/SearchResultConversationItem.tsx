import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components-next/common';
import { tailwind } from '@/theme';
import type { Conversation } from '@/types/Conversation';
import { HighlightedText } from '../shared/HighlightedText';
import { useScaleAnimation } from '@/utils';
import { getChannelIcon } from '@/utils/getChannelIcon';
import { ChannelIndicator } from '@/components-next/list-components/ChannelIndicator';
import { LastActivityTime } from '@/screens/conversations/components/conversation-item/LastActivityTime';
import { ConversationId } from '@/screens/conversations/components/conversation-item/ConversationId';

type SearchResultConversationItemProps = {
  conversation: Conversation;
  searchQuery: string;
  onPress: () => void | Promise<void>;
  isLast?: boolean;
};

export const SearchResultConversationItem = ({
  conversation,
  searchQuery,
  onPress,
  isLast = false,
}: SearchResultConversationItemProps) => {
  const contactName =
    conversation.meta?.sender?.name ||
    (conversation as any).contact?.name ||
    '';
  const contactEmail =
    conversation.meta?.sender?.email ||
    (conversation as any).contact?.email ||
    '';
  const emailSubject =
    (conversation as any).additionalAttributes?.mailSubject ||
    (conversation as any).additionalAttributes?.emailSubject ||
    '';
  const inbox = (conversation as any).inbox;
  const inboxName = inbox?.name || '';
  const channelType = inbox?.channelType || conversation.meta?.channel;
  const medium = inbox?.medium || '';
  const additionalType = (conversation as any).additionalAttributes?.type || '';
  const createdAt = conversation.createdAt;

  const infoItems = [
    { label: 'From', value: contactName, show: !!contactName },
    { label: 'Email', value: contactEmail, show: !!contactEmail },
    { label: 'Email Subject', value: emailSubject, show: !!emailSubject },
  ].filter(item => item.show);

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
          <Animated.View
            style={tailwind.style('flex-row items-center justify-between mb-2')}>
            <Animated.View style={tailwind.style('flex-row items-center gap-3 flex-1')}>
              <ConversationId id={conversation.id} />
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
            </Animated.View>
            {createdAt && (
              <LastActivityTime timestamp={createdAt} />
            )}
          </Animated.View>
          {infoItems.length > 0 && (
            <Animated.View style={tailwind.style('flex-row flex-wrap gap-x-2 gap-y-1.5')}>
              {infoItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Animated.View style={tailwind.style('flex-row items-center')}>
                    <Animated.Text
                      style={tailwind.style(
                        'text-sm font-inter-420-20 leading-[17px] text-gray-600',
                      )}>
                      {item.label}:
                    </Animated.Text>
                    <HighlightedText
                        text={item.value}
                        searchQuery={searchQuery}
                        style={tailwind.style(
                          'text-sm font-inter-420-20 leading-[17px] text-gray-800 ml-1',
                        )}
                        numberOfLines={1}
                      />
                  </Animated.View>
                  {index < infoItems.length - 1 && (
                    <Animated.View style={tailwind.style('w-px h-3 bg-gray-300')} />
                  )}
                </React.Fragment>
              ))}
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
