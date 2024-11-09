/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { Dimensions, ImageURISource, Text } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar } from '@/components-next/common';
import {
  ConversationId,
  LabelText,
  PriorityIndicator,
  UnreadIndicator,
  ChannelIndicator,
  SLAIndicator,
} from '@/components-next/label';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { Agent, Conversation } from '@/types';
import { formatTimeToShortForm, formatRelativeTime } from '@/utils/dateTimeUtils';
import { getLastMessage } from '@/utils/conversationUtils';

const { width } = Dimensions.get('screen');

type ConversationDetailSubCellProps = Pick<
  Conversation,
  'id' | 'priority' | 'messages' | 'labels' | 'unreadCount'
> & {
  senderName: string | null;
  assignee: Agent;
  timestamp: number;
};

const checkIfPropsAreSame = (prev: any, next: any) => {
  const arePropsEqual = isEqual(prev, next);
  return arePropsEqual;
};

export const ConversationItemDetail = memo((props: ConversationDetailSubCellProps) => {
  const {
    id: conversationId,
    priority,
    // unreadCount = 2,
    labels,
    assignee,
    senderName,
    timestamp,
  } = props;
  const unreadCount = 12;

  const lastActivityAtTimeAgo = formatTimeToShortForm(formatRelativeTime(timestamp));

  // const lastMessage = getLastMessage(props);

  // const hasPriority = priority !== null;

  // const content = lastMessage?.content || '';

  // const { createdAt, attachments, messageType, private: isPrivate } = lastMessage;

  // const isEmailChannel = channelType === 'Channel::Email';

  // const lastMessageContent = isEmailChannel
  //   ? lastMessage?.content_attributes?.email?.subject
  //   : lastMessage?.content;

  return (
    <AnimatedNativeView
      layout={LinearTransition.springify().damping(28).stiffness(200)}
      style={tailwind.style(
        'relative flex-1  ml-3 pr-4 border-b-[1px] border-b-blackA-A3 pt-3 pb-3 h-[91px]',
      )}>
      <AnimatedNativeView style={tailwind.style('flex flex-row justify-between items-center')}>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center')}>
          <Text
            numberOfLines={1}
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
              // Calculated based on the widths of other content,
              // We might have to do a 10-20px offset based on the max width of the timestamp
              `max-w-[${width - 250}px]`,
            )}>
            {/* {senderName} */}
            Floyd Alexander Miles Miles
          </Text>
          <ConversationId id={conversationId} />
        </AnimatedNativeView>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-1')}>
          {priority ? <PriorityIndicator {...{ priority }} /> : null}
          {<ChannelIndicator channel="facebook" />}
          <NativeView>
            <Text
              style={tailwind.style(
                'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
              )}>
              {lastActivityAtTimeAgo}
            </Text>
          </NativeView>
        </AnimatedNativeView>
      </AnimatedNativeView>
      <AnimatedNativeView
        style={tailwind.style(
          'mt-[5px] flex flex-row items-center',
          unreadCount >= 1 ? 'pr-13' : ' pr-11',
        )}>
        <Text
          numberOfLines={labels.length > 0 ? 1 : 2}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
          )}>
          {/* {messageType === 'reply' ? '↩ ' : messageType === 'note' ? '⬒ ' : ''} */}
          {/* {content} */}
          Hi there, I accidentally purchased the wrong item. Can I cancel the order and get a
          refund?
        </Text>
      </AnimatedNativeView>
      <AnimatedNativeView style={tailwind.style('flex flex-row')}>
        {<SLAIndicator />}
      </AnimatedNativeView>
      {labels.length > 0 ? (
        <AnimatedNativeView style={tailwind.style('mt-[3px] flex flex-row justify-between')}>
          <AnimatedNativeView style={tailwind.style('flex flex-row items-center')}>
            {labels.map((label, i) => {
              return (
                <NativeView key={i} style={tailwind.style(i !== 0 ? 'pl-1.5' : '')}>
                  <LabelText
                    // labelColor={label.labelColor}
                    labelText={label}
                  />
                </NativeView>
              );
            })}
          </AnimatedNativeView>
        </AnimatedNativeView>
      ) : null}
      <AnimatedNativeView style={tailwind.style('absolute bottom-[14px] right-4 flex flex-row')}>
        {assignee ? (
          <NativeView style={tailwind.style(unreadCount >= 1 ? 'pr-1' : '')}>
            <Avatar
              size="sm"
              name={assignee.name as string}
              src={{ uri: assignee.thumbnail } as ImageURISource}
            />
          </NativeView>
        ) : null}
        {/* {unreadCount >= 1 ? <UnreadIndicator count={unreadCount} /> : null} */}
        {<UnreadIndicator count={unreadCount} />}
      </AnimatedNativeView>
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
