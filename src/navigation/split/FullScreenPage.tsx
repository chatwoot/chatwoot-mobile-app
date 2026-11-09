import { useTailwind } from '@/theme/useTailwind';
import React, { PropsWithChildren, useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SideToolbarProvider, useSideToolbar } from '@/context';
import { SideToolbarButton } from '@/components-next/side-toolbar';
import { GlassCircleButton } from '@/components-next/side-toolbar/GlassCircleButton';
import i18n from '@/i18n';
import { SideToolbarSlot } from '@/navigation/tabs/BottomTabBar';
import { ChevronLeft } from '@/svg-icons';
import { useSideTabBarLayout } from '@/utils';

import { PaneHeader } from './PaneHeader';

export const FullScreenPage = ({
  background = 'bg-white',
  children,
}: PropsWithChildren<{ background?: string }>) => {
  const tailwind = useTailwind();
  const sideTabBar = useSideTabBarLayout();
  const page = (
    <SafeAreaView edges={['top', 'left', 'right']} style={tailwind.style('flex-1', background)}>
      {children}
    </SafeAreaView>
  );
  if (!sideTabBar) return page;
  return (
    <SideToolbarProvider>
      <View style={tailwind.style('flex-1')}>
        {page}
        <SideToolbarSlot />
      </View>
    </SideToolbarProvider>
  );
};

export const PageHeader = ({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) => {
  const tailwind = useTailwind();
  const backItem = useMemo(
    () => (
      <SideToolbarButton
        icon={<ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
        onPress={onBack}
        accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
      />
    ),
    [onBack, tailwind],
  );
  const isSide = useSideToolbar(backItem);
  return (
    <PaneHeader
      title={title}
      left={
        isSide ? undefined : (
          <GlassCircleButton
            icon={<ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
            onPress={onBack}
            accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
          />
        )
      }
      right={right}
    />
  );
};
