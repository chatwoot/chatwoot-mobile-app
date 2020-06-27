import { withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from './Text';
import UserAvatar from './UserAvatar';
import { dynamicTime } from '../helpers/TimeHelper';
import { findLastMessage, getUnreadCount, getInboxName, getTypingUsersText } from '../helpers';

import ConversationAttachmentItem from './ConversationAttachmentItem';

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
        channel: PropTypes.string,
      }),
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
      sender: { name, thumbnail, channel },
    },
    messages,
    inbox_id: inboxId,
    id,
  } = item;
  const inboxName = getInboxName({ inboxes, inboxId });

  const unread_count = getUnreadCount(item);

  const lastMessage = findLastMessage({ messages });
  const { content, created_at, attachments } = lastMessage;

  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId: id,
  });

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
            defaultBGColor={theme['color-primary-default']}
            channel={channel}
          />
        </View>
        <View>
          <View style={style.nameView}>
            <CustomText
              style={unread_count ? style.conversationUserActive : style.conversationUserNotActive}>
              {name.length < 26 ? `${name}` : `${name.substring(0, 20)}...`}
            </CustomText>

            {inboxName && (
              <CustomText style={style.labelText}>
                {inboxName.length < 10 ? `${inboxName}` : `${inboxName.substring(0, 7)}...`}
              </CustomText>
            )}
          </View>
          {!typingUser ? (
            attachments && attachments.length ? (
              <ConversationAttachmentItem
                style={style}
                theme={theme}
                unReadCount={unread_count}
                attachment={attachments[0]}
              />
            ) : (
              <CustomText
                style={unread_count ? style.messageActive : style.messageNotActive}
                numberOfLines={1}
                maxLength={8}>
                {content && content.length > 30 ? `${content.substring(0, 30)}...` : `${content}`}
              </CustomText>
            )
          ) : (
            <CustomText style={style.typingText}>
              {typingUser && typingUser.length > 25
                ? `${typingUser.substring(0, 25)}...`
                : `${typingUser}`}
            </CustomText>
          )}
        </View>
      </View>
      <View>
        <View>
          <CustomText style={style.timeStamp}>{dynamicTime({ time: created_at })}</CustomText>
        </View>
        {unread_count ? (
          <View style={style.badgeView}>
            <View style={style.badge}>
              <Text style={style.badgeCount}>{unread_count.toString()}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = (theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme['background-basic-color-1'],
    marginVertical: 0.5,
    borderColor: theme['color-border'],
    borderBottomWidth: 0,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationUserActive: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  conversationUserNotActive: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
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
    paddingTop: 16,
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
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  messageActive: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  messageNotActive: {
    fontSize: theme['text-primary-size'],
    paddingTop: 4,
    color: theme['text-light-color'],
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    color: theme['color-primary-default'],
    fontSize: theme['font-size-extra-extra-small'],
    fontWeight: theme['font-semi-bold'],
    borderRadius: 3,
    paddingLeft: 2,
    paddingRight: 2,
    marginLeft: 4,
    backgroundColor: theme['color-background-inbox'],
  },
});

ConversationItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(ConversationItemComponent, styles);

export default React.memo(ChatMessageItem);
