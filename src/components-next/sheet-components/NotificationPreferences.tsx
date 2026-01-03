import React, { useState, useEffect } from 'react';
import { Switch, StyleSheet, Platform, Linking, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/hooks';

import { tailwind } from '@/theme';
import i18n from 'i18n';
import { selectNotificationSettings, selectPushToken } from '@/store/settings/settingsSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { NOTIFICATION_PREFERENCE_TYPES } from '@/constants';
import { showToast } from '@/utils/toastUtils';

const addOrRemoveItemFromArray = <T,>(array: T[], key: T): T[] => {
  const index = array.indexOf(key);
  if (index === -1) {
    return [...array, key];
  } else {
    return array.filter(item => item !== key);
  }
};

type NotificationPreferenceType = keyof typeof NOTIFICATION_PREFERENCE_TYPES;

export const NotificationPreferences = () => {
  const {
    all_push_flags: allPushFlags,
    selected_email_flags: selectedEmailFlags,
    selected_push_flags,
  } = useAppSelector(selectNotificationSettings);

  const dispatch = useAppDispatch();
  const pushToken = useAppSelector(selectPushToken);

  const [selectedPushFlags, setPushFlags] = useState(selected_push_flags);
  const [isPushEnabled, setIsPushEnabled] = useState(!!pushToken);
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    setIsPushEnabled(!!pushToken);
  }, [pushToken]);

  const handleEnablePushNotifications = async () => {
    if (isEnabling) return;
    
    setIsEnabling(true);
    try {
      // Dispatch the action to save device details (this requests permission and gets token)
      const result = await dispatch(settingsActions.saveDeviceDetails());
      
      if (settingsActions.saveDeviceDetails.fulfilled.match(result)) {
        setIsPushEnabled(true);
        showToast({ message: i18n.t('SETTINGS.PUSH_NOTIFICATIONS_ENABLED') });
      } else {
        // Permission denied or Firebase not available
        setIsPushEnabled(false);
        Alert.alert(
          i18n.t('SETTINGS.PUSH_NOTIFICATIONS'),
          i18n.t('SETTINGS.PUSH_NOTIFICATIONS_PERMISSION_DENIED'),
          [
            { text: i18n.t('SETTINGS.CANCEL'), style: 'cancel' },
            {
              text: i18n.t('SETTINGS.OPEN_SETTINGS'),
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      setIsPushEnabled(false);
      showToast({ message: i18n.t('SETTINGS.PUSH_NOTIFICATIONS_ERROR') });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisablePushNotifications = async () => {
    try {
      if (pushToken) {
        await dispatch(settingsActions.removeDevice({ pushToken }));
      }
      setIsPushEnabled(false);
      showToast({ message: i18n.t('SETTINGS.PUSH_NOTIFICATIONS_DISABLED') });
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  };

  const togglePushNotifications = async (value: boolean) => {
    if (value) {
      await handleEnablePushNotifications();
    } else {
      await handleDisablePushNotifications();
    }
  };

  const onPushItemChange = (item: string) => {
    const pushFlags = addOrRemoveItemFromArray([...selectedPushFlags], item);
    setPushFlags(pushFlags);
    savePreferences({
      emailFlags: selectedEmailFlags,
      pushFlags: pushFlags,
    });
  };

  const savePreferences = ({
    emailFlags,
    pushFlags,
  }: {
    emailFlags: string[];
    pushFlags: string[];
  }) => {
    dispatch(
      settingsActions.updateNotificationSettings({
        notification_settings: {
          selected_email_flags: emailFlags,
          selected_push_flags: pushFlags,
        },
      }),
    );
  };

  const typedPushFlags = allPushFlags as NotificationPreferenceType[];

  return (
    <Animated.View style={tailwind.style('py-4 px-3')}>
      {/* Master Push Notification Toggle */}
      <Animated.View
        style={tailwind.style('flex flex-row items-center justify-between ml-2 mb-4 pb-4 border-b border-gray-200')}>
        <Animated.View style={tailwind.style('flex-1')}>
          <Animated.Text
            style={tailwind.style('text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950')}>
            {i18n.t('SETTINGS.PUSH_NOTIFICATIONS')}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style('text-sm leading-[15px] tracking-[0.24px] text-gray-600 mt-1')}>
            {isPushEnabled
              ? i18n.t('SETTINGS.PUSH_NOTIFICATIONS_ON')
              : i18n.t('SETTINGS.PUSH_NOTIFICATIONS_OFF')}
          </Animated.Text>
        </Animated.View>
        <Switch
          trackColor={{ false: '#C9D7E3', true: '#1F93FF' }}
          thumbColor="#FFFFFF"
          style={styles.switch}
          ios_backgroundColor="#C9D7E3"
          onValueChange={togglePushNotifications}
          value={isPushEnabled}
          disabled={isEnabling}
        />
      </Animated.View>

      {/* Individual notification preferences (only show if push is enabled) */}
      {isPushEnabled && typedPushFlags.map((item: NotificationPreferenceType) => (
        <Animated.View
          key={item}
          style={tailwind.style('flex flex-row items-center justify-between ml-2 mt-2')}>
          <Animated.Text
            style={tailwind.style('flex-1 leading-[17px] tracking-[0.24px] text-gray-950')}>
            {i18n.t(`NOTIFICATION_PREFERENCE.${NOTIFICATION_PREFERENCE_TYPES[item]}`)}
          </Animated.Text>
          <Switch
            trackColor={{ false: '#C9D7E3', true: '#1F93FF' }}
            thumbColor="#FFFFFF"
            style={styles.switch}
            ios_backgroundColor="#C9D7E3"
            onValueChange={() => onPushItemChange(item)}
            value={selectedPushFlags.includes(item)}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scale: 0.6 }],
  },
});
