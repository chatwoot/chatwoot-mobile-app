import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import i18n from 'i18n';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text } from 'components';

import { NOTIFICATION_PREFERENCE_TYPES } from 'constants';
import { addOrRemoveItemFromArray } from 'helpers';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { PROFILE_EVENTS } from 'constants/analyticsEvents';
import { actions as settingsActions, selectNotificationSettings } from 'reducer/settingsSlice';

import NotificationPreferenceItem from './NotificationPreferenceItem';

const propTypes = {
  colors: PropTypes.object,
  activeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPress: PropTypes.func,
};

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    bottomSheet: {
      flex: 1,
      paddingHorizontal: spacing.small,
      paddingBottom: spacing.small,
    },
    itemMainViewItem: {
      marginBottom: spacing.smaller,
    },
    itemMainView: {
      borderBottomWidth: 0.6,
      borderBottomColor: colors.borderLight,
      marginTop: spacing.small,
      paddingBottom: spacing.smaller,
    },
  });
};

const NotificationPreferenceSelector = ({ activeValue, onPress, colors }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    all_email_flags: allEmailFlags,
    all_push_flags: allPushFlags,
    selected_email_flags,
    selected_push_flags,
  } = useSelector(selectNotificationSettings);

  const [selectedEmailFlags, setEmailFlags] = useState(selected_email_flags);
  const [selectedPushFlags, setPushFlags] = useState(selected_push_flags);
  const dispatch = useDispatch();

  const onEmailItemChange = ({ item }) => {
    const emailFlags = addOrRemoveItemFromArray([...selectedEmailFlags], item);
    setEmailFlags(emailFlags);
    savePreferences({
      emailFlags,
      pushFlags: selectedPushFlags,
    });
  };

  const onPushItemChange = ({ item }) => {
    const pushFlags = addOrRemoveItemFromArray([...selectedPushFlags], item);
    setPushFlags(pushFlags);
    savePreferences({
      emailFlags: selectedEmailFlags,
      pushFlags: pushFlags,
    });
  };

  const savePreferences = ({ emailFlags, pushFlags }) => {
    AnalyticsHelper.track(PROFILE_EVENTS.CHANGE_PREFERENCES);
    dispatch(
      settingsActions.updateNotificationSettings({
        notification_settings: {
          selected_email_flags: emailFlags,
          selected_push_flags: pushFlags,
        },
      }),
    );
  };

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.itemMainView}>
        <Text semiBold color={colors.textDark} style={styles.itemMainViewItem}>
          {i18n.t('NOTIFICATION_PREFERENCE.EMAIL')}
        </Text>
        {allEmailFlags.map(
          item =>
            NOTIFICATION_PREFERENCE_TYPES[item] && (
              <NotificationPreferenceItem
                key={item}
                item={item}
                title={i18n.t(`NOTIFICATION_PREFERENCE.${NOTIFICATION_PREFERENCE_TYPES[item]}`)}
                isChecked={selectedEmailFlags.includes(item) ? true : false}
                onCheckedChange={onEmailItemChange}
              />
            ),
        )}
      </View>
      <View style={styles.itemMainView}>
        <Text semiBold color={colors.textDark} style={styles.itemMainViewItem}>
          {i18n.t('NOTIFICATION_PREFERENCE.PUSH')}
        </Text>
        {allPushFlags.map(
          item =>
            NOTIFICATION_PREFERENCE_TYPES[item] && (
              <NotificationPreferenceItem
                key={item}
                item={item}
                title={i18n.t(`NOTIFICATION_PREFERENCE.${NOTIFICATION_PREFERENCE_TYPES[item]}`)}
                isChecked={selectedPushFlags.includes(item) ? true : false}
                onCheckedChange={onPushItemChange}
              />
            ),
        )}
      </View>
    </View>
  );
};

NotificationPreferenceSelector.propTypes = propTypes;
export default NotificationPreferenceSelector;
