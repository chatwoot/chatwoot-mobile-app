/* eslint-disable react/display-name */
import React, { memo, useState, useCallback } from 'react';
import { Dimensions, ImageURISource, Text, TouchableWithoutFeedback, View } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar } from '@/components-next/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { AIStatusIcon } from '@/components-next';
import { tailwind } from '@/theme';
import { Agent, Conversation, ConversationAdditionalAttributes, Label, Message } from '@/types';
import { useAppDispatch, useThemedStyles } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';

import { ConversationId } from './ConversationId';
import { ConversationLastMessage } from './ConversationLastMessage';
import { PriorityIndicator, ChannelIndicator } from '@/components-next/list-components';
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
<<<<<<< HEAD
    | object;
=======
    | Record<string, never>;
>>>>>>> upstream/develop
  additionalAttributes?: ConversationAdditionalAttributes;
  allLabels: Label[];
  typingText?: string;
  isAIEnabled?: boolean;
  contactId?: number;
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
    isAIEnabled,
    contactId,
  } = props;

  const [shouldShowSLA, setShouldShowSLA] = useState(true);
  const [isTogglingAI, setIsTogglingAI] = useState(false);

  const dispatch = useAppDispatch();
  const themedTailwind = useThemedStyles();

  const hasPriority = priority !== null;

  const hasLabels = labels.length > 0;

  const hasSLA = !!slaPolicyId && shouldShowSLA;

  const handleAIToggle = useCallback(async () => {
    if (!contactId || isTogglingAI) return;
    
    setIsTogglingAI(true);
    try {
      const result = await dispatch(contactActions.toggleAI({
        contactId,
        aiEnabled: !isAIEnabled,
      }));
      
      if (contactActions.toggleAI.fulfilled.match(result)) {
        showToast({
          message: I18n.t(
            isAIEnabled ? 'SUCCESS.AI_DISABLED_SUCCESS' : 'SUCCESS.AI_ENABLED_SUCCESS',
          ),
        });
      } else {
        throw new Error('Toggle AI failed');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToast({
        message: I18n.t('ERRORS.AI_TOGGLE_ERROR'),
      });
    } finally {
      setIsTogglingAI(false);
    }
  }, [contactId, isAIEnabled, isTogglingAI, dispatch]);

  if (!lastMessage) {
    return null;
  }

  return (
    <AnimatedNativeView
      layout={LinearTransition.springify().damping(28).stiffness(200)}
      style={themedTailwind.style('flex-1 gap-0.5 py-2 border-b-[1px] border-b-gray-200')}>
      <AnimatedNativeView
        style={tailwind.style('flex flex-row justify-between items-end h-[28px]')}>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-end h-[28px] gap-[5px]')}>
          <Text
            numberOfLines={1}
            style={themedTailwind.style(
              'text-lg font-inter-medium-24 tracking-[0.28px] text-gray-950 capitalize',
              // Calculated based on the widths of other content,
              // We might have to do a 10-20px offset based on the max width of the timestamp
              `max-w-[${width - 250}px]`,
            )}>
            {senderName}
          </Text>
          {/* <ConversationId id={conversationId} /> */}
          {assignee ? (
            <Avatar
              size="sm"
              name={assignee.name as string}
              src={{ uri: assignee.thumbnail } as ImageURISource}
            />
          ) : null}
        </AnimatedNativeView>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-2')}>
          {hasPriority ? <PriorityIndicator {...{ priority }} /> : null}
          {inbox && <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />}
          {/* AI button moved to next to conversation text */}
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
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-2')}>
          {typingText ? (
            <TypingMessage typingText={typingText} />
          ) : (
            <ConversationLastMessage numberOfLines={1} lastMessage={lastMessage as Message} />
          )}

          <View style={{ position: 'relative' }}>
            <TouchableWithoutFeedback onPress={handleAIToggle}>
              <View style={{ 
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 999, 
                elevation: 999,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                paddingRight: 0,
                backgroundColor: 'transparent',
              }}>
                <AIStatusIcon isEnabled={isAIEnabled ?? false} size={32} />
              </View>
            </TouchableWithoutFeedback>
            {/* Invisible spacer to maintain layout */}
            <View style={{ width: 40, height: 40 }} />
          </View>
        </AnimatedNativeView>
      )}
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
