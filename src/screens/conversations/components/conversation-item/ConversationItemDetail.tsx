/* eslint-disable react/display-name */
import { isEqual } from 'lodash';
import React, { memo, useState } from 'react';
import { Dimensions, ImageURISource, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearTransition, runOnJS } from 'react-native-reanimated';

import { Avatar } from '@/components-next/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { Agent, Conversation, ConversationAdditionalAttributes, Label, Message } from '@/types';

import { ChannelIndicator, PriorityIndicator } from '@/components-next/list-components';
import { SLA } from '@/types/common/SLA';
import { Inbox } from '@/types/Inbox';
import { ConversationId } from './ConversationId';
import { ConversationLastMessage } from './ConversationLastMessage';
import { LabelIndicator } from './LabelIndicator';
import { LastActivityTime } from './LastActivityTime';
import { SLAIndicator } from './SLAIndicator';
import { TypingMessage } from './TypingMessage';
import { UnreadIndicator } from './UnreadIndicator';

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
  kanbanInfo?: {
    items: {
      funnelName: string;
      stageName: string;
      color: string;
    }[];
    hasMore: boolean;
  } | null;
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
    kanbanInfo,
  } = props;

  const [shouldShowSLA, setShouldShowSLA] = useState(true);
  const [showPipelinesModal, setShowPipelinesModal] = useState(false);

  const hasPriority = priority !== null;

  const hasLabels = labels.length > 0;
  
  const hasKanban = !!kanbanInfo;

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
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center h-[24px] gap-[5px]')}>
          <Text
            numberOfLines={1}
            style={tailwind.style(
              'text-base font-inter-medium-24 tracking-[0.24px] text-gray-950 capitalize',
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
          {inbox && <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />}
          <LastActivityTime timestamp={timestamp} />
        </AnimatedNativeView>
      </AnimatedNativeView>
      {hasLabels || hasSLA || hasKanban ? (
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
            style={tailwind.style('flex flex-row h-6 justify-between items-center gap-2')}>
            <AnimatedNativeView style={tailwind.style('flex flex-row flex-1 gap-2 items-center')}>
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
              {hasKanban && kanbanInfo && kanbanInfo.items.length > 0 && (
                <GestureDetector
                  gesture={Gesture.Tap().onEnd(() => {
                    if (kanbanInfo.items.length > 1) {
                      runOnJS(setShowPipelinesModal)(true);
                    }
                  })}>
                  <AnimatedNativeView
                    style={[
                      tailwind.style('flex flex-row items-center gap-1 mr-1'),
                      { zIndex: 10, elevation: 5 },
                    ]}>
                    {(hasLabels || hasSLA) && (
                      <NativeView style={tailwind.style('w-[1px] h-3 bg-slate-500 mx-1')} />
                    )}
                    <NativeView
                      style={[
                        tailwind.style('w-2 h-2 rounded-full'),
                        { backgroundColor: kanbanInfo.items[0].color || '#374151' },
                      ]}
                    />
                    <Text style={tailwind.style('text-[10px] font-inter-medium-24 text-gray-700')}>
                      {kanbanInfo.items[0].funnelName} • {kanbanInfo.items[0].stageName}
                      {kanbanInfo.hasMore ? '...' : ''}
                    </Text>
                  </AnimatedNativeView>
                </GestureDetector>
              )}
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
      <Modal
        visible={showPipelinesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPipelinesModal(false)}>
        <Pressable
          style={tailwind.style('flex-1 bg-black/50 justify-center items-center p-4')}
          onPress={() => setShowPipelinesModal(false)}>
          <Pressable
            style={tailwind.style('bg-white rounded-lg w-full max-w-sm p-4 shadow-lg')}
            onPress={e => e.stopPropagation()}>
            <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-900 mb-3')}>
              Pipelines Atribuídos
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {kanbanInfo?.items.map((item, index) => (
                <View
                  key={index}
                  style={tailwind.style(
                    'flex-row items-center py-2 border-b border-gray-100 last:border-0',
                  )}>
                  <View
                    style={[
                      tailwind.style('w-3 h-3 rounded-full mr-2'),
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={tailwind.style('text-sm text-gray-700 font-inter-medium-24')}>
                    {item.funnelName}
                  </Text>
                  <Text style={tailwind.style('text-xs text-gray-400 mx-1')}>•</Text>
                  <Text style={tailwind.style('text-sm text-gray-600')}>{item.stageName}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowPipelinesModal(false)}
              style={tailwind.style('mt-4 bg-gray-100 p-2 rounded-lg items-center')}>
              <Text style={tailwind.style('text-gray-900 font-inter-medium-24')}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
