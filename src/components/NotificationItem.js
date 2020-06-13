import { withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
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
    },
  } = item;

  return (
    <TouchableOpacity style={style.itemContainer} onPress={() => onSelectNotification(item)}>
      <View style={style.itemView}>
        <View style={style.avatarView}>
          <UserAvatar
            thumbnail={thumbnail}
            userName={name}
            defaultBGColor={theme['color-primary-default']}
          />
        </View>
        <View style={style.contentView}>
          <Text>
            <CustomText style={style.content}>{push_message_title}</CustomText>
            <CustomText style={style.time}>{`  ${timeAgo({ time: created_at })}`}</CustomText>
          </Text>
        </View>

        <View style={style.readView}>{!read_at && <View style={style.readBubble} />}</View>
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
    backgroundColor: theme['background-basic-color-1'],
    marginVertical: 0.5,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarView: {
    justifyContent: 'flex-end',
    marginRight: 16,
    flex: 2,
  },
  contentView: {
    flex: 12,
  },

  readView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readBubble: {
    borderRadius: 6,
    borderColor: 'hsl(214, 69%, 52%)',
    height: 6,
    width: 6,
    borderWidth: 6,
    marginTop: 8,
  },
  content: {
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  time: {
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-bold'],
    color: 'gray',
    fontStyle: 'italic',
  },
});

NotificationItemComponent.propTypes = propTypes;

const NotificationItem = withStyles(NotificationItemComponent, styles);

// export default React.memo(NotificationItem);
export default NotificationItem;
