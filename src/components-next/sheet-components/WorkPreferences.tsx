import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components-next/common/icon';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { authActions } from '@/store/auth/authActions';
import {
  selectCurrentUserAccountId,
  selectCurrentUserWorkPreferences,
} from '@/store/auth/authSelectors';
import { setCurrentUserWorkPreferences } from '@/store/auth/authSlice';
import { PauseCircleIcon, TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { WorkPreferences as Preferences } from '@/types/common/AvailabilityStatus';
import i18n from 'i18n';

const PREFERENCES = [
  {
    key: 'accepts_conversations',
    label: 'SETTINGS.RECEIVE_CONVERSATIONS',
    info: 'SETTINGS.RECEIVE_CONVERSATIONS_INFO',
  },
  {
    key: 'accepts_calls',
    label: 'SETTINGS.RECEIVE_VOICE_CALLS',
    info: 'SETTINGS.RECEIVE_VOICE_CALLS_INFO',
  },
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
      <Animated.View
        style={tailwind.style(
          'flex-row items-start gap-2 mx-3 mt-2 mb-4 px-3 py-2.5 rounded-xl bg-amber-100',
        )}>
        <Animated.View style={tailwind.style('mt-px')}>
          <Icon icon={<PauseCircleIcon />} size={16} />
        </Animated.View>
        <Animated.Text
          style={tailwind.style(
            'flex-1 text-sm leading-[18px] tracking-[0.16px] font-inter-420-20 text-amber-900',
          )}>
          {i18n.t('SETTINGS.WORK_PAUSED')}
        </Animated.Text>
      </Animated.View>
    );
  }

  const enabledCount = PREFERENCES.filter(({ key }) => preferences[key]).length;

  return (
    <Animated.View style={tailwind.style('mx-3 mt-1 mb-4 pt-1 border-t-[1px] border-blackA-A3')}>
      {PREFERENCES.map(({ key, label, info }) => {
        const value = preferences[key];
        const isLocked = value && enabledCount === 1;
        return (
          <Pressable
            key={key}
            disabled={isLocked}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: value, disabled: isLocked }}
            onPress={() => updatePreference(key, !value)}
            style={tailwind.style('flex-row items-start gap-3 ml-1 pt-3')}>
            <Animated.View
              style={tailwind.style(
                'mt-0.5 h-[18px] w-[18px] items-center justify-center rounded-[4px] border-[1.5px]',
                value ? 'bg-blue-800 border-blue-800' : 'border-gray-500',
                isLocked && 'bg-gray-500 border-gray-500',
              )}>
              {value && <Icon icon={<TickIcon stroke="#FFFFFF" />} size={14} />}
            </Animated.View>
            <Animated.View style={tailwind.style('flex-1')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base leading-[21px] tracking-[0.16px] font-inter-420-20',
                  isLocked ? 'text-gray-700' : 'text-gray-950',
                )}>
                {i18n.t(label)}
              </Animated.Text>
              <Animated.Text
                style={tailwind.style('text-sm leading-[18px] tracking-[0.16px] text-gray-700')}>
                {i18n.t(info)}
              </Animated.Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </Animated.View>
  );
};
