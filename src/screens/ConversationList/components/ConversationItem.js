import { withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from 'components/Text';
import UserAvatar from 'components/UserAvatar';
import { dynamicTime } from 'helpers/TimeHelper';
import { findLastMessage, getUnreadCount, getInboxName, getTypingUsersText } from 'helpers';

import ConversationAttachmentItem from './ConversationAttachmentItem';
import ConversationContentItem from './ConversationContentItem';
import InboxName from 'src/screens/ChatScreen/components/InboxName';

import { getTextSubstringWithEllipsis } from 'src/helpers/TextSubstring';

import { INBOX_ICON } from 'src/constants/index';

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  name: PropTypes.string,
  onSelectConversation: PropTypes.func,
  inboxes: PropTypes.array.isRequired,
  conversationTypingUsers: PropTypes.shape({}),
  item: PropTypes.shape({
    id: PropTypes.number,
    meta: PropTypes.shape({
      sender: PropTypes.shape({
        name: PropTypes.string,
        thumbnail: PropTypes.string,
        availability_status: PropTypes.string,
      }),
      channel: PropTypes.string,
    }),
    messages: PropTypes.array.isRequired,
    inbox_id: PropTypes.number,
  }).isRequired,
};
const ConversationItemComponent = ({
  eva,
  item,
  onSelectConversation,
  inboxes,
  conversationTypingUsers,
}) => {
  const { style, theme } = eva;

  const {
    meta: {
      sender: { name, thumbnail, availability_status: availabilityStatus },
      channel,
    },
    messages,
    inbox_id: inboxId,
    id,
  } = item;
  const inboxName = getInboxName({ inboxes, inboxId });

  const unreadCount = getUnreadCount(item);

  const lastMessage = findLastMessage({ messages });
  const { content, created_at, attachments, message_type, private: isPrivate } = lastMessage;

  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId: id,
  });

  const iconName = INBOX_ICON[channel];

  const isActive = availabilityStatus === 'online' ? true : false;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={style.container}
      onPress={() => onSelectConversation(item)}>
      <View style={style.itemView}>
        <View style={style.avatarView}>
          <UserAvatar
            thumbnail={thumbnail}
            userName={name}
            size={40}
            fontSize={16}
            defaultBGColor={theme['color-primary-default']}
            channel={channel}
            isActive={isActive}
            availabilityStatus={availabilityStatus}
          />
        </View>
        <View style={style.listWrap}>
          <View style={style.nameView}>
            <View>
              <CustomText style={style.conversationId}>#{id}</CustomText>
            </View>
            <View style={style.inboxDetails}>
              <InboxName iconName={iconName} inboxName={inboxName} />
            </View>
          </View>
          <View style={style.conversationContainer}>
            <View>
              <View style={style.labelView}>
                {!!name && (
                  <CustomText
                    style={
                      unreadCount ? style.conversationUserActive : style.conversationUserNotActive
                    }>
                    {getTextSubstringWithEllipsis(name, 26)}
                  </CustomText>
                )}
              </View>
              {!typingUser ? (
                !content && attachments && attachments.length ? (
                  <ConversationAttachmentItem
                    style={style}
                    theme={theme}
                    unReadCount={unreadCount}
                    attachment={attachments[0]}
                  />
                ) : (
                  <ConversationContentItem
                    content={content}
                    unReadCount={unreadCount}
                    messageType={message_type}
                    isPrivate={isPrivate}
                  />
                )
              ) : (
                <CustomText style={style.typingText}>
                  {getTextSubstringWithEllipsis(typingUser, 25)}
                </CustomText>
              )}
            </View>
            <View style={style.timestampContainer}>
              <View>
                <CustomText style={style.timeStamp}>{dynamicTime({ time: created_at })}</CustomText>
              </View>
              {unreadCount ? (
                <View style={style.badgeView}>
                  <View style={style.badge}>
                    <Text style={style.badgeCount}>{unreadCount.toString()}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme['background-basic-color-1'],
    borderColor: theme['item-border-color'],
    borderBottomWidth: 1,
  },
  listWrap: {
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  conversationUserActive: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
  },
  conversationUserNotActive: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    color: theme['text-basic-color'],
  },
  avatarView: {
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  userActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'green',
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 2,
    right: 2,
  },
  timeStamp: {
    color: theme['text-hint-color'],
    fontSize: theme['font-size-extra-extra-small'],
    fontWeight: theme['font-regular'],
  },
  badgeView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: theme['color-success-default'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    color: theme['text-control-color'],
    fontSize: theme['font-size-extra-extra-small'],
    fontWeight: theme['font-medium'],
  },
  typingText: {
    color: theme['color-success-default'],
    fontSize: theme['font-size-small'],
    paddingTop: 4,
  },
  nameView: {
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationId: {
    color: theme['color-secondary-500'],
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    paddingRight: 4,
  },
  timestampContainer: {
    marginTop: 2,
    justifyContent: 'flex-end',
    flexDirection: 'column',
    position: 'absolute',
    right: 0,
  },
});

ConversationItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(ConversationItemComponent, styles);

export default React.memo(ChatMessageItem);
