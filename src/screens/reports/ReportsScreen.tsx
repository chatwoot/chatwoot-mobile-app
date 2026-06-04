import React from 'react';
import { Pressable, ScrollView, StatusBar, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components-next';
import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import type { MoreStackParamList } from '@/navigation/stack/MoreStack';
import { selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import { CaretRight, ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';

const REPORT_CATEGORIES = [
  { key: 'OVERVIEW', path: 'overview' },
  { key: 'CONVERSATIONS', path: 'conversation' },
  { key: 'AGENTS', path: 'agent' },
  { key: 'LABELS', path: 'label' },
  { key: 'INBOX', path: 'inboxes' },
  { key: 'TEAM', path: 'teams' },
  { key: 'CSAT', path: 'csat' },
  { key: 'SLA', path: 'sla' },
  { key: 'BOT', path: 'bot' },
] as const;

type ReportCategory = (typeof REPORT_CATEGORIES)[number];

const normalizeInstallationUrl = (installationUrl: string) =>
  installationUrl.endsWith('/') ? installationUrl : `${installationUrl}/`;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp<MoreStackParamList>>();
  const installationUrl = useAppSelector(selectInstallationUrl);
  const accountId = useAppSelector(selectCurrentUserAccountId);

  const openReport = (category: ReportCategory) => {
    if (!accountId) {
      return;
    }

    const title = i18n.t(`REPORTS.CATEGORIES.${category.key}`);
    const url = `${normalizeInstallationUrl(installationUrl)}app/accounts/${accountId}/reports/${
      category.path
    }`;

    navigation.navigate('ReportWebViewScreen', { title, url });
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(StackActions.replace('MoreScreen'));
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View style={tailwind.style('px-4 pt-2 pb-[12px]')}>
        <View style={tailwind.style('flex-row items-center')}>
          <Pressable
            accessibilityRole="button"
            hitSlop={16}
            onPress={goBack}
            style={tailwind.style('w-12 items-start')}>
            <Icon icon={<ChevronLeft stroke={tailwind.color('text-gray-700')} />} size={26} />
          </Pressable>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-1 min-w-0 px-3 text-center text-[17px] font-inter-medium-24 leading-[21px] tracking-[0.32px] text-gray-950',
            )}>
            {i18n.t('REPORTS.TITLE')}
          </Animated.Text>
          <View style={tailwind.style('w-12')} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style('px-4 pb-28')}>
        <View style={tailwind.style('overflow-hidden rounded-[13px] border border-blackA-A3')}>
          {REPORT_CATEGORIES.map((category, index) => (
            <Pressable
              key={category.key}
              accessibilityRole="button"
              onPress={() => openReport(category)}
              style={({ pressed }) =>
                tailwind.style(
                  'h-[56px] flex-row items-center justify-between px-4',
                  index !== REPORT_CATEGORIES.length - 1 ? 'border-b border-blackA-A3' : '',
                  pressed ? 'bg-gray-50' : 'bg-white',
                )
              }>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-medium-24 leading-[21px] text-gray-950',
                )}>
                {i18n.t(`REPORTS.CATEGORIES.${category.key}`)}
              </Animated.Text>
              <Icon icon={<CaretRight />} size={20} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;
