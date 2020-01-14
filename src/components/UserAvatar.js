import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-ui-kitten';
import PropTypes from 'prop-types';

import CustomText from './Text';
import { getUserInitial, getRandomColor } from '../helpers';
import { theme } from '../theme';

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
  },
  userThumbNail: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: theme['color-primary'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: theme['color-white'],
    fontWeight: theme['font-medium'],
    fontSize: theme['text-primary-size'],
  },
});

const propTypes = {
  thumbnail: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.string,
};

const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 'large',
};

const UserAvatar = ({ thumbnail, userName, size }) =>
  thumbnail ? (
    <Avatar
      source={{
        uri: thumbnail,
      }}
      size={size}
      style={styles.avatar}
    />
  ) : (
    <View style={[styles.userThumbNail, { backgroundColor: getRandomColor() }]}>
      <CustomText style={styles.userName}>
        {getUserInitial({ userName })}
      </CustomText>
    </View>
  );

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;

export default UserAvatar;
