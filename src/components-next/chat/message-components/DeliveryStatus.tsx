import React from 'react';
import { tailwind } from '@/theme';
import { DoubleCheckIcon } from '@/svg-icons';
import { Icon } from '@/components-next/common';
import { MessageStatus, MessageType } from '@/types';
import { Channel } from '@/types';
import { INBOX_TYPES, MESSAGE_TYPES, MESSAGE_STATUS } from '@/constants';

type DeliveryStatusProps = {
  channel?: Channel;
  isPrivate: boolean;
  sourceId?: string | null;
  status: MessageStatus;
  messageType: MessageType;
  deliveredColor?: string;
  readColor?: string;
  sentColor?: string;
};

export const DeliveryStatus = (props: DeliveryStatusProps) => {
  const { channel, isPrivate, status, messageType, sourceId, deliveredColor, sentColor } = props;

  const isDelivered = status === MESSAGE_STATUS.DELIVERED;
  const isRead = status === MESSAGE_STATUS.READ;
  const isSent = status === MESSAGE_STATUS.SENT;
  const isEmailChannel = channel === INBOX_TYPES.EMAIL;
  const isAWhatsappChannel = channel === INBOX_TYPES.TWILIO || channel === INBOX_TYPES.WHATSAPP;
  const isATelegramChannel = channel === INBOX_TYPES.TELEGRAM;
  const isATwilioChannel = channel === INBOX_TYPES.TWILIO;
  const isAFacebookChannel = channel === INBOX_TYPES.FB;
  const isAWebWidgetChannel = channel === INBOX_TYPES.WEB;
  const isTemplate = messageType === MESSAGE_TYPES.TEMPLATE;
  const isASmsInbox = channel === INBOX_TYPES.SMS;
  const isAPIChannel = channel === INBOX_TYPES.API;
  const shouldShowStatusIndicator =
    (messageType === MESSAGE_TYPES.OUTGOING || isTemplate) && !isPrivate;
  const isALineChannel = channel === INBOX_TYPES.LINE;

  const showSentIndicator = () => {
    if (!shouldShowStatusIndicator) {
      return false;
    }

    if (isEmailChannel) {
      return !!sourceId;
    }

    if (
      isAWhatsappChannel ||
      isATwilioChannel ||
      isAFacebookChannel ||
      isATelegramChannel ||
      isASmsInbox
    ) {
      return sourceId && isSent;
    }
    // There is no source id for the line channel
    if (isALineChannel) {
      return true;
    }

    return false;
  };

  const showDeliveredIndicator = () => {
    if (!shouldShowStatusIndicator) {
      return false;
    }
    if (isAWhatsappChannel || isATwilioChannel || isAFacebookChannel || isASmsInbox) {
      return sourceId && isDelivered;
    }

    // We will consider messages as delivered for web widget inbox and API inbox if they are sent
    if (isAWebWidgetChannel || isAPIChannel) {
      return isSent;
    }

    if (isALineChannel) {
      return isDelivered;
    }

    return false;
  };

  const showReadIndicator = () => {
    if (!shouldShowStatusIndicator) {
      return false;
    }
    if (isAWebWidgetChannel || isAPIChannel) {
      return isRead;
    }

    if (isAWhatsappChannel || isATwilioChannel || isAFacebookChannel) {
      return sourceId && isRead;
    }

    return false;
  };

  if (showReadIndicator()) {
    return (
      <Icon
        icon={<DoubleCheckIcon renderSecondTick stroke={tailwind.color('text-blue-800')} />}
        size={14}
      />
    );
  }

  if (showDeliveredIndicator()) {
    return (
      <Icon
        icon={
          <DoubleCheckIcon
            renderSecondTick={true}
            stroke={tailwind.color(deliveredColor || 'text-whiteA-A12')}
          />
        }
        size={14}
      />
    );
  }

  if (showSentIndicator()) {
    return (
      <Icon
        icon={<DoubleCheckIcon stroke={tailwind.color(sentColor || 'text-whiteA-A12')} />}
        size={14}
      />
    );
  }

  return null;
};
