import React, { useEffect, useState } from 'react';
import { Switch, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/hooks';

import { tailwind } from '@/theme';
import i18n from 'i18n';
import { selectNotificationSettings } from '@/store/settings/settingsSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { NOTIFICATION_PREFERENCE_TYPES } from '@/constants';
import { useIOSListText } from '@/utils';

const addOrRemoveItemFromArray = <T,>(array: T[], key: T): T[] => {
  const index = array.indexOf(key);
  if (index === -1) {
    return [...array, key];
  } else {
    return array.filter(item => item !== key);
  }
};

type NotificationPreferenceType = keyof typeof NOTIFICATION_PREFERENCE_TYPES;

// Label for a push notification type. Types the app doesn't know yet (the server can add
// new ones) get a readable label from their name instead of a missing-translation text,
// e.g. "push_bot_handoff" becomes "Bot handoff".
const preferenceLabel = (item: string) => {
  const key = NOTIFICATION_PREFERENCE_TYPES[item as NotificationPreferenceType];
  if (key) return i18n.t(`NOTIFICATION_PREFERENCE.${key}`);
  const words = item
    .replace(/^push_/, '')
    .replace(/_/g, ' ')
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const NotificationPreferences = () => {
  const {
    all_push_flags: allPushFlags,
    selected_email_flags: selectedEmailFlags,
    selected_push_flags,
  } = useAppSelector(selectNotificationSettings);

  const dispatch = useAppDispatch();

  const [selectedPushFlags, setPushFlags] = useState(selected_push_flags);

  // Re-seed local toggles when the fetched settings change (e.g. after an account switch),
  // since useState only captures the initial value.
  useEffect(() => {
    setPushFlags(selected_push_flags);
  }, [selected_push_flags]);

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
  const iosList = useIOSListText();

  // iOS Settings rows (iPhone Duo layout): 17pt label, 44pt minimum height, 16pt margins,
  // inset dividers and a full-size native switch.
  if (iosList) {
    return (
      <Animated.View>
        {typedPushFlags.map((item: NotificationPreferenceType, index) => (
          <Animated.View key={item} style={tailwind.style('flex-row items-center pl-4')}>
            <Animated.View
              style={tailwind.style(
                'flex-1 flex-row items-center justify-between min-h-[44px] py-[11px] pr-4 gap-3',
                index < typedPushFlags.length - 1 ? 'border-b-[1px] border-b-blackA-A3' : '',
              )}>
              <Animated.Text
                style={tailwind.style(
                  'flex-1 text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
                )}>
                {preferenceLabel(item)}
              </Animated.Text>
              {/* Native iOS switch tinted with the app's blue, scaled to 80% (iOS has one
                  size, and it's large next to these labels). The negative margin keeps it
                  aligned to the row's right edge after scaling. */}
              <Switch
                style={styles.compactSwitch}
                trackColor={{ true: tailwind.color('bg-blue-800') as string }}
                onValueChange={() => onPushItemChange(item)}
                value={selectedPushFlags.includes(item)}
              />
            </Animated.View>
          </Animated.View>
        ))}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={tailwind.style('py-4 px-3')}>
      {typedPushFlags.map((item: NotificationPreferenceType) => (
        <Animated.View
          key={item}
          style={tailwind.style('flex flex-row items-center justify-between ml-2 mt-2')}>
          <Animated.Text
            style={tailwind.style('flex-1 leading-[17px] tracking-[0.24px] text-gray-950')}>
            {preferenceLabel(item)}
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
  compactSwitch: {
    transform: [{ scale: 0.8 }],
    marginRight: -6,
    marginVertical: -3,
  },
});
