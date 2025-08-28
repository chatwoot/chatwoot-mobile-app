import React, { useState } from 'react';
import { Switch, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/hooks';

import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';
import i18n from 'i18n';
import { selectNotificationSettings } from '@/store/settings/settingsSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { NOTIFICATION_PREFERENCE_TYPES } from '@/constants';

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
  const themedTailwind = useThemedStyles();
  const {
    all_push_flags: allPushFlags,
    selected_email_flags: selectedEmailFlags,
    selected_push_flags,
  } = useAppSelector(selectNotificationSettings);

  const dispatch = useAppDispatch();

  const [selectedPushFlags, setPushFlags] = useState(selected_push_flags);

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
      {typedPushFlags.map((item: NotificationPreferenceType) => (
        <Animated.View
          key={item}
          style={tailwind.style('flex flex-row items-center justify-between ml-2 mt-2')}
        >
          <Animated.Text
            style={themedTailwind.style('flex-1 leading-[17px] tracking-[0.24px] text-gray-950')}
          >
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
