import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { UserAvatar, Text, Pressable } from 'components';
import { timeAgo } from '../helpers/TimeHelper';

const propTypes = {
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
const NotificationItemComponent = ({ item, onSelectNotification }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    push_message_title,
    read_at,
    created_at,
    primary_actor: { meta: { sender: { name = null, thumbnail = null } = {} } = {}, channel } = {},
  } = item;
  return (
    <Pressable style={styles.itemContainer} onPress={() => onSelectNotification(item)}>
      <View style={styles.itemView}>
        <View style={styles.avatarView}>
          <UserAvatar
            thumbnail={thumbnail}
            userName={name}
            size={36}
            fontSize={14}
            channel={channel}
          />
        </View>
        <View style={styles.contentView}>
          {!read_at ? (
            <Text xs medium color={colors.textDark} style={styles.content}>
              {push_message_title}
            </Text>
          ) : (
            <Text xs color={colors.textDark} style={styles.content}>
              {push_message_title}
            </Text>
          )}
          <Text xxs color={colors.textLighter}>
            {`${timeAgo({ time: created_at })}`}
          </Text>
        </View>
        {!read_at && (
          <View style={styles.readView}>
            <View style={styles.readBubble} />
          </View>
        )}
      </View>
    </Pressable>
  );
};

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      paddingBottom: spacing.half,
      paddingTop: spacing.half,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarView: {
      justifyContent: 'flex-end',
      marginRight: spacing.micro,
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
      paddingTop: spacing.micro,
      paddingBottom: spacing.micro,
    },
    readBubble: {
      borderRadius: borderRadius.small,
      borderColor: colors.primaryColor,
      backgroundColor: colors.primaryColor,
      height: spacing.smaller,
      width: spacing.smaller,
      borderWidth: spacing.tiny,
      marginTop: spacing.smaller,
    },
  });
};

NotificationItemComponent.propTypes = propTypes;
export default NotificationItemComponent;
