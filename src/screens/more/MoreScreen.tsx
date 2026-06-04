import React from 'react';
import { Pressable, StatusBar, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components-next/common';
import i18n from '@/i18n';
import { Bolt, Building2, CaretRight, ChartSpline } from '@/svg-icons';
import { tailwind } from '@/theme';

type MoreRowProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

const MoreRow = ({ icon, label, onPress }: MoreRowProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) =>
      tailwind.style(
        'h-[56px] flex-row items-center border-b border-blackA-A3 bg-white px-1',
        pressed ? 'bg-gray-50' : '',
      )
    }>
    <View style={tailwind.style('w-10 items-center')}>
      <Icon icon={icon} size={28} />
    </View>
    <Animated.Text
      style={tailwind.style(
        'flex-1 text-base font-inter-medium-24 leading-[21px] tracking-[0.16px] text-gray-950',
      )}>
      {label}
    </Animated.Text>
    <Icon icon={<CaretRight stroke={tailwind.color('text-gray-700')} />} size={20} />
  </Pressable>
);

const MoreScreen = () => {
  const navigation = useNavigation();

  const openCompanies = () => {
    navigation.dispatch(StackActions.push('CompaniesScreen'));
  };

  const openReports = () => {
    navigation.dispatch(StackActions.push('ReportsScreen'));
  };

  const openSettings = () => {
    navigation.dispatch(StackActions.push('SettingsScreen'));
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <Animated.View style={tailwind.style('flex-row items-center px-4 pt-2 pb-[12px]')}>
        <View style={tailwind.style('w-12')} />
        <Animated.View style={tailwind.style('flex-1 min-w-0 px-3')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-center text-[17px] font-inter-medium-24 leading-[21px] tracking-[0.32px] text-gray-950',
            )}>
            {i18n.t('MORE.TITLE')}
          </Animated.Text>
        </Animated.View>
        <View style={tailwind.style('w-12')} />
      </Animated.View>
      <Animated.View
        style={tailwind.style('mx-4 overflow-hidden rounded-[13px] border border-blackA-A3')}>
        <MoreRow icon={<Building2 />} label={i18n.t('MORE.COMPANIES')} onPress={openCompanies} />
        <MoreRow icon={<ChartSpline />} label={i18n.t('MORE.REPORTS')} onPress={openReports} />
        <MoreRow icon={<Bolt />} label={i18n.t('FOOTER.SETTINGS')} onPress={openSettings} />
      </Animated.View>
    </SafeAreaView>
  );
};

export default MoreScreen;
