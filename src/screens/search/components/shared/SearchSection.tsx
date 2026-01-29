import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { CaretBottomSmall } from '@/svg-icons';
import { Icon } from '@/components-next/common';
import { type SearchSectionType, getSearchSectionById } from '@/screens/search/config';
import type { TabType } from '../hooks/useSearchScreen';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchListItems } from './SearchListItems';

const INITIAL_ITEMS_TO_SHOW = 5;

interface SearchSectionProps {
  sectionId: SearchSectionType;
  items: any[];
  itemsToShow: any[];
  isLoadingMore: boolean;
  hasMore: boolean;
  isInitialLoading: boolean;
  isExpanded: boolean;
  activeTab: TabType;
  searchQuery: string;
  onViewMore: (sectionId: SearchSectionType) => void;
  onLoadMore: (sectionId: SearchSectionType) => void;
  onTabChange: (sectionId: SearchSectionType) => void;
  renderItem: (item: any, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
}

export function SearchSection({
  sectionId,
  items,
  itemsToShow,
  isLoadingMore,
  hasMore,
  isInitialLoading,
  isExpanded,
  activeTab,
  searchQuery,
  onViewMore,
  onLoadMore,
  onTabChange,
  renderItem,
}: SearchSectionProps) {
  const section = getSearchSectionById(sectionId);
  if (!section) return null;

  const shouldShowSection = activeTab === 'all' || items.length > 0 || isInitialLoading;
  if (!shouldShowSection) {
    return null;
  }

  const handleViewMorePress = () => {
    onTabChange(sectionId);
  };

  const rotation = useSharedValue(isExpanded ? 0 : 180);
  
  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 0 : 180, { duration: 200 });
  }, [isExpanded, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View key={sectionId} layout={Layout.springify().damping(20).stiffness(180)}>
      <Animated.View
        entering={FadeIn.duration(200)}
        style={tailwind.style('px-4 py-2 flex-row items-center justify-between')}>
        {activeTab === 'all' && items.length > 0 && !isInitialLoading ? (
          <Pressable
            onPress={() => onViewMore(sectionId)}
            disabled={isInitialLoading}
            style={tailwind.style('flex-row items-center flex-1')}>
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-medium-24 leading-[17px] tracking-[0.16px] text-gray-700',
              )}>
              {section.label}
            </Animated.Text>
            <Animated.View style={[animatedIconStyle, tailwind.style('ml-2')]}>
              <Icon icon={<CaretBottomSmall fill={tailwind.color('text-gray-700')} />} size={8} />
            </Animated.View>
          </Pressable>
        ) : (
          <Animated.View style={tailwind.style('flex-row items-center')}>
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-medium-24 leading-[17px] tracking-[0.16px] text-gray-700',
              )}>
              {section.label}
              {activeTab !== 'all' && ` (${items.length})`}
            </Animated.Text>
          </Animated.View>
        )}
        {activeTab === 'all' && items.length > 0 && !isInitialLoading && items.length > INITIAL_ITEMS_TO_SHOW && (
          <Pressable onPress={handleViewMorePress}>
            <Animated.Text
              style={tailwind.style(
                'text-xs font-inter-420-20 leading-[17px] tracking-[0.16px] text-blue-800',
              )}>
              View more
            </Animated.Text>
          </Pressable>
        )}
      </Animated.View>
      {isInitialLoading && items.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={tailwind.style('px-4 py-8 items-center')}>
          <ActivityIndicator />
        </Animated.View>
      ) : items.length === 0 && activeTab === 'all' ? (
        <SearchEmptyState
          sectionLabel={section.label}
          searchQuery={searchQuery}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        />
      ) : (
        <>
          {isExpanded && (
            <SearchListItems
              sectionId={sectionId}
              items={itemsToShow}
              renderItem={renderItem}
              getItemId={section.getItemId}
              useFlashList={false}
            />
          )}
        </>
      )}
    </Animated.View>
  );
}
