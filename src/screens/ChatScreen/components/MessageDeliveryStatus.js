import React from 'react';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';
import { View } from 'react-native';

import { INBOX_TYPES, MESSAGE_TYPES, MESSAGE_STATUS } from 'constants';

const styles = theme => ({
  container: {
    paddingTop: 2,
    paddingRight: 2,
  },
  icon: {
    width: 16,
    height: 16,
  },
});

const propTypes = {
  type: PropTypes.string.isRequired,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  message: PropTypes.shape({
    template: PropTypes.number,
    private: PropTypes.bool,
    source_id: PropTypes.string,
    created_at: PropTypes.number,
    status: PropTypes.string,
  }),
  channel: PropTypes.string.isRequired,
  contactLastSeenAt: PropTypes.number,
};

const ReadIcon = style => {
  return <Icon {...style} name="done-all-outline" />;
};

const SendIcon = style => {
  return <Icon {...style} name="checkmark-outline" />;
};

const DeliveredIcon = style => {
  return <Icon {...style} name="done-all-outline" />;
};

const MessageDeliveryStatus = ({
  message,
  type,
  channel,
  contactLastSeenAt,
  eva: { theme, style },
}) => {
  const isDelivered = message?.status === MESSAGE_STATUS.DELIVERED;
  const isRead = message?.status === MESSAGE_STATUS.READ;
  const isSent = message?.status === MESSAGE_STATUS.SENT;
  const isEmailChannel = channel === INBOX_TYPES.EMAIL;
  const isAWhatsappChannel = channel === INBOX_TYPES.TWILIO || channel === INBOX_TYPES.WHATSAPP;
  const isAWebWidgetInbox = channel === INBOX_TYPES.WEB;
  const isTemplate = message.template === MESSAGE_TYPES.TEMPLATE;
  const shouldShowStatusIndicator = (type === 'outgoing' || isTemplate) && !message.private;

  const showDeliveredIndicator = () => {
    if (!shouldShowStatusIndicator) {
      return false;
    }
    if (isAWhatsappChannel) {
      return message.source_id && isDelivered;
    }

    return false;
  };

  const showReadIndicator = () => {
    if (!shouldShowStatusIndicator) {
      return false;
    }

    if (isAWebWidgetInbox) {
      return contactLastSeenAt >= message.created_at;
    }

    if (isAWhatsappChannel) {
      return message.source_id && isRead;
    }

    return false;
  };

  const showSentIndicator = () => {
    if (!shouldShowStatusIndicator) {
      return false;
    }

    if (isEmailChannel) {
      return !!message.source_id;
    }

    if (isAWhatsappChannel) {
      return message.source_id && isSent;
    }
    return false;
  };

  if (showReadIndicator()) {
    return (
      <View style={style.container}>
        <DeliveredIcon style={style.icon} fill={'#9DE29A'} />
      </View>
    );
  }

  if (showDeliveredIndicator()) {
    return (
      <View style={style.container}>
        <ReadIcon style={style.icon} fill={theme['color-white']} />
      </View>
    );
  }
  if (showSentIndicator()) {
    return (
      <View style={style.container}>
        <SendIcon style={style.icon} fill={theme['color-white']} />
      </View>
    );
  }

  return null;
};

MessageDeliveryStatus.propTypes = propTypes;

export default withStyles(MessageDeliveryStatus, styles);
