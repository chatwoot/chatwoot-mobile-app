import { useTailwind } from '@/theme/useTailwind';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SideToolbarProvider } from '@/context';
import { SideToolbarSlot } from '@/navigation/tabs/SideToolbarSlot';
import { useSideTabBarLayout } from '@/utils';

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
