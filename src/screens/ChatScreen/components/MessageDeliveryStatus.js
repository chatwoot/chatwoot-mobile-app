import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'components';

import { INBOX_TYPES, MESSAGE_TYPES, MESSAGE_STATUS } from 'constants';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    container: {
      paddingTop: spacing.tiny,
      paddingLeft: spacing.tiny,
    },
  });
};

const propTypes = {
  type: PropTypes.string.isRequired,
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

const MessageDeliveryStatus = ({ message, type, channel, contactLastSeenAt }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

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
      <View style={styles.container}>
        <Icon icon="checkmark-double-outline" color={'#9DE29A'} size={16} />
      </View>
    );
  }

  if (showDeliveredIndicator()) {
    return (
      <View style={styles.container}>
        <Icon icon="checkmark-double-outline" color={colors.colorWhite} size={16} />
      </View>
    );
  }
  if (showSentIndicator()) {
    return (
      <View style={styles.container}>
        <Icon icon="checkmark-outline" color={colors.colorWhite} size={16} />
      </View>
    );
  }

  return null;
};

MessageDeliveryStatus.propTypes = propTypes;
export default MessageDeliveryStatus;
