import { StatusBar, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { SearchBar } from '@/components-next/common/search';
import { Icon } from '@/components-next';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import { IOS_DESIGN } from '@/utils';
import i18n from 'i18n';
import { IOSSearchHeader } from './IOSSearchHeader';

export interface SearchHeaderProps {
  searchText: string;
  isLoading: boolean;
  onSearchChange: (text: string) => void;
  onClear: () => void;
  onBackPress: () => void;
}

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
