import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, InboxName, UserAvatar } from 'components';
import { getTextSubstringWithEllipsis } from 'helpers';
import { getUnreadCount, findLastMessage, getInboxName } from 'helpers/conversationHelpers';
import { getTypingUsersText } from 'helpers';
import ConversationContent from './ConversationContent';
import ConversationAttachment from './ConversationAttachment';
import { dynamicTime } from 'helpers/TimeHelper';

const propTypes = {
  item: PropTypes.shape({
    meta: PropTypes.shape({
      sender: PropTypes.shape({
        name: PropTypes.string,
        thumbnail: PropTypes.string,
        availability_status: PropTypes.string,
      }),
      channel: PropTypes.string,
    }),
    additional_attributes: PropTypes.object,
    messages: PropTypes.array,
    inbox_id: PropTypes.number,
    id: PropTypes.number,
    status: PropTypes.string,
  }).isRequired,
  conversationTypingUsers: PropTypes.shape({}),
  onPress: PropTypes.func,
};

const ConversationItem = ({ item, conversationTypingUsers, onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const inboxes = useSelector(state => state.inbox.data);
  const {
    meta: {
      sender: { name, thumbnail, availability_status: availabilityStatus },
      channel,
    },
    additional_attributes: additionalAttributes = {},
    messages,
    inbox_id: inboxId,
    id,
  } = item;

  const lastMessage = findLastMessage({ messages });
  const { content, created_at, attachments, message_type, private: isPrivate } = lastMessage;
  const {
    name: inboxName = null,
    channel_type: channelType = null,
    phone_number: phoneNumber = null,
  } = getInboxName({
    inboxes,
    inboxId,
  });
  const inboxDetails = inboxes ? inboxes.find(inbox => inbox.id === inboxId) : {};
  const unReadCount = useMemo(() => getUnreadCount(item), [item]);

  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId: id,
  });

  return (
    <View>
      <Pressable
        activeOpacity={0.5}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? colors.backgroundLight : colors.background,
          },
          styles.container,
        ]}
        onPress={onPress}>
        <View style={styles.itemView}>
          <View style={styles.avatarView}>
            <UserAvatar
              thumbnail={thumbnail}
              userName={name}
              size={46}
              fontSize={16}
              defaultBGColor={colors.primary}
              channel={channel}
              inboxInfo={inboxDetails}
              chatAdditionalInfo={additionalAttributes}
              availabilityStatus={availabilityStatus !== 'offline' ? availabilityStatus : ''}
            />
          </View>
          <View style={styles.contentView}>
            <View style={styles.labelView}>
              <View style={styles.idView}>
                <Text xxs medium color={colors.textLight}>
                  #{id}
                </Text>
              </View>
              <View>
                <InboxName
                  inboxName={inboxName}
                  channelType={channelType}
                  phoneNumber={phoneNumber}
                />
              </View>
            </View>
            <View style={styles.conversationDetails}>
              <View>
                <View style={styles.nameView}>
                  {!!name && (
                    <Text sm semiBold color={unReadCount ? colors.textDark : colors.textDark}>
                      {getTextSubstringWithEllipsis(name, 26)}
                    </Text>
                  )}
                </View>
                {!typingUser ? (
                  !content && attachments && attachments.length ? (
                    <ConversationAttachment attachment={attachments[0]} />
                  ) : (
                    <ConversationContent
                      content={content}
                      messageType={message_type}
                      isPrivate={isPrivate}
                    />
                  )
                ) : (
                  <Text sm color={colors.successColor}>
                    {getTextSubstringWithEllipsis(typingUser, 25)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.unreadTimestampContainer}>
              <View>
                <Text xxs regular color={colors.textLight}>
                  {dynamicTime({ time: created_at })}
                </Text>
              </View>
              {unReadCount ? (
                <View style={styles.badgeView}>
                  <View style={styles.badge}>
                    <Text xxs medium color={colors.colorWhite}>
                      {unReadCount.toString()}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};
ConversationItem.propTypes = propTypes;
export default ConversationItem;

const createStyles = theme => {
  const { colors, spacing, fontSize } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    avatarView: {
      alignSelf: 'center',
      marginRight: spacing.smaller,
    },
    contentView: {
      flex: 1,
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      borderColor: colors.borderLight,
      borderBottomWidth: 1,
    },
    nameView: {
      marginBottom: spacing.micro,
      color: colors.textLight,
      fontSize: fontSize.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    conversationDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    labelView: {
      marginBottom: spacing.micro,
      flexDirection: 'row',
      alignItems: 'center',
    },
    idView: {
      marginRight: spacing.smaller,
    },
    userName: {
      textTransform: 'capitalize',
    },
    unreadTimestampContainer: {
      paddingTop: spacing.large,
      justifyContent: 'flex-end',
      flexDirection: 'column',
      position: 'absolute',
      right: spacing.zero,
    },
    badgeView: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      paddingTop: spacing.smaller,
    },
    badge: {
      width: 18,
      height: 18,
      borderRadius: 16,
      backgroundColor: colors.successColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
