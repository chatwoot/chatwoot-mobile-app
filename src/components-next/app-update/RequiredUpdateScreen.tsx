import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { useLogout } from '@/hooks/useLogout';
import { WarningCircleIcon } from '@/svg-icons';
import { getStoreName, isolateBidi, openStorePage } from '@/utils/appUpdateUtils';
import { startPlayUpdate } from '../../../modules/app-update';
import { Spinner } from '../spinner';

import { AppUpdateIcon } from './AppUpdateIcon';

type RequiredUpdateScreenProps = {
  currentVersion: string;
  minVersion: string;
};

/**
 * Opens the update: Play's immediate flow when Play allows it, otherwise the store page.
 * Resolves once the store UI is showing (or the Play flow returns).
 */
const openUpdate = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    const result = await startPlayUpdate('immediate').catch(() => 'not_allowed' as const);
    if (result === 'accepted' || result === 'declined') return;
    if (result === 'failed') throw new Error('Play update flow failed');
  }
  await openStorePage();
};

/**
 * Blocking screen shown in place of the app when the server requires a newer app version.
 * It has no close action, and Android back is consumed.
 */
export const RequiredUpdateScreen = ({ currentVersion, minVersion }: RequiredUpdateScreenProps) => {
  const logout = useLogout();
  const [isOpening, setIsOpening] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const handleUpdate = useCallback(async () => {
    setHasError(false);
    setIsOpening(true);
    try {
      await openUpdate();
    } catch {
      setHasError(true);
    } finally {
      setIsOpening(false);
    }
  }, []);

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={tailwind.style('flex-1 px-4')}>
        <View style={tailwind.style('flex-1 items-center justify-center px-2 pb-12')}>
          <AppUpdateIcon size={72} />
          <Text
            accessibilityRole="header"
            style={tailwind.style(
              'mt-6 text-2xl leading-8 font-inter-semibold-20 text-gray-950 text-center',
            )}>
            {i18n.t('APP_UPDATE.REQUIRED.TITLE')}
          </Text>
          <Text
            style={tailwind.style(
              'mt-2 max-w-[320px] text-base leading-6 font-inter-normal-20 text-gray-900 text-center',
            )}>
            {i18n.t('APP_UPDATE.REQUIRED.BODY')}
          </Text>
          <View style={tailwind.style('mt-3 max-w-[320px] items-center gap-0.5')}>
            <Text
              style={tailwind.style('text-cxs leading-[18px] font-inter-normal-20 text-gray-900')}>
              {i18n.t('APP_UPDATE.REQUIRED.INSTALLED', {
                currentVersion: isolateBidi(currentVersion),
              })}
            </Text>
            <Text
              style={tailwind.style('text-cxs leading-[18px] font-inter-normal-20 text-gray-900')}>
              {i18n.t('APP_UPDATE.REQUIRED.MINIMUM', { minVersion: isolateBidi(minVersion) })}
            </Text>
          </View>
        </View>

        {hasError && (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            style={tailwind.style(
              'mb-4 flex-row items-start gap-2.5 rounded-xl bg-ruby-100 px-3.5 py-3',
            )}>
            <View style={tailwind.style('h-5 w-5')}>
              <WarningCircleIcon fill={tailwind.color('text-ruby-900')} />
            </View>
            <Text
              style={tailwind.style(
                'flex-1 text-sm leading-5 font-inter-medium-24 text-ruby-900 text-left',
              )}>
              {i18n.t('APP_UPDATE.REQUIRED.STORE_ERROR', { store: getStoreName() })}
            </Text>
          </View>
        )}

        <View style={tailwind.style('gap-1 pb-2')}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isOpening, disabled: isOpening }}
            disabled={isOpening}
            onPress={handleUpdate}
            style={({ pressed }) =>
              tailwind.style(
                'min-h-[44px] flex-row items-center justify-center gap-2.5 rounded-[13px] bg-blue-800 px-4 py-[11px]',
                pressed && 'opacity-95',
              )
            }>
            {isOpening && <Spinner size={18} stroke={tailwind.color('text-white')} />}
            <Text
              style={tailwind.style(
                'text-base leading-[22px] tracking-[0.16px] font-inter-medium-24 text-white text-center',
              )}>
              {isOpening
                ? i18n.t('APP_UPDATE.REQUIRED.OPENING')
                : i18n.t('APP_UPDATE.OPTIONAL.UPDATE')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isOpening }}
            disabled={isOpening}
            onPress={logout}
            style={tailwind.style('min-h-[44px] min-w-[88px] self-center justify-center px-3')}>
            <Text
              style={[
                tailwind.style(
                  'text-sm leading-5 font-inter-medium-24 text-center underline',
                  isOpening ? 'text-gray-600' : 'text-gray-900',
                ),
                { textDecorationColor: tailwind.color('text-gray-500') },
              ]}>
              {i18n.t('APP_UPDATE.REQUIRED.LOG_OUT')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
