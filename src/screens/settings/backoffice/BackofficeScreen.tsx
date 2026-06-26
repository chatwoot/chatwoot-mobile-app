// BackofficeScreen.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import i18n from 'i18n';
import { tailwind } from '@/theme';
import { SettingsList } from '@/components-next';
import { SwitchIcon } from '@/svg-icons';
import type { GenericListType } from '@/types';

export default function BackofficeScreen(): JSX.Element {
  const navigation = useNavigation();

  const tools: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('BACKOFFICE.NETWORK_DIAGNOSTICS'),
      icon: <SwitchIcon />,
      subtitle: i18n.t('BACKOFFICE.NETWORK_DIAGNOSTICS_DESC'),
      subtitleType: 'light',
      // @ts-expect-error navigation is typed loosely across stacks in this app
      onPressListItem: () => navigation.navigate('NetworkDiagnosticsScreen'),
    },
  ];

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <StatusBar translucent backgroundColor={tailwind.color('bg-white')} barStyle="dark-content" />
      <Animated.View style={tailwind.style('px-4 pt-4 pb-2')}>
        <Animated.Text style={tailwind.style('text-[22px] font-inter-580-24 text-gray-950')}>
          {i18n.t('BACKOFFICE.TITLE')}
        </Animated.Text>
      </Animated.View>
      <Animated.ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={tailwind.style('pt-4')}>
          <SettingsList sectionTitle={i18n.t('BACKOFFICE.SUBTITLE')} list={tools} />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
