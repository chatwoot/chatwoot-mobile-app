/* eslint-disable react/display-name */
import React, { memo, useState } from 'react';
import { Dimensions, ImageURISource, Text } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar } from '@/components-next/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { Agent, Conversation, ConversationAdditionalAttributes, Label, Message } from '@/types';

import { ConversationId } from './ConversationId';
import { ConversationLastMessage } from './ConversationLastMessage';
import { PriorityIndicator, ChannelIndicator } from '@/components-next/list-components';
import { UnreadIndicator } from './UnreadIndicator';
import { SLAIndicator } from './SLAIndicator';
import { LabelIndicator } from './LabelIndicator';
import { LastActivityTime } from './LastActivityTime';
import { SLA } from '@/types/common/SLA';
import { Inbox } from '@/types/Inbox';
import { TypingMessage } from './TypingMessage';

const { width } = Dimensions.get('screen');

type ConversationDetailSubCellProps = Pick<
  Conversation,
  'id' | 'priority' | 'labels' | 'unreadCount' | 'inboxId' | 'slaPolicyId'
> & {
  senderName: string | null;
  assignee: Agent | null;
  timestamp: number;
  lastMessage?: Message | null;
  inbox: Inbox | null;
  appliedSla: SLA | null;
  appliedSlaConversationDetails?:
    | {
        firstReplyCreatedAt: number;
        waitingSince: number;
        status: string;
      }
    | Record<string, never>;
  additionalAttributes?: ConversationAdditionalAttributes;
  allLabels: Label[];
  typingText?: string;
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
    allLabels,
    typingText,
  } = props;

  const [shouldShowSLA, setShouldShowSLA] = useState(true);

  const hasPriority = priority !== null;

  const hasLabels = labels.length > 0;

  const hasSLA = !!slaPolicyId && shouldShowSLA;

  if (!lastMessage) {
    return null;
  }

  return (
    <AnimatedNativeView
      layout={LinearTransition.springify().damping(28).stiffness(200)}
      style={tailwind.style('flex-1 gap-1 py-3 border-b-[1px] border-b-blackA-A3')}>
      <AnimatedNativeView
        style={tailwind.style('flex flex-row justify-between items-center h-[24px]')}>
        <AnimatedNativeView
          style={tailwind.style('flex flex-row items-center h-[24px] gap-[5px] flex-1')}>
          <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-[5px]')}>
            <Text
              numberOfLines={1}
              style={tailwind.style(
                'text-base font-inter-medium-24 tracking-[0.24px] text-gray-950 capitalize flex-shrink',
                // Calculated based on the widths of other content,
                // We might have to do a 10-20px offset based on the max width of the timestamp
                `max-w-[${width - 250}px]`,
              )}>
              {senderName}
            </Text>
            <ConversationId id={conversationId} />
          </AnimatedNativeView>
          <AnimatedNativeView
            style={tailwind.style('flex-1 flex flex-row items-center justify-end gap-[5px]')}>
            {hasPriority && !hasLabels && !hasSLA && <PriorityIndicator {...{ priority }} />}
            {inbox && (
              <ChannelIndicator
                inbox={inbox}
                additionalAttributes={additionalAttributes}
                style={tailwind.style('min-w-0')}
              />
            )}
            {inbox && <NativeView style={tailwind.style('w-[1px] h-3 bg-slate-500')} />}
            <LastActivityTime timestamp={timestamp} />
          </AnimatedNativeView>
        </AnimatedNativeView>
      </AnimatedNativeView>
      {hasLabels || hasSLA ? (
        <AnimatedNativeView style={tailwind.style('flex flex-col items-center gap-1')}>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row h-5 w-full justify-between items-center gap-2')}>
            {typingText ? (
              <TypingMessage typingText={typingText} />
            ) : (
              <ConversationLastMessage numberOfLines={1} lastMessage={lastMessage as Message} />
            )}

            {unreadCount >= 1 && <UnreadIndicator count={unreadCount} />}
          </AnimatedNativeView>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row h-6 justify-between items-center gap-2')}>
            <AnimatedNativeView style={tailwind.style('flex flex-row flex-1 gap-2.5 items-center')}>
              {hasPriority ? <PriorityIndicator {...{ priority }} /> : null}
              {hasPriority && <NativeView style={tailwind.style('w-[1px] h-3 bg-slate-500')} />}
              {hasSLA && (
                <SLAIndicator
                  slaPolicyId={slaPolicyId}
                  appliedSla={appliedSla as SLA}
                  appliedSlaConversationDetails={
                    appliedSlaConversationDetails as {
                      firstReplyCreatedAt: number;
                      waitingSince: number;
                      status: string;
                    }
                  }
                  onSLAStatusChange={setShouldShowSLA}
                />
              )}
              {hasLabels && hasSLA && (
                <NativeView style={tailwind.style('w-[1px] h-3 bg-slate-500')} />
              )}
              {hasLabels && <LabelIndicator labels={labels} allLabels={allLabels} />}
            </AnimatedNativeView>
            {assignee ? (
              <AnimatedNativeView style={tailwind.style('justify-end')}>
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
          {typingText ? (
            <TypingMessage typingText={typingText} />
          ) : (
            <ConversationLastMessage numberOfLines={2} lastMessage={lastMessage as Message} />
          )}

          <AnimatedNativeView style={tailwind.style('flex flex-row items-end gap-1')}>
            {unreadCount >= 1 && <UnreadIndicator count={unreadCount} />}
            {assignee ? (
              <NativeView style={tailwind.style(unreadCount >= 1 ? 'pr-1' : '')}>
                <Avatar
                  size="sm"
                  name={assignee.name as string}
                  src={{ uri: assignee.thumbnail } as ImageURISource}
                />
              </NativeView>
            ) : null}
          </AnimatedNativeView>
        </AnimatedNativeView>
      )}
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
