/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';

import i18n from '../../i18n';
import styles from './NotificationPreference.style';
import NotificationPreferenceItem from '../../components/NotificationPreferenceItem';
import { captureEvent } from 'helpers/Analytics';
import { NOTIFICATION_PREFERENCE_TYPES } from '../../constants';
import CustomText from '../../components/Text';
import { updateNotificationSettings } from '../../actions/settings';
import { addOrRemoveItemFromArray } from '../../helpers';

const NotificationPreferenceScreenComponent = ({ eva: { style }, navigation }) => {
  const {
    notificationSettings: {
      all_email_flags: emailFlags,
      all_push_flags: pushFlags,
      selected_email_flags,
      selected_push_flags,
    },
    isUpdating,
  } = useSelector(state => state.settings);
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
    captureEvent({ eventName: 'Updated notification preferences' });
    dispatch(
      updateNotificationSettings({
        notification_settings: {
          selected_email_flags: selectedEmailFlags,
          selected_push_flags: selectedPushFlags,
        },
      }),
    );
    navigation.goBack();
  };
  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('NOTIFICATION_PREFERENCE.TITLE')}
        showLeftButton
        onBackPress={goBack}
      />
      <View style={style.itemMainView}>
        <CustomText style={style.itemHeaderTitle}>
          {i18n.t('NOTIFICATION_PREFERENCE.EMAIL')}
        </CustomText>
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
      <View style={style.itemMainView}>
        <CustomText style={style.itemHeaderTitle}>
          {i18n.t('NOTIFICATION_PREFERENCE.PUSH')}
        </CustomText>
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
      <View style={style.notificationButtonView}>
        <LoaderButton
          style={style.notificationButton}
          loading={isUpdating}
          size="large"
          textStyle={style.notificationButtonText}
          onPress={savePreferences}
          text={i18n.t('SETTINGS.SUBMIT')}
        />
      </View>
    </SafeAreaView>
  );
};

const NotificationPreferenceScreen = withStyles(NotificationPreferenceScreenComponent, styles);
export default NotificationPreferenceScreen;
