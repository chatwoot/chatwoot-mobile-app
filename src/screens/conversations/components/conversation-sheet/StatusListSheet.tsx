import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { StatusCollection } from '@/types';
import { getStatusTypeIcon, useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { StatusOptions } from '@/types';

type StatusCellProps = {
  value: StatusCollection;
  index: number;
};

export const status: StatusCollection[] = [
  { id: 'all', icon: getStatusTypeIcon('all') },
  { id: 'open', icon: getStatusTypeIcon('open') },
  { id: 'pending', icon: getStatusTypeIcon('pending') },
  { id: 'snoozed', icon: getStatusTypeIcon('snoozed') },
  { id: 'resolved', icon: getStatusTypeIcon('resolved') },
];

const StatusCell = (props: StatusCellProps) => {
  const { filtersModalSheetRef } = useRefsContext();
  const { value, index } = props;
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const hapticSelection = useHaptic();

  const handleStatusPress = () => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'status', value: value.id }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Pressable onPress={handleStatusPress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View>
        <Icon icon={value.icon} size={24} />
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== status.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {i18n.t(`CONVERSATION.FILTERS.STATUS.OPTIONS.${StatusOptions[value.id].toUpperCase()}`)}
        </Animated.Text>
        {filters.status === value.id ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type StatusStackProps = {
  statusList: StatusCollection[];
};

const StatusStack = (props: StatusStackProps) => {
  const { statusList } = props;
  const list = statusList;
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {list.map((value, index) => (
        <StatusCell key={index} {...{ value, index }} />
      ))}
    </Animated.View>
  );
};

export const StatusListSheet = () => {
  return (
    <BottomSheetView>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.STATUS.TITLE')} />
      <StatusStack statusList={status} />
    </BottomSheetView>
  );
};
