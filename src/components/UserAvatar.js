import React from 'react';
import { View } from 'react-native';
import { Avatar, useStyleSheet, StyleService } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { getRandomColor, getUserInitial } from '../helpers';

import CustomText from './Text';

// By using UI Kitten StyleService + useStyleSheet,
// we may accept theme variables without a need to refer a theme
// This also gives you ability to support multi-theming.
const themedStyles = StyleService.create({
  avatar: {
    alignSelf: 'center',
  },
  userThumbNail: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: 'color-primary-default',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: 'text-control-color',
    fontWeight: 'font-bold',
    fontSize: 'font-size-medium',
  },
});

const propTypes = {
  thumbnail: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.string,
  defaultBGColor: PropTypes.string,
};

const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 'large',
  // TODO: Remove comments after reviewing this.
  // Makes it redundant to have an additional variable in theme
  // defaultBGColor: theme['color-primary'],
};

const UserAvatar = ({ thumbnail, userName, size, defaultBGColor }) => {
  const styles = useStyleSheet(themedStyles);
  const thumbBackgroundColor =
    defaultBGColor || styles.userThumbNail.backgroundColor;

  return thumbnail ? (
    <Avatar
      source={{
        uri: thumbnail,
      }}
      size={size}
      style={styles.avatar}
    />
  ) : (
    <View
      style={[
        styles.userThumbNail,
        {
          backgroundColor: thumbBackgroundColor || getRandomColor({ userName }),
        },
      ]}>
      <CustomText style={styles.userName}>
        {getUserInitial({ userName })}
      </CustomText>
    </View>
  );
};

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;

export default UserAvatar;
