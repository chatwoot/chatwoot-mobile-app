import React from 'react';
import { StyleSheet, Switch } from 'react-native';
import Animated from 'react-native-reanimated';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { authActions } from '@/store/auth/authActions';
import {
  selectCurrentUserAccountId,
  selectCurrentUserWorkPreferences,
} from '@/store/auth/authSelectors';
import { setCurrentUserWorkPreferences } from '@/store/auth/authSlice';
import { tailwind } from '@/theme';
import type { WorkPreferences as Preferences } from '@/types/common/AvailabilityStatus';
import i18n from 'i18n';

const PREFERENCES = [
  { key: 'accepts_conversations', label: 'SETTINGS.RECEIVE_CONVERSATIONS' },
  { key: 'accepts_calls', label: 'SETTINGS.RECEIVE_VOICE_CALLS' },
] as const;

export const WorkPreferences = ({ isOnline }: { isOnline: boolean }) => {
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectCurrentUserAccountId);
  const preferences = useAppSelector(selectCurrentUserWorkPreferences);

  const updatePreference = async (key: keyof Preferences, value: boolean) => {
    if (!accountId) return;
    const updated = { ...preferences, [key]: value };
    dispatch(setCurrentUserWorkPreferences(updated));
    const result = await dispatch(
      authActions.updateWorkPreferences({ profile: { account_id: accountId, ...updated } }),
    );
    if (authActions.updateWorkPreferences.rejected.match(result)) {
      dispatch(setCurrentUserWorkPreferences(preferences));
    }
  };

  if (!isOnline) {
    return (
      <Animated.Text
        style={tailwind.style(
          'mx-3 mt-1 mb-4 pt-3 pl-1 border-t-[1px] border-blackA-A3 text-sm leading-[18px] text-gray-700',
        )}>
        {i18n.t('SETTINGS.WORK_PAUSED')}
      </Animated.Text>
    );
  }

  const enabledCount = PREFERENCES.filter(({ key }) => preferences[key]).length;

  return (
    <Animated.View style={tailwind.style('mx-3 mt-1 mb-4 pt-1 border-t-[1px] border-blackA-A3')}>
      {PREFERENCES.map(({ key, label }) => {
        const value = preferences[key];
        const isLastEnabled = value && enabledCount === 1;
        return (
          <Animated.View
            key={key}
            style={tailwind.style('flex flex-row items-center justify-between ml-1 mt-2')}>
            <Animated.Text
              style={tailwind.style(
                'flex-1 text-base leading-[21px] tracking-[0.16px] font-inter-420-20 text-gray-950',
                isLastEnabled && 'text-gray-700',
              )}>
              {i18n.t(label)}
            </Animated.Text>
            <Switch
              trackColor={{ false: '#C9D7E3', true: '#1F93FF' }}
              thumbColor="#FFFFFF"
              style={styles.switch}
              ios_backgroundColor="#C9D7E3"
              disabled={isLastEnabled}
              onValueChange={updated => updatePreference(key, updated)}
              value={value}
            />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scale: 0.6 }],
  },
});
