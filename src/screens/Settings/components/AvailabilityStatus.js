import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { PROFILE_EVENTS } from 'constants/analyticsEvents';
import { actions as authActions } from 'reducer/authSlice';

import { selectCurrentUserAvailability } from 'reducer/authSlice';

const propTypes = {
  status: PropTypes.string,
};

const defaultProps = {
  status: '',
};

const createStyles = theme => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    statusView: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      paddingVertical: spacing.small,
    },
    statusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.small,
      paddingVertical: spacing.micro,
      paddingHorizontal: spacing.smaller,
      borderRadius: borderRadius.small,
      borderColor: colors.borderLight,
      borderWidth: 0.2,
    },
    statusText: {
      marginLeft: spacing.micro,
    },
  });
};

const AvailabilityStatus = ({ status }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  const availability_status = useSelector(selectCurrentUserAvailability) || 'offline';

  const availabilityStatusList = [
    {
      status: 'Online',
      key: 'online',
      color: colors.successColor,
    },
    {
      status: 'Busy',
      key: 'busy',
      color: colors.warningColor,
    },
    {
      status: 'Offline',
      key: 'offline',
      color: colors.secondaryColor,
    },
  ];

  const changeUserAvailabilityStatus = item => {
    AnalyticsHelper.track(PROFILE_EVENTS.TOGGLE_AVAILABILITY_STATUS, {
      from: availability_status,
      to: item,
    });
    dispatch(authActions.updateAvailability({ availability: item }));
  };

  return (
    <View style={styles.statusView}>
      {availabilityStatusList.map((item, index) => (
        <Pressable
          style={[
            {
              backgroundColor:
                status === item.key ? colors.primaryColorLight : colors.backgroundLight,
            },
            styles.statusButton,
          ]}
          key={item.status}
          onPress={() => {
            changeUserAvailabilityStatus(item.key);
          }}>
          <View>
            <Icon icon="circle-filled" color={item.color} size={14} />
          </View>
          <Text medium sm color={colors.textDark} style={styles.statusText}>
            {item.status}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

AvailabilityStatus.propTypes = propTypes;
AvailabilityStatus.defaultProps = defaultProps;
export default AvailabilityStatus;
