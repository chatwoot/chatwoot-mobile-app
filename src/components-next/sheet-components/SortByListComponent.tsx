import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '../../context';
import { useConversationListFilterState } from '../../store';
import { TickIcon } from '../../svg-icons';
import { tailwind } from '../../theme';
import { SortTypes } from '../../types';
import { useHaptic } from '../../utils';
import { BottomSheetHeader, Icon, SortOptions } from '../common';

type SortByCellProps = {
  value: string;
  index: number;
};

const sortByList = Object.keys(SortOptions) as SortTypes[];

const SortByCell = (props: SortByCellProps) => {
  const { filtersModalSheetRef } = useRefsContext();
  const { value, index } = props;
  const { filtersApplied, setFilterApplied } = useConversationListFilterState();

  const hapticSelection = useHaptic();

  const handlePreferredSortPress = () => {
    hapticSelection?.();
    setFilterApplied('sort_by', value);
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Pressable
      onPress={handlePreferredSortPress}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== sortByList.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {SortOptions[value as SortTypes]}
        </Animated.Text>
        {filtersApplied.sort_by === value ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type SortByStackProps = {
  list: SortTypes[];
};

const SortByStack = (props: SortByStackProps) => {
  const { list } = props;
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {list.map((value, index) => (
        <SortByCell key={index} {...{ value, index }} />
      ))}
    </Animated.View>
  );
};

export const SortByListComponent = () => {
  return (
    <Animated.View>
      <BottomSheetHeader headerText={'Sort by'} />
      <SortByStack list={sortByList} />
    </Animated.View>
  );
};
