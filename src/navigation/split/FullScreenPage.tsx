import { useTailwind } from '@/theme/useTailwind';
import React, { PropsWithChildren } from 'react';
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

// Pages that open in the split view's side column on the open iPhone Duo (contact details,
// dashboard apps, macros) open full screen on iPhone and the closed Duo, with the same
// content and a header like the column's. With tabs on the side, Back goes in the side
// toolbar like the chat's; otherwise it's a glass button in the header.

/** Full-screen page frame: safe area, background, and its own side toolbar when needed. */
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

/** Header for a FullScreenPage: centered title, Back, and an optional trailing action. */
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
  const isSide = useSideToolbar(
    <SideToolbarButton
      icon={<ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
      onPress={onBack}
      accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
    />,
    [onBack],
  );
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
