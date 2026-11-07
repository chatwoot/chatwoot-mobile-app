import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { ReadStatusOptions, ReadStatusTypes } from '@/types';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';

type ReadStatusCellProps = {
  value: ReadStatusTypes;
  index: number;
};

const readStatusList = Object.keys(ReadStatusOptions) as ReadStatusTypes[];

const ReadStatusCell = (props: ReadStatusCellProps) => {
  const { filtersModalSheetRef } = useRefsContext();
  const { value, index } = props;
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();

  const hapticSelection = useHaptic();

  const handleReadStatusPress = () => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'read_status', value }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss(), 1);
  };

  return (
    <Pressable onPress={handleReadStatusPress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== readStatusList.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {i18n.t(`CONVERSATION.FILTERS.READ_STATUS.OPTIONS.${value.toUpperCase()}`)}
        </Animated.Text>
        {filters.read_status === value ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

export const ReadStatusFilters = () => {
  return (
    <Animated.View>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.READ_STATUS.TITLE')} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {readStatusList.map((value, index) => (
          <ReadStatusCell key={value} {...{ value, index }} />
        ))}
      </Animated.View>
    </Animated.View>
  );
};
