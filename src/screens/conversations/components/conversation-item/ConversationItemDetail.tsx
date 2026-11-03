/* eslint-disable react/display-name */
import React, { memo, useState } from 'react';
import { ImageURISource, Text } from 'react-native';
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
import { IOS_LIST_TEXT, useIOSListText } from '@/utils';
import { useIsRowSelected } from '@/navigation/split/SelectedRowBackground';

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
  const iosText = useIOSListText();
  const isRowSelected = useIsRowSelected();
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

  // A conversation can carry a policy id without the applied SLA record being
  // serialised, so the record itself gates the indicator.
  const hasSLA = !!slaPolicyId && !!appliedSla && shouldShowSLA;

  if (!lastMessage) {
    return null;
  }

  return (
    <AnimatedNativeView
      layout={LinearTransition.springify().mass(1).damping(21).stiffness(115)}
      // iOS list layout: every line box matches its line height (name 22, preview 20,
      // labels/SLA 20) with the same 4pt gap between lines, and 12pt row padding.
      style={tailwind.style(
        'flex-1 border-b-[1px]',
        isRowSelected ? 'border-b-transparent' : 'border-b-blackA-A3',
        'gap-1 py-3',
        iosText ? 'pr-2.5' : '',
      )}>
      <AnimatedNativeView
        style={tailwind.style(
          'flex flex-row justify-between items-center',
          iosText ? 'h-[22px]' : 'h-[24px]',
        )}>
        {/* The name shrinks to fit; the id, indicators and time keep their size. */}
        <AnimatedNativeView
          style={tailwind.style(
            'flex flex-row flex-1 items-center gap-[5px] mr-2',
            iosText ? 'h-[22px]' : 'h-[24px]',
          )}>
          <Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-shrink text-base font-inter-medium-24 tracking-[0.24px] text-gray-950 capitalize',
              iosText && IOS_LIST_TEXT.title,
              iosText && (unreadCount > 0 ? IOS_LIST_TEXT.unreadTitle : IOS_LIST_TEXT.readTitle),
            )}>
            {senderName}
          </Text>
          <NativeView style={tailwind.style('flex-shrink-0')}>
            <ConversationId id={conversationId} />
          </NativeView>
        </AnimatedNativeView>
        <AnimatedNativeView
          style={tailwind.style('flex flex-row flex-shrink-0 items-center gap-2')}>
          {hasPriority ? <PriorityIndicator {...{ priority }} /> : null}
          {inbox && <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />}
          <LastActivityTime timestamp={timestamp} />
        </AnimatedNativeView>
      </AnimatedNativeView>
      {hasLabels || hasSLA ? (
        <AnimatedNativeView style={tailwind.style('flex flex-col items-center gap-1')}>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row w-full justify-between items-center gap-2')}>
            {typingText ? (
              <TypingMessage typingText={typingText} />
            ) : (
              <ConversationLastMessage numberOfLines={1} lastMessage={lastMessage as Message} />
            )}

            {unreadCount >= 1 && (
              <NativeView style={tailwind.style('flex-shrink-0')}>
                <UnreadIndicator count={unreadCount} />
              </NativeView>
            )}
          </AnimatedNativeView>
          <AnimatedNativeView
            style={tailwind.style(
              'flex flex-row justify-between items-center gap-2',
              iosText ? 'h-5' : 'h-6',
            )}>
            <AnimatedNativeView style={tailwind.style('flex flex-row flex-1 gap-2 items-center')}>
              {hasSLA && appliedSla && (
                <SLAIndicator
                  conversationId={conversationId}
                  slaPolicyId={slaPolicyId}
                  appliedSla={appliedSla}
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
          {typingText ? (
            <TypingMessage typingText={typingText} />
          ) : (
            <ConversationLastMessage numberOfLines={2} lastMessage={lastMessage as Message} />
          )}

          <AnimatedNativeView style={tailwind.style('flex flex-row items-end gap-1')}>
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
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
