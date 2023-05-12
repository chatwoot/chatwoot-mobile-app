/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';

import i18n from 'i18n';
import createStyles from './NotificationPreference.style';
import { Text } from 'components';
import NotificationPreferenceItem from '../../components/NotificationPreferenceItem';
import { NOTIFICATION_PREFERENCE_TYPES } from '../../constants';
import { addOrRemoveItemFromArray } from '../../helpers';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { PROFILE_EVENTS } from 'constants/analyticsEvents';
import {
  actions as settingsActions,
  selectNotificationSettings,
  selectIsUpdating,
} from 'reducer/settingsSlice';

const NotificationPreferenceScreenComponent = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isUpdating = useSelector(selectIsUpdating);

  const {
    all_email_flags: emailFlags,
    all_push_flags: pushFlags,
    selected_email_flags,
    selected_push_flags,
  } = useSelector(selectNotificationSettings);
  const [selectedEmailFlags, setEmailFlags] = useState(selected_email_flags);
  const [selectedPushFlags, setPushFlags] = useState(selected_push_flags);

  const dispatch = useDispatch();

  const onEmailItemChange = ({ item }) => {
    setEmailFlags(addOrRemoveItemFromArray([...selectedEmailFlags], item));
  };

  const onPushItemChange = ({ item }) => {
    setPushFlags(addOrRemoveItemFromArray([...selectedPushFlags], item));
  };

  const goBack = () => {
    navigation.goBack();
  };

  const savePreferences = () => {
    AnalyticsHelper.track(PROFILE_EVENTS.CHANGE_PREFERENCES);
    dispatch(
      settingsActions.updateNotificationSettings({
        notification_settings: {
          selected_email_flags: selectedEmailFlags,
          selected_push_flags: selectedPushFlags,
        },
      }),
    );
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        title={i18n.t('NOTIFICATION_PREFERENCE.TITLE')}
        showLeftButton
        onBackPress={goBack}
      />
      <View style={styles.itemMainView}>
        <Text md semiBold color={colors.textDark}>
          {i18n.t('NOTIFICATION_PREFERENCE.EMAIL')}
        </Text>
        {emailFlags.map(
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
        <Text md semiBold color={colors.textDark}>
          {i18n.t('NOTIFICATION_PREFERENCE.PUSH')}
        </Text>
        {pushFlags.map(
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
      <View style={styles.notificationButtonView}>
        <LoaderButton
          style={styles.notificationButton}
          loading={isUpdating}
          size="large"
          onPress={savePreferences}
          text={i18n.t('SETTINGS.SUBMIT')}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationPreferenceScreenComponent;
