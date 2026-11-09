import { useMemo } from 'react';
import { View } from 'react-native';

import { SideToolbarButton } from '@/components-next/side-toolbar';
import { GlassCircleButton } from '@/components-next/side-toolbar/GlassCircleButton';
import { useSideToolbar } from '@/context';
import { ChevronLeft } from '@/svg-icons';
import { useTailwind } from '@/theme/useTailwind';
import { useSideTabBarLayout } from '@/utils';
import i18n from 'i18n';
import { IOSSearchField } from './IOSSearchField';
import type { SearchHeaderProps } from './SearchHeader';

export const IOSSearchHeader = ({
  searchText,
  isLoading,
  onSearchChange,
  onClear,
  onBackPress,
}: SearchHeaderProps) => {
  const tailwind = useTailwind();
  const sideTabBar = useSideTabBarLayout();
  const backItem = useMemo(
    () => (
      <SideToolbarButton
        icon={<ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
        onPress={onBackPress}
        accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
      />
    ),
    [onBackPress, tailwind],
  );
  const isSide = useSideToolbar(backItem);
  return (
    <View style={{ paddingTop: sideTabBar?.contentTopPadding ?? 0 }}>
      <View style={tailwind.style('flex-row items-center gap-3 px-4 pt-1 pb-3')}>
        {isSide ? null : (
          <GlassCircleButton
            icon={<ChevronLeft stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
            onPress={onBackPress}
            accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
          />
        )}
        <IOSSearchField
          value={searchText}
          isLoading={isLoading}
          onChangeText={onSearchChange}
          onClear={onClear}
        />
      </View>
    </View>
  );
};
