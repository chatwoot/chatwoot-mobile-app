import { withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from './Text';
import UserAvatar from './UserAvatar';

import { timeAgo } from '../helpers/TimeHelper';

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    push_message_title: PropTypes.string,
    notification_type: PropTypes.string,
    created_at: PropTypes.number,
    primary_actor: PropTypes.shape({
      meta: PropTypes.shape({
        sender: PropTypes.shape({
          name: PropTypes.string,
          thumbnail: PropTypes.string,
        }),
      }),
      channel: PropTypes.string,
    }),
    read_at: PropTypes.string,
  }).isRequired,
  onSelectNotification: PropTypes.func,
};
const NotificationItemComponent = ({ eva, item, onSelectNotification }) => {
  const { style, theme } = eva;

  const {
    push_message_title,
    read_at,
    created_at,
    primary_actor: {
      meta: {
        sender: { name, thumbnail },
      },
      channel,
    },
  } = item;
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[style.itemContainer]}
      onPress={() => onSelectNotification(item)}>
      <View style={style.itemView}>
        <View style={style.avatarView}>
          <UserAvatar
            thumbnail={thumbnail}
            userName={name}
            defaultBGColor={theme['color-primary-default']}
            channel={channel}
          />
        </View>
        <View style={style.contentView}>
          <CustomText style={style.content}>{push_message_title}</CustomText>
          <CustomText style={style.time}>{`${timeAgo({ time: created_at })}`}</CustomText>
        </View>
        {!read_at && (
          <View style={style.readView}>
            <View style={style.readBubble} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = (theme) => ({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 12,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarView: {
    justifyContent: 'flex-end',
    marginRight: 16,
    flex: 3,
  },
  contentView: {
    flex: 18,
  },

  readView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  time: {
    color: theme['text-hint-color'],
    fontSize: theme['font-size-extra-extra-small'],
    fontWeight: theme['font-regular'],
  },
  readBubble: {
    borderRadius: 5,
    borderColor: theme['color-primary-default'],
    height: 5,
    width: 5,
    borderWidth: 5,
    marginTop: 8,
  },
});

NotificationItemComponent.propTypes = propTypes;

const NotificationItem = withStyles(NotificationItemComponent, styles);

export default React.memo(NotificationItem);
