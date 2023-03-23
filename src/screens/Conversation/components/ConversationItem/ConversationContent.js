import React, { Fragment, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Icon, Text } from 'components';
import { MESSAGE_TYPES } from 'constants';

import { getTextSubstringWithEllipsis } from 'helpers';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    itemView: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.tiny,
    },
    icon: {
      marginRight: spacing.micro,
    },
  });
};

const propTypes = {
  content: PropTypes.string,
  messageType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isPrivate: PropTypes.bool,
  unReadCount: PropTypes.number,
};

const ConversationContent = ({ content, messageType, isPrivate, unReadCount }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const message = content
    ? content.replace(/\[(@[\w_. ]+)\]\(mention:\/\/(?:user|team)\/\d+\/(.*?)+\)/gi, '$1').trim()
    : '';
  return (
    <Fragment>
      {messageType === MESSAGE_TYPES.OUTGOING || messageType === MESSAGE_TYPES.ACTIVITY ? (
        <View>
          {messageType === MESSAGE_TYPES.OUTGOING && (
            <View style={styles.itemView}>
              {isPrivate ? (
                <View style={styles.icon}>
                  <Icon color={colors.text} icon="lock-closed-outline" size={14} />
                </View>
              ) : (
                <View style={styles.icon}>
                  <Icon color={colors.text} icon="arrow-reply-outline" size={14} />
                </View>
              )}
              {unReadCount ? (
                <Text semiBold sm numberOfLines={1} maxLength={8} color={colors.text}>
                  {getTextSubstringWithEllipsis(message, 34)}
                </Text>
              ) : (
                <Text sm numberOfLines={1} maxLength={8} color={colors.text}>
                  {getTextSubstringWithEllipsis(message, 34)}
                </Text>
              )}
            </View>
          )}
          {messageType === MESSAGE_TYPES.ACTIVITY && (
            <View style={styles.itemView}>
              <View style={styles.icon}>
                <Icon color={colors.text} icon="info-outline" size={14} />
              </View>
              {unReadCount ? (
                <Text semiBold sm numberOfLines={1} maxLength={8} color={colors.text}>
                  {getTextSubstringWithEllipsis(message, 32)}
                </Text>
              ) : (
                <Text sm numberOfLines={1} maxLength={8} color={colors.text}>
                  {getTextSubstringWithEllipsis(message, 32)}
                </Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.itemView}>
          {unReadCount ? (
            <Text semiBold sm numberOfLines={1} maxLength={8} color={colors.text}>
              {getTextSubstringWithEllipsis(message, 34)}
            </Text>
          ) : (
            <Text sm numberOfLines={1} maxLength={8} color={colors.text}>
              {getTextSubstringWithEllipsis(message, 34)}
            </Text>
          )}
        </View>
      )}
    </Fragment>
  );
};

ConversationContent.propTypes = propTypes;
export default ConversationContent;
