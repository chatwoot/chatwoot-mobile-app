import { withStyles, Icon } from '@ui-kitten/components';
import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from './Text';
import UserAvatar from './UserAvatar';
import { dynamicTime } from '../helpers/TimeHelper';
import { findLastMessage, getUnreadCount } from '../helpers';
import i18n from '../i18n';

class ConversationItem extends Component {
  static propTypes = {
    themedStyle: PropTypes.object,
    theme: PropTypes.object,
    name: PropTypes.string,
    onSelectConversation: PropTypes.func,
    item: PropTypes.shape({
      meta: PropTypes.shape({
        sender: PropTypes.shape({
          name: PropTypes.string,
          thumbnail: PropTypes.string,
        }),
      }),
      messages: PropTypes.array.isRequired,
    }).isRequired,
  };

  render() {
    const { themedStyle, item, onSelectConversation } = this.props;
    const {
      meta: {
        sender: { name, thumbnail },
      },
      messages,
    } = item;

    const unread_count = getUnreadCount(item);

    const lastMessage = findLastMessage({ messages });
    const { content, created_at } = lastMessage;

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={themedStyle.container}
        onPress={() => onSelectConversation(item)}>
        <View style={themedStyle.itemView}>
          <View style={themedStyle.avatarView}>
            <UserAvatar
              thumbnail={thumbnail}
              userName={name}
              defaultBGColor=""
            />
          </View>
          <View>
            <CustomText
              style={
                unread_count
                  ? themedStyle.conversationUserActive
                  : themedStyle.conversationUserNotActive
              }>
              {name}
            </CustomText>
            {lastMessage.content ? (
              <CustomText
                style={
                  unread_count
                    ? themedStyle.messageActive
                    : themedStyle.messageNotActive
                }
                numberOfLines={1}
                maxLength={8}>
                {content.length < 25
                  ? `${content}`
                  : `${content.substring(0, 25)}...`}
              </CustomText>
            ) : (
              <View style={themedStyle.imageView}>
                <Icon style={themedStyle.previewIcon} name="image-outline" />
                <CustomText
                  style={
                    unread_count
                      ? themedStyle.messageActive
                      : themedStyle.messageNotActive
                  }
                  numberOfLines={1}
                  maxLength={8}>
                  {i18n.t('CONVERSATION.PICTURE_CONTENT')}
                </CustomText>
              </View>
            )}
          </View>
        </View>
        <View>
          <View>
            <CustomText style={themedStyle.timeStamp}>
              {dynamicTime({ time: created_at })}
            </CustomText>
          </View>
          {unread_count ? (
            <View style={themedStyle.badgeView}>
              <View style={themedStyle.badge}>
                <Text style={themedStyle.badgeCount}>
                  {unread_count.toString()}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }
}

export default withStyles(ConversationItem, theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme['background-basic-color-1'],
    marginVertical: 0.5,
    borderColor: theme['color-border'],
    borderBottomWidth: 1,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationUserActive: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  conversationUserNotActive: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-medium'],
    paddingTop: 4,
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
  imageView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 16,
    height: 16,
    marginTop: 4,
  },
  messageActive: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  messageNotActive: {
    fontSize: theme['text-primary-size'],
    paddingTop: 4,
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
}));
