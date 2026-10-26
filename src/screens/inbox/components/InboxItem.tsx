import React from 'react';
import Animated from 'react-native-reanimated';
import { Avatar } from '@/components-next';
import { tailwind } from '@/theme';
import type { NotificationType } from '@/types/Notification';
import { ConversationPriority } from '@/types/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { PriorityIndicator, ChannelIndicator } from '@/components-next/list-components';

import { Inbox } from '@/types/Inbox';
import { ConversationAdditionalAttributes } from '@/types/Conversation';
import { NotificationTypeIndicator } from './NotificationTypeIndicator';
import { IOS_LIST_TEXT, useIOSListText } from '@/utils';
import { useIsRowSelected } from '@/navigation/split/SelectedRowBackground';

type InboxItemProps = {
  isRead: boolean;
  conversationId: number;
  sender?: {
    name: string;
    thumbnail: string;
  };
  assignee?: {
    name: string;
    thumbnail: string;
  };
  lastActivityAt: () => string;
  priority?: ConversationPriority | null;
  inbox: Inbox | null;
  additionalAttributes: ConversationAdditionalAttributes;
  pushMessageTitle: string;
  notificationType: NotificationType;
};

export const InboxItemComponent = (props: InboxItemProps) => {
  const iosText = useIOSListText();
  const isRowSelected = useIsRowSelected();
  const {
    isRead,
    inbox,
    assignee,
    conversationId,
    sender,
    lastActivityAt,
    priority,
    additionalAttributes,
    pushMessageTitle,
    notificationType,
  } = props;

  const hasAssignee = assignee?.name || assignee?.thumbnail;

  return (
    <Animated.View
      style={tailwind.style(
        // Same 16pt side and 12pt vertical padding as Conversations rows on the iOS list layout.
        'py-3 border-b-[1px]',
        // iOS list layout: the divider ends where the selection highlight ends (6pt from the
        // edge); 10pt inner padding keeps the content at the 16pt margin. Read rows fade with
        // opacity rather than a white overlay, so the highlight behind stays one even color.
        iosText ? 'ml-4 mr-1.5 pr-2.5' : 'ml-3 pr-4',
        iosText && isRead ? 'opacity-50' : '',
        isRowSelected ? 'border-b-transparent' : 'border-b-blackA-A3',
      )}>
      <Animated.View style={tailwind.style('')}>
        <AnimatedNativeView
          style={tailwind.style(
            'flex flex-row justify-between items-center',
            iosText ? 'h-[22px]' : 'h-[24px]',
          )}>
          {/* The name shrinks to fit; the id and time keep their size. */}
          <AnimatedNativeView
            style={tailwind.style(
              'flex flex-row flex-1 items-center gap-[5px] mr-2',
              iosText ? 'h-[22px]' : 'h-[24px]',
            )}>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style(
                'flex-shrink text-base font-inter-medium-24 tracking-[0.24px] text-gray-950 capitalize',
                // A notification feed: the event matters more than the name, so the name
                // uses Subhead like the notification text (iOS notification lists).
                iosText && IOS_LIST_TEXT.notificationTitle,
                iosText && (isRead ? IOS_LIST_TEXT.readTitle : IOS_LIST_TEXT.unreadTitle),
              )}>
              {sender?.name || ''}
            </Animated.Text>
            <NativeView style={tailwind.style('flex flex-row flex-shrink-0 items-center gap-0.5')}>
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-420-20 text-gray-700',
                  iosText && IOS_LIST_TEXT.footnote,
                )}>
                #
              </Animated.Text>
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-420-20 text-gray-700',
                  iosText && IOS_LIST_TEXT.footnote,
                )}>
                {conversationId}
              </Animated.Text>
            </NativeView>
          </AnimatedNativeView>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row flex-shrink-0 items-center gap-2')}>
            {priority ? <PriorityIndicator {...{ priority }} /> : null}
            {inbox && (
              <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />
            )}
            <NativeView>
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
                  iosText && IOS_LIST_TEXT.footnote,
                )}>
                {lastActivityAt()}
              </Animated.Text>
            </NativeView>
          </AnimatedNativeView>
        </AnimatedNativeView>

        <Animated.View
          style={tailwind.style('flex flex-row justify-between', iosText ? 'mt-1' : 'mt-1.5')}>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-1.5 flex-1')}>
            {hasAssignee && (
              <Avatar
                src={assignee?.thumbnail ? { uri: assignee.thumbnail } : undefined}
                size="md"
                name={assignee?.name || ''}
              />
            )}

            <Animated.Text
              style={tailwind.style(
                'font-inter-420-20 text-md text-gray-900 leading-[17px] tracking-[0.32px] flex-shrink',
                iosText && IOS_LIST_TEXT.body,
              )}
              numberOfLines={1}
              ellipsizeMode="tail">
              {pushMessageTitle}
            </Animated.Text>
          </Animated.View>
          <NotificationTypeIndicator type={notificationType} />
        </Animated.View>
      </Animated.View>
      {isRead && !iosText && (
        <Animated.View style={tailwind.style('absolute bg-white opacity-50 inset-0 z-20')} />
      )}
    </Animated.View>
  );
};

InboxItemComponent.displayName = 'InboxItem';
export const InboxItem = React.memo(InboxItemComponent);
