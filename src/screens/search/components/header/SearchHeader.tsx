import React from 'react';
import { StatusBar, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SearchBar } from '@/components-next/common/search';
import { Icon } from '@/components-next';
import { HEADER_ICON_COLOR, SideToolbarButton } from '@/components-next/side-toolbar';
import { GlassCircleButton } from '@/components-next/side-toolbar/GlassCircleButton';
import { useSideToolbar } from '@/context';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import { IOS_DESIGN, useSideTabBarLayout } from '@/utils';
import i18n from 'i18n';
import { IOSSearchField } from './IOSSearchField';

interface SearchHeaderProps {
  searchText: string;
  isLoading: boolean;
  onSearchChange: (text: string) => void;
  onClear: () => void;
  onBackPress: () => void;
}

// iOS: a glass Back button and a glass search capsule, laid out like PageHeader (same
// margins, 36pt row, no divider). With tabs on the side, Back goes in the side toolbar.
const IOSSearchHeader = ({
  searchText,
  isLoading,
  onSearchChange,
  onClear,
  onBackPress,
}: SearchHeaderProps) => {
  const sideTabBar = useSideTabBarLayout();
  const isSide = useSideToolbar(
    <SideToolbarButton
      icon={<ChevronLeft stroke={HEADER_ICON_COLOR} strokeWidth={1.5} />}
      onPress={onBackPress}
      accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
    />,
    [onBackPress],
  );
  return (
    <View style={{ paddingTop: sideTabBar?.contentTopPadding ?? 0 }}>
      <View style={tailwind.style('flex-row items-center gap-3 px-4 pt-1 pb-3')}>
        {isSide ? null : (
          <GlassCircleButton
            icon={<ChevronLeft stroke={HEADER_ICON_COLOR} strokeWidth={1.5} />}
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

export function SearchHeader(props: SearchHeaderProps) {
  const { searchText, isLoading, onSearchChange, onClear, onBackPress } = props;
  return (
    <>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      {IOS_DESIGN ? (
        <IOSSearchHeader {...props} />
      ) : (
        <Animated.View style={tailwind.style('pt-2 pb-[12px] border-b border-b-blackA-A3')}>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-2 pl-4 pr-2')}>
            <Pressable
              hitSlop={8}
              style={tailwind.style('h-6 w-6 flex justify-center items-start')}
              onPress={onBackPress}>
              <Icon icon={<ChevronLeft />} size={24} />
            </Pressable>
            <Animated.View style={tailwind.style('flex-1')}>
              <SearchBar
                placeholder={i18n.t('SEARCH.PLACEHOLDER')}
                autoFocus
                value={searchText}
                onChangeText={onSearchChange}
                isLoading={isLoading}
                onClear={onClear}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}
