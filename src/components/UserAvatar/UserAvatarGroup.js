import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';

import { UserAvatar } from 'components';

const UserAvatarGroup = ({ users, size, showMoreText, moreText, length, fontSize }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (users.length === 0 || length === 0) {
    return null;
  }

  const renderUserAvatar = (user, index) => {
    const { thumbnail, name } = user;
    return (
      <View
        key={index}
        style={[
          styles.avatarContainer,
          styles.bubbleBorder,
          { width: size + 1, height: size + 1 },
        ]}>
        <UserAvatar thumbnail={thumbnail} userName={name} size={size} fontSize={fontSize} />
      </View>
    );
  };

  const renderAvatarCount = () => {
    const count = users.length - length;
    return (
      <View style={[styles.countContainer, styles.bubbleBorder, { height: size + 1 }]}>
        <Text style={[styles.countText, { fontSize }]}>{`+${count} ${moreText || ''}`}</Text>
      </View>
    );
  };

  const renderUserAvatars = () => {
    if (users.length > length) {
      const visibleAvatars = users.slice(0, length);
      return (
        <>
          {visibleAvatars.map((user, index) => renderUserAvatar(user, index))}
          {showMoreText && length ? renderAvatarCount() : null}
        </>
      );
    }

    return users.map((user, index) => renderUserAvatar(user, index));
  };

  return <View style={styles.container}>{renderUserAvatars()}</View>;
};

UserAvatarGroup.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.string,
      userName: PropTypes.string,
    }),
  ).isRequired,
  size: PropTypes.number.isRequired,
  fontSize: PropTypes.number.isRequired,
  showMoreText: PropTypes.bool.isRequired,
  length: PropTypes.number.isRequired,
  moreText: PropTypes.string,
};

const createStyles = theme => {
  const { colors, borderRadius, fontWeight, spacing } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      marginRight: -spacing.micro,
    },
    bubbleBorder: {
      borderWidth: 1,
      borderRadius: borderRadius.larger,
      borderColor: colors.borderLight,
    },
    countContainer: {
      backgroundColor: colors.backgroundDark,
      paddingHorizontal: spacing.smaller,
      borderRadius: borderRadius.larger,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: -spacing.tiny,
    },
    countText: {
      color: colors.text,
      fontWeight: fontWeight.medium,
    },
  });
};

export default UserAvatarGroup;
