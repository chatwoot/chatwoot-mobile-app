import React, { useMemo, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Text, Icon, InboxName, UserAvatar } from 'components';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { getTextSubstringWithEllipsis } from 'helpers';
import { findLastMessage, getInboxName } from 'helpers/conversationHelpers';
import { getTypingUsersText } from 'helpers';
import ConversationContent from './ConversationContent';
import ConversationAttachment from './ConversationAttachment';
import { dynamicTime } from 'helpers/TimeHelper';
import { inboxesSelector } from 'reducer/inboxSlice';
import conversationActions from 'reducer/conversationSlice.action';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';

import ConversationLabel from './ConversationLabels';

const propTypes = {
  item: PropTypes.shape({
    meta: PropTypes.shape({
      assignee: PropTypes.shape({
        name: PropTypes.string,
      }),
      sender: PropTypes.shape({
        name: PropTypes.string,
        thumbnail: PropTypes.string,
        availability_status: PropTypes.string,
      }),
      channel: PropTypes.string,
    }),
    labels: PropTypes.array,
    additional_attributes: PropTypes.object,
    messages: PropTypes.array,
    inbox_id: PropTypes.number,
    id: PropTypes.number,
    unread_count: PropTypes.number,
    status: PropTypes.string,
    last_non_activity_message: PropTypes.object,
  }).isRequired,
  conversationTypingUsers: PropTypes.shape({}),
  showAssigneeLabel: PropTypes.bool,
  onPress: PropTypes.func,
};

const ConversationItem = ({ item, conversationTypingUsers, onPress, showAssigneeLabel }) => {
  const swipeableRef = useRef(null);

  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const dispatch = useDispatch();
  const inboxes = useSelector(inboxesSelector.selectAll);
  const {
    meta: {
      assignee,
      sender: { name, thumbnail, availability_status: availabilityStatus },
      channel,
    },
    additional_attributes: additionalAttributes = {},
    inbox_id: inboxId,
    id,
    unread_count: unreadCount,
  } = item;

  const assigneeName = assignee?.name;
  const lastMessage = findLastMessage(item);

  if (!lastMessage) {
    return null;
  }

  const content = lastMessage?.content;
  const { created_at, attachments, message_type, private: isPrivate } = lastMessage;
  const {
    name: inboxName = null,
    channel_type: channelType = null,
    phone_number: phoneNumber = null,
  } = getInboxName({
    inboxes,
    inboxId,
  });
  const inboxDetails = inboxes ? inboxes.find(inbox => inbox.id === inboxId) : {};

  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId: id,
  });

  const markAsUnreadAndClose = () => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.MARK_AS_UNREAD);
    dispatch(conversationActions.markMessagesAsUnread({ conversationId: id }));
    swipeableRef.current.close();
  };

  const markAsReadAndClose = () => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.MARK_AS_READ);
    dispatch(conversationActions.markMessagesAsRead({ conversationId: id }));
    swipeableRef.current.close();
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-20, 1, 0],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.leftSwipeActionView}>
        {!unreadCount ? (
          <RectButton style={styles.leftSwipeAction} onPress={() => markAsUnreadAndClose()}>
            <Animated.Text
              style={[
                {
                  transform: [{ translateX: trans }],
                },
              ]}>
              <Pressable style={styles.readUnreadMessageSwipeAction}>
                <Icon color={colors.colorWhite} icon="mail-unread-outline" size={24} />
                <Text sm semiBold color={colors.colorWhite} style={styles.swipeActionText}>
                  Unread
                </Text>
              </Pressable>
            </Animated.Text>
          </RectButton>
        ) : (
          <RectButton style={styles.leftSwipeAction} onPress={() => markAsReadAndClose()}>
            <Animated.Text
              style={[
                {
                  transform: [{ translateX: trans }],
                },
              ]}>
              <Pressable style={styles.readUnreadMessageSwipeAction}>
                <Icon color={colors.colorWhite} icon="mail-outline" size={24} />
                <Text sm semiBold color={colors.colorWhite} style={styles.swipeActionText}>
                  Read
                </Text>
              </Pressable>
            </Animated.Text>
          </RectButton>
        )}
      </View>
    );
  };

  return (
    <Swipeable renderLeftActions={renderRightActions} friction={2} ref={swipeableRef}>
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
            <View style={styles.conversationMeta}>
              <View style={styles.metaDetails}>
                <View style={styles.idView}>
                  <Text xs medium color={colors.textLight}>
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
              {showAssigneeLabel && assigneeName && (
                <View style={styles.assigneeLabel}>
                  <Icon icon="person-outline" color={colors.textLighter} size={12} />
                  <Text xs color={colors.textLighter}>
                    {getTextSubstringWithEllipsis(assigneeName, 14)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.conversationDetails}>
              <View>
                <View style={styles.nameView}>
                  {!!name &&
                    (unreadCount ? (
                      <Text sm semiBold color={colors.textDark}>
                        {getTextSubstringWithEllipsis(name, 22)}
                      </Text>
                    ) : (
                      <Text sm medium color={colors.textDark}>
                        {getTextSubstringWithEllipsis(name, 22)}
                      </Text>
                    ))}
                </View>
                {!typingUser ? (
                  !content && attachments && attachments.length ? (
                    <ConversationAttachment attachment={attachments[0]} />
                  ) : (
                    <ConversationContent
                      content={content}
                      messageType={message_type}
                      isPrivate={isPrivate}
                      unReadCount={unreadCount}
                    />
                  )
                ) : (
                  <Text sm color={colors.successColor}>
                    {getTextSubstringWithEllipsis(typingUser, 25)}
                  </Text>
                )}
                <ConversationLabel conversationDetails={item} conversationId={id} />
              </View>
            </View>
            <View style={styles.unreadTimestampContainer}>
              <View>
                <Text xxs color={colors.textLight}>
                  {dynamicTime({ time: created_at })}
                </Text>
              </View>
              {unreadCount ? (
                <View style={styles.badgeView}>
                  <View style={styles.badge}>
                    <Text xxs medium color={colors.colorWhite}>
                      {unreadCount > 9 ? '9+' : unreadCount.toString()}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Swipeable>
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
      paddingTop: spacing.half,
      paddingBottom: spacing.half,
      borderColor: colors.borderLight,
      borderBottomWidth: 1,
    },
    nameView: {
      marginBottom: spacing.tiny,
      color: colors.textLight,
      fontSize: fontSize.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    conversationDetails: {
      paddingTop: spacing.tiny,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    conversationMeta: {
      marginBottom: spacing.tiny,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    assigneeLabel: {
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
      marginTop: spacing.tiny,
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
    leftSwipeActionView: {
      backgroundColor: colors.primary,
      width: 90,
    },
    leftSwipeAction: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 90,
      height: '100%',
    },
    readUnreadMessageSwipeAction: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
