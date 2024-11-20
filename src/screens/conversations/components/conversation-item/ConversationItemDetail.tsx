/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { Dimensions, ImageURISource, Text } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar } from '@/components-next/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { Agent, Conversation, ConversationAdditionalAttributes, Message } from '@/types';
import { formatTimeToShortForm, formatRelativeTime } from '@/utils/dateTimeUtils';

import { ConversationId } from './ConversationId';
import { ConversationLastMessage } from './ConversationLastMessage';
import { PriorityIndicator } from './PriorityIndicator';
import { UnreadIndicator } from './UnreadIndicator';
import { ChannelIndicator } from './ChannelIndicator';
import { SLAIndicator } from './SLAIndicator';
import { LabelIndicator } from './LabelIndicator';
import { SLA } from '@/types/common/SLA';
import { Inbox } from '@/types/Inbox';

const { width } = Dimensions.get('screen');

type ConversationDetailSubCellProps = Pick<
  Conversation,
  'id' | 'priority' | 'messages' | 'labels' | 'unreadCount' | 'inboxId' | 'slaPolicyId'
> & {
  senderName: string | null;
  assignee: Agent;
  timestamp: number;
  lastMessage?: Message | null;
  inbox: Inbox;
  appliedSla: SLA | null;
  appliedSlaConversationDetails: {
    firstReplyCreatedAt: number;
    waitingSince: number;
    status: string;
  };
  additionalAttributes: ConversationAdditionalAttributes;
};

const checkIfPropsAreSame = (
  prev: ConversationDetailSubCellProps,
  next: ConversationDetailSubCellProps,
) => {
  const arePropsEqual = isEqual(prev, next);
  return arePropsEqual;
};

export const ConversationItemDetail = memo((props: ConversationDetailSubCellProps) => {
  const {
    id: conversationId,
    priority,
    unreadCount,
    labels,
    assignee,
    senderName,
    timestamp,
    slaPolicyId,
    lastMessage,
    inbox,
    appliedSla,
    appliedSlaConversationDetails,
    additionalAttributes,
  } = props;

  const lastActivityAtTimeAgo = formatTimeToShortForm(formatRelativeTime(timestamp));

  const hasPriority = priority !== null;

  const hasLabels = labels.length > 0;

  const hasSLA = !!slaPolicyId;

  if (!lastMessage) {
    return null;
  }

  return (
    <AnimatedNativeView
      layout={LinearTransition.springify().damping(28).stiffness(200)}
      style={tailwind.style('flex-1 gap-1 py-3 border-b-[1px] border-b-blackA-A3')}>
      <AnimatedNativeView
        style={tailwind.style('flex flex-row justify-between items-center h-[24px]')}>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-[5px]')}>
          <Text
            numberOfLines={1}
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950 capitalize',
              // Calculated based on the widths of other content,
              // We might have to do a 10-20px offset based on the max width of the timestamp
              `max-w-[${width - 250}px]`,
            )}>
            {senderName}
          </Text>
          <ConversationId id={conversationId} />
        </AnimatedNativeView>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-2')}>
          {hasPriority ? <PriorityIndicator {...{ priority }} /> : null}
          {<ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />}
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
      {hasLabels || hasSLA ? (
        <AnimatedNativeView style={tailwind.style('flex flex-col items-center gap-1')}>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row w-full justify-between items-center gap-2')}>
            <ConversationLastMessage numberOfLines={1} lastMessage={lastMessage as Message} />
            {unreadCount >= 1 && (
              <NativeView style={tailwind.style('flex-shrink-0')}>
                <UnreadIndicator count={unreadCount} />
              </NativeView>
            )}
          </AnimatedNativeView>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row h-6 justify-between items-center gap-2')}>
            <AnimatedNativeView style={tailwind.style('flex flex-row flex-1 gap-2 items-center')}>
              {hasSLA && (
                <SLAIndicator
                  slaPolicyId={slaPolicyId}
                  appliedSla={appliedSla as SLA}
                  appliedSlaConversationDetails={appliedSlaConversationDetails}
                />
              )}
              {hasLabels && hasSLA && (
                <NativeView style={tailwind.style('w-[1px] h-3 bg-slate-500')} />
              )}
              {hasLabels && <LabelIndicator labels={labels.slice(0, 2)} />}
            </AnimatedNativeView>

            {assignee ? (
              <AnimatedNativeView>
                <Avatar
                  size="sm"
                  name={assignee.name as string}
                  src={{ uri: assignee.thumbnail } as ImageURISource}
                />
              </AnimatedNativeView>
            ) : null}
          </AnimatedNativeView>
        </AnimatedNativeView>
      ) : (
        <AnimatedNativeView style={tailwind.style('flex flex-row items-end gap-2')}>
          <ConversationLastMessage numberOfLines={2} lastMessage={lastMessage as Message} />
          <AnimatedNativeView style={tailwind.style('flex flex-row items-end gap-2')}>
            {assignee ? (
              <NativeView style={tailwind.style(unreadCount >= 1 ? 'pr-1' : '')}>
                <Avatar
                  size="sm"
                  name={assignee.name as string}
                  src={{ uri: assignee.thumbnail } as ImageURISource}
                />
              </NativeView>
            ) : null}

            {unreadCount >= 1 && <UnreadIndicator count={unreadCount} />}
          </AnimatedNativeView>
        </AnimatedNativeView>
      )}
      {/* <NativeView style={tailwind.style('w-full h-[1px] bg-blackA-A3 flex items-end')} /> */}
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
