import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
import Icon from 'components/Icon/Icon';
import Text from 'components/Text/Text';
import UserAvatar from 'components/UserAvatar';
import InboxName from 'components/InboxName/InboxName';
import { getTextSubstringWithEllipsis } from 'helpers/TextSubstring';
import { getUnreadCount, findLastMessage, getInboxName } from 'helpers/conversationHelpers';
import ConversationContent from './ConversationContent';
import ConversationAttachment from './ConversationAttachment';
import { dynamicTime } from 'helpers/TimeHelper';
// import { inboxesSelector } from 'store/reducers/inboxSlice';
// import Swipeable from 'react-native-gesture-handler/Swipeable';
// import { RectButton } from 'react-native-gesture-handler';
// import { CONVERSATION_STATUS } from 'src/constants/index';

const isAndroid = Platform.OS === 'android';

const propTypes = {
  inboxes: PropTypes.array.isRequired,
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
  onPress: PropTypes.func,
};

const ConversationItem = ({ inboxes, item, onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  // const inboxes = useSelector(inboxesSelector.selectAll);
  const {
    meta: {
      sender: { name, thumbnail, availability_status: availabilityStatus },
      channel,
    },
    additional_attributes: additionalAttributes = {},
    messages,
    inbox_id: inboxId,
    id,
    status,
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
  const typingUser = '';
  const unReadCount = useMemo(() => getUnreadCount(item), [item]);

  // const renderRightActions = (progress, dragX) => {
  //   const trans = dragX.interpolate({
  //     inputRange: [0, 50, 100, 101],
  //     outputRange: [0, 0, 0, 1],
  //   });
  //   return (
  //     <RectButton style={styles.leftSwipeAction}>
  //       {status === CONVERSATION_STATUS.OPEN && (
  //         <Animated.Text
  //           style={[
  //             styles.resolveAction,
  //             {
  //               transform: [{ translateX: trans }],
  //             },
  //           ]}>
  //           <Pressable
  //             style={({ pressed }) => [
  //               {
  //                 opacity: pressed ? 0.6 : 1,
  //               },
  //               styles.actionView,
  //             ]}>
  //             <Icon color={colors.colorWhite} icon="checkmark-solid" size={24} />
  //             <Text sm semiBold color={colors.colorWhite} style={styles.swipeActionText}>
  //               Resolve
  //             </Text>
  //           </Pressable>
  //         </Animated.Text>
  //       )}
  //       {status === CONVERSATION_STATUS.RESOLVED && (
  //         <Animated.Text
  //           style={[
  //             styles.reopenAction,
  //             {
  //               transform: [{ translateX: trans }],
  //             },
  //           ]}>
  //           <Pressable
  //             style={({ pressed }) => [
  //               {
  //                 opacity: pressed ? 0.6 : 1,
  //               },
  //               styles.actionView,
  //             ]}>
  //             <Icon color={colors.colorWhite} icon="arrow-redo-outline" size={24} />
  //             <Text sm semiBold color={colors.colorWhite} style={styles.swipeActionText}>
  //               Reopen
  //             </Text>
  //           </Pressable>
  //         </Animated.Text>
  //       )}
  //       {(status === CONVERSATION_STATUS.PENDING || status === CONVERSATION_STATUS.SNOOZED) && (
  //         <Animated.Text
  //           style={[
  //             styles.pendingOpenAction,
  //             {
  //               transform: [{ translateX: trans }],
  //             },
  //           ]}>
  //           <Pressable
  //             style={({ pressed }) => [
  //               {
  //                 opacity: pressed ? 0.6 : 1,
  //               },
  //               styles.actionView,
  //               styles.openActionView,
  //             ]}>
  //             <Icon color={colors.colorWhite} icon="person-outline" size={22} />
  //             <Text sm semiBold color={colors.colorWhite} style={styles.swipeActionText}>
  //               Open
  //             </Text>
  //           </Pressable>
  //         </Animated.Text>
  //       )}
  //       <Animated.Text
  //         style={[
  //           styles.moreAction,
  //           {
  //             transform: [{ translateX: trans }],
  //           },
  //         ]}>
  //         <Pressable
  //           style={({ pressed }) => [
  //             {
  //               opacity: pressed ? 0.6 : 1,
  //             },
  //             styles.actionView,
  //             styles.moreActionView,
  //           ]}>
  //           <Icon color={colors.colorWhite} icon="more-horizontal" size={24} />
  //           <Text sm semiBold color={colors.colorWhite} style={styles.swipeActionText}>
  //             More
  //           </Text>
  //         </Pressable>
  //       </Animated.Text>
  //     </RectButton>
  //   );
  // };

  return (
    // <Swipeable renderRightActions={renderRightActions}>
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
                  <Text sm color={colors.text} style={styles.typingText}>
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
      {/* </Swipeable> */}
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
      width: spacing.small,
      height: spacing.small,
      borderRadius: 16,
      backgroundColor: colors.successColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typingText: {
      paddingTop: spacing.micro,
    },
    leftSwipeAction: {
      flex: 0.4,
      backgroundColor: colors.background,
      flexDirection: 'row',
    },
    resolveAction: {
      flex: 0.5,
      backgroundColor: colors.successColor,
    },
    reopenAction: {
      flex: 0.5,
      backgroundColor: colors.warningColor,
    },
    moreAction: {
      flex: 0.5,
      backgroundColor: colors.secondaryColor,
    },
    pendingOpenAction: {
      flex: 0.5,
      backgroundColor: colors.primaryColor,
    },
    actionView: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      paddingTop: !isAndroid ? spacing.micro : spacing.small,
      paddingHorizontal: spacing.half,
    },
    moreActionView: {
      paddingHorizontal: spacing.small,
    },
    openActionView: {
      paddingHorizontal: spacing.small,
    },
    swipeActionText: {
      marginTop: spacing.micro,
    },
  });
};
