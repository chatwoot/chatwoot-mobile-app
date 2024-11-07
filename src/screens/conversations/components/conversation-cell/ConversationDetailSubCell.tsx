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
} from '@/components-next/label';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { Agent, Conversation } from '../../../../types';
// import { formatRelativeTime } from '@/utils';

const { width } = Dimensions.get('screen');

type ConversationDetailSubCellProps = Pick<
  Conversation,
  'id' | 'priority' | 'messages' | 'labels' | 'unreadCount'
> & {
  senderName: string | null;
  assignee: Agent;
};

const checkIfPropsAreSame = (prev: any, next: any) => {
  const arePropsEqual = isEqual(prev, next);
  return arePropsEqual;
};

export const ConversationDetailSubCell = memo((props: ConversationDetailSubCellProps) => {
  const {
    id: conversationId,
    priority,
    messages: [{ updatedAt, content }],
    unreadCount,
    labels,
    assignee,
    senderName,
  } = props;

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
            {senderName}
          </Text>
          <ConversationId id={conversationId} />
        </AnimatedNativeView>
        <AnimatedNativeView style={tailwind.style('flex flex-row items-center')}>
          {priority ? <PriorityIndicator {...{ priority }} /> : null}
          <NativeView style={tailwind.style('pl-1')}>
            <Text
              style={tailwind.style(
                'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
              )}>
              {/* {formatRelativeTime(updatedAt)} */}2 hours
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
            'text-md flex-1 font-inter-normal-24 tracking-[0.32px] leading-[21px] text-gray-900',
          )}>
          {/* {messageType === "reply"
              ? "↩ "
              : messageType === "note"
              ? "⬒ "
              : ""} */}
          {content}
        </Text>
      </AnimatedNativeView>
      {labels.length > 0 ? (
        <AnimatedNativeView style={tailwind.style('mt-[3px] flex flex-row justify-between')}>
          <AnimatedNativeView style={tailwind.style('flex flex-row items-center')}>
            {labels.slice(0, 2).map((label, i) => {
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
        {unreadCount >= 1 ? <UnreadIndicator count={unreadCount} /> : null}
      </AnimatedNativeView>
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
