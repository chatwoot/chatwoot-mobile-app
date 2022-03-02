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
            fontSize={14}
            defaultBGColor={theme['color-primary-default']}
            channel={channel}
            isActive={isActive}
            availabilityStatus={availabilityStatus}
          />
        </View>
        <View>
          <View style={style.labelView}>
            {name && (
              <CustomText
                style={
                  unreadCount ? style.conversationUserActive : style.conversationUserNotActive
                }>
                {name.length < 26 ? `${name}` : `${name.substring(0, 20)}...`}
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
              {typingUser && typingUser.length > 25
                ? `${typingUser.substring(0, 25)}...`
                : `${typingUser}`}
            </CustomText>
          )}
          <View style={style.nameView}>
            <CustomText style={style.conversationId}>#{id}</CustomText>
            {inboxName && <CustomText style={style.channelText}>{inboxName}</CustomText>}
          </View>
        </View>
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
    marginVertical: 0.5,
    borderColor: theme['item-border-color'],
    borderBottomWidth: 1,
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
    justifyContent: 'flex-end',
    marginRight: 16,
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
    paddingTop: 8,
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
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationId: {
    color: theme['color-primary-default'],
    fontSize: theme['font-size-extra-extra-small'],
    fontWeight: theme['font-semi-bold'],
    borderRadius: 4,
    padding: 4,
    backgroundColor: theme['color-background-inbox'],
  },
  channelText: {
    color: theme['color-primary-default'],
    fontSize: theme['font-size-extra-extra-small'],
    fontWeight: theme['font-semi-bold'],
    borderRadius: 4,
    marginLeft: 8,
    padding: 4,
    backgroundColor: theme['color-background-inbox'],
  },
  timestampContainer: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
});

ConversationItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(ConversationItemComponent, styles);

export default React.memo(ChatMessageItem);