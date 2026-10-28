import { useTailwind } from '@/theme/useTailwind';
/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { ImageURISource } from 'react-native';

import { NativeView } from '@/components-next/native-components';
import {
  Agent,
  AvailabilityStatus,
  ConversationAdditionalAttributes,
  ConversationPriority,
  Label,
  Message,
} from '@/types';
import { Inbox } from '@/types/Inbox';

import { ConversationAvatar } from './ConversationAvatar';
import { ConversationItemDetail } from './ConversationItemDetail';
import { ConversationSelect } from './ConversationSelect';
import { SLA } from '@/types/common/SLA';
import { useIOSListText } from '@/utils';

export type ConversationItemProps = {
  // Basic info
  id: number;
  senderName: string | null;
  senderThumbnail: string | null;
  isSelected: boolean;
  unreadCount: number;
  isTyping: boolean;
  availabilityStatus: AvailabilityStatus;

  priority?: ConversationPriority | null;
  labels: string[];
  timestamp: number;
  inbox: Inbox | null;
  lastMessage?: Message | null;
  inboxId: number;
  assignee: Agent | null;

  // SLA related
  slaPolicyId?: number | null;
  appliedSla?: SLA | null;
  appliedSlaConversationDetails?:
    | {
        firstReplyCreatedAt: number;
        waitingSince: number;
        status: string;
      }
    | Record<string, never>;

  // Additional data
  additionalAttributes?: ConversationAdditionalAttributes;

  // Conversation header state
  currentState: string;

  allLabels: Label[];

  typingText?: string;
};

export const ConversationItem = memo(
  ({
    id,
    senderName,
    senderThumbnail,
    isSelected,
    currentState,
    unreadCount,
    isTyping,
    availabilityStatus,
    priority = null,
    labels,
    timestamp,
    inbox,
    lastMessage,
    inboxId,
    assignee,
    slaPolicyId = null,
    appliedSla = null,
    appliedSlaConversationDetails = {},
    additionalAttributes,
    allLabels,
    typingText,
  }: ConversationItemProps) => {
    const tailwind = useTailwind();
    const iosList = useIOSListText();
    return (
      <NativeView
        // iOS list layout: 16pt left margin; on the right the row (and its divider) ends where
        // the selection highlight ends (6pt), and the details add 10pt so content keeps 16pt.
        style={tailwind.style('gap-3 flex-row justify-between', iosList ? 'pl-4 pr-1.5' : 'px-3')}>
        {/* Avatar top-aligns with the name (rows vary in height), like Mail. */}
        <NativeView style={tailwind.style('py-3 flex flex-row')}>
          <ConversationSelect {...{ isSelected, currentState }} />
          <ConversationAvatar
            src={{ uri: senderThumbnail } as ImageURISource}
            name={senderName || ''}
            status={isTyping ? 'typing' : availabilityStatus || 'offline'}
          />
        </NativeView>

        <ConversationItemDetail
          {...{
            id,
            priority: priority,
            unreadCount,
            labels,
            assignee,
            senderName,
            timestamp,
            inbox,
            lastMessage,
            inboxId,
            appliedSla,
            appliedSlaConversationDetails,
            additionalAttributes,
            slaPolicyId,
            currentState,
            allLabels,
            typingText,
          }}
        />
      </NativeView>
    );
  },
);
