import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components-next/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { inboxActions } from '@/store/inbox/inboxActions';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { selectUserId } from '@/store/auth/authSelectors';
import { VoiceAlertPreferenceService } from '@/services/voice/voiceAlertPreferenceService';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Inbox } from '@/types/Inbox';
import { getChannelIcon } from '@/utils/getChannelIcon';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { showToast } from '@/utils/toastUtils';

type VoicePreferenceMap = Record<number, boolean>;

const sortInboxesByName = (inboxes: Inbox[]) =>
  [...inboxes].sort((current, next) =>
    current.name.localeCompare(next.name, undefined, { sensitivity: 'base' }),
  );

const VoiceAlertRow = ({
  inbox,
  enabled,
  isSaving,
  onToggle,
}: {
  inbox: Inbox;
  enabled: boolean;
  isSaving: boolean;
  onToggle: (inbox: Inbox, enabled: boolean) => void;
}) => {
  const subtitle = inbox.phoneNumber || inbox.provider || inbox.channelType;
  const icon = getChannelIcon(
    inbox.channelType,
    inbox.medium,
    inbox.additionalAttributes?.type,
    inbox.name,
  );

  return (
    <View style={tailwind.style('flex-row items-center border-b border-blackA-A3 px-4 py-3')}>
      <View style={tailwind.style('h-10 w-10 items-center justify-center rounded-full bg-gray-50')}>
        <Icon icon={icon} size={22} />
      </View>
      <View style={tailwind.style('ml-3 flex-1')}>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
          {inbox.name}
        </Animated.Text>
        {!!subtitle && (
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
            {subtitle}
          </Animated.Text>
        )}
      </View>
      {isSaving ? (
        <ActivityIndicator color={tailwind.color('text-blue-700')} />
      ) : (
        <Switch
          trackColor={{ false: '#C9D7E3', true: '#1F93FF' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#C9D7E3"
          style={styles.switch}
          value={enabled}
          onValueChange={nextValue => onToggle(inbox, nextValue)}
        />
      )}
    </View>
  );
};

const VoiceAlertSettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectUserId);
  const inboxes = useAppSelector(selectAllInboxes);
  const voiceInboxes = useMemo(
    () => sortInboxesByName(inboxes.filter(isVoiceCallEnabled)),
    [inboxes],
  );

  const [preferences, setPreferences] = useState<VoicePreferenceMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingInboxIds, setSavingInboxIds] = useState<number[]>([]);

  const fetchPreferences = useCallback(
    async ({ refresh = false } = {}) => {
      if (!currentUserId) {
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        if (!inboxes.length) {
          await dispatch(inboxActions.fetchInboxes());
        }

        const entries = await Promise.all(
          voiceInboxes.map(async inbox => {
            const agents = await VoiceAlertPreferenceService.getInboxMembers(inbox.id);
            const currentAgent = agents.find(agent => agent.id === currentUserId);
            return [
              inbox.id,
              VoiceAlertPreferenceService.getAgentVoiceAlertPreference(currentAgent),
            ] as const;
          }),
        );
        setPreferences(Object.fromEntries(entries));
      } catch {
        showToast({ message: i18n.t('SETTINGS.VOICE_ALERTS_LOAD_FAILED') });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUserId, dispatch, inboxes.length, voiceInboxes],
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const togglePreference = async (inbox: Inbox, enabled: boolean) => {
    if (!currentUserId) {
      return;
    }

    setPreferences(current => ({ ...current, [inbox.id]: enabled }));
    setSavingInboxIds(current => [...current, inbox.id]);

    try {
      const agents = await VoiceAlertPreferenceService.updateOwnPreference({
        inboxId: inbox.id,
        userId: currentUserId,
        enabled,
      });
      const currentAgent = agents.find(agent => agent.id === currentUserId);
      setPreferences(current => ({
        ...current,
        [inbox.id]: VoiceAlertPreferenceService.getAgentVoiceAlertPreference(currentAgent),
      }));
    } catch {
      setPreferences(current => ({ ...current, [inbox.id]: !enabled }));
      showToast({ message: i18n.t('SETTINGS.VOICE_ALERTS_SAVE_FAILED') });
    } finally {
      setSavingInboxIds(current => current.filter(id => id !== inbox.id));
    }
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('flex-row items-center px-2 pb-3 pt-2')}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={tailwind.style('h-11 w-11 items-center justify-center')}>
          <Icon icon={<ChevronLeft stroke={tailwind.color('text-gray-700')} />} size={26} />
        </Pressable>
        <Animated.Text
          style={tailwind.style(
            'flex-1 pr-11 text-center text-[17px] font-inter-medium-24 text-gray-950',
          )}>
          {i18n.t('SETTINGS.VOICE_ALERTS')}
        </Animated.Text>
      </View>
      <Animated.ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchPreferences({ refresh: true })}
            tintColor="#11181C"
          />
        }
        contentContainerStyle={tailwind.style('pb-28')}>
        <View style={tailwind.style('px-4 pb-3')}>
          <Animated.Text style={tailwind.style('text-sm font-inter-420-20 text-gray-700')}>
            {i18n.t('SETTINGS.VOICE_ALERTS_DESCRIPTION')}
          </Animated.Text>
        </View>
        <View style={tailwind.style('mx-4 overflow-hidden rounded-[13px] border border-blackA-A3')}>
          {isLoading ? (
            <View style={tailwind.style('items-center justify-center py-12')}>
              <ActivityIndicator color={tailwind.color('text-gray-950')} />
            </View>
          ) : voiceInboxes.length ? (
            voiceInboxes.map(inbox => (
              <VoiceAlertRow
                key={inbox.id}
                inbox={inbox}
                enabled={preferences[inbox.id] ?? true}
                isSaving={savingInboxIds.includes(inbox.id)}
                onToggle={togglePreference}
              />
            ))
          ) : (
            <View style={tailwind.style('px-4 py-12')}>
              <Animated.Text
                style={tailwind.style('text-center text-sm font-inter-420-20 text-gray-700')}>
                {i18n.t('SETTINGS.NO_VOICE_ALERT_INBOXES')}
              </Animated.Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scale: 0.75 }],
  },
});

export default VoiceAlertSettingsScreen;
