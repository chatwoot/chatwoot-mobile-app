import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Icon, InboxName, UserAvatar } from 'components';
import { getTextSubstringWithEllipsis } from 'helpers';
import { getUnreadCount, findLastMessage, getInboxName } from 'helpers/conversationHelpers';
import { getTypingUsersText } from 'helpers';
import ConversationContent from './ConversationContent';
import ConversationAttachment from './ConversationAttachment';
import { dynamicTime } from 'helpers/TimeHelper';
import { inboxesSelector } from 'reducer/inboxSlice';
import CardLabel from './CardLabels';

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
    status: PropTypes.string,
  }).isRequired,
  conversationTypingUsers: PropTypes.shape({}),
  showAssigneeLabel: PropTypes.bool,
  onPress: PropTypes.func,
};

const ConversationItem = ({ item, conversationTypingUsers, onPress, showAssigneeLabel }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const inboxes = useSelector(inboxesSelector.selectAll);
  const {
    meta: {
      assignee: { name: assigneeName } = {},
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
                    {assigneeName}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.conversationDetails}>
              <View>
                <View style={styles.nameView}>
                  {!!name &&
                    (unReadCount ? (
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
                      unReadCount={unReadCount}
                    />
                  )
                ) : (
                  <Text sm color={colors.successColor}>
                    {getTextSubstringWithEllipsis(typingUser, 25)}
                  </Text>
                )}
                <CardLabel conversationDetails={item} conversationId={id} />
              </View>
            </View>
            <View style={styles.unreadTimestampContainer}>
              <View>
                <Text xxs color={colors.textLight}>
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
  });
};
