import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';
import { Text } from 'components';
import { getUserInitial } from 'helpers';

import { PRESENCE_STATUS_COLORS } from 'constants';
import { GRAVATAR_URL } from 'constants/url';
import { getInboxBadgeImages } from 'helpers/inboxHelpers';

const createStyles = theme => {
  const { colors } = theme;
  return StyleSheet.create({
    userThumbNail: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageLoader: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.7,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeWrapper: {
      position: 'absolute',
      alignSelf: 'flex-end',
    },
    badge: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
    activeCircle: {
      borderColor: 'white',
      borderWidth: 2,
    },
  });
};

const findAvatarUrl = ({ thumbnail }) => {
  return thumbnail && !thumbnail.includes(GRAVATAR_URL) ? thumbnail : '';
};
const Badge = ({ source, size, badgeStyle, activeBadgeColor, activeCircle }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return source ? (
    <View
      style={[
        styles.badgeWrapper,
        {
          width: size / 3.1,
          height: size / 3.1,
          borderRadius: size / 4,
          bottom: size / 32,
          right: size / 32,
          backgroundColor: colors.colorWhite,
        },
      ]}>
      <FastImage
        style={[
          badgeStyle,
          {
            width: size / 4,
            height: size / 4,
            borderRadius: size / 4,
            bottom: size / 32,
            right: size / 32,
          },
        ]}
        source={source}
      />
    </View>
  ) : (
    <View
      testID="userAvatarBadge"
      style={[
        badgeStyle,
        activeCircle,
        {
          width: size / 4,
          height: size / 4,
          borderRadius: size / 4,
          bottom: size / 32,
          right: size / 32,
          backgroundColor: activeBadgeColor,
        },
      ]}
    />
  );
};

const UserAvatar = ({
  thumbnail,
  userName,
  size,
  fontSize,
  defaultBGColor,
  channel,
  chatAdditionalInfo,
  inboxInfo,
  availabilityStatus,
}) => {
  const avatarUrl = findAvatarUrl({ thumbnail });
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return avatarUrl ? (
    <View testID="userAvatar">
      <FastImage
        testID="userImage"
        source={{
          uri: avatarUrl,
        }}
        style={
          ([styles.image],
          {
            width: size,
            height: size,
            borderRadius: size,
          })
        }
      />

      {(PRESENCE_STATUS_COLORS[availabilityStatus] ||
        getInboxBadgeImages(inboxInfo, chatAdditionalInfo)) && (
        <Badge
          source={
            getInboxBadgeImages(inboxInfo, chatAdditionalInfo)
              ? getInboxBadgeImages(inboxInfo, chatAdditionalInfo)
              : null
          }
          size={size}
          badgeStyle={styles.badge}
          activeBadgeColor={PRESENCE_STATUS_COLORS[availabilityStatus]}
          activeCircle={styles.activeCircle}
        />
      )}
    </View>
  ) : (
    <View testID="userAvatar">
      <LinearGradient
        colors={['#D6EBFF', '#C2E1FF']}
        style={[
          styles.userThumbNail,
          {
            width: size,
            height: size,
            borderRadius: size,
          },
        ]}>
        <Text bold color={colors.primaryColor} style={{ fontSize: fontSize }}>
          {getUserInitial({ userName })}
        </Text>
      </LinearGradient>
      {(PRESENCE_STATUS_COLORS[availabilityStatus] ||
        getInboxBadgeImages(inboxInfo, chatAdditionalInfo)) && (
        <Badge
          source={
            getInboxBadgeImages(inboxInfo, chatAdditionalInfo)
              ? getInboxBadgeImages(inboxInfo, chatAdditionalInfo)
              : null
          }
          size={size}
          badgeStyle={styles.badge}
          activeBadgeColor={PRESENCE_STATUS_COLORS[availabilityStatus]}
          activeCircle={styles.activeCircle}
        />
      )}
    </View>
  );
};

const propTypes = {
  thumbnail: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.number,
  fontSize: PropTypes.number,
  defaultBGColor: PropTypes.string,
  channel: PropTypes.string,
  inboxInfo: PropTypes.object,
  chatAdditionalInfo: PropTypes.object,
  availabilityStatus: PropTypes.string,
};
const badgePropTypes = {
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.number,
  badgeStyle: PropTypes.object,
  activeBadgeColor: PropTypes.string,
  activeCircle: PropTypes.object,
};
const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 48,
  fontSize: 16,
};

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;
Badge.propTypes = badgePropTypes;

export default UserAvatar;
