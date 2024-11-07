import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { StatusCollection } from '../../types';
import { getStatusTypeIcon, useHaptic } from '../../utils';
import { BottomSheetHeader, Icon, StatusOptions } from '../common';
import { useAppDispatch, useAppSelector } from '@/hooks';

type StatusCellProps = {
  value: StatusCollection;
  type: 'Filter' | 'SetStatus';
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
  const { filtersModalSheetRef, actionsModalSheetRef } = useRefsContext();
  const { value, index, type } = props;
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();

  const hapticSelection = useHaptic();

  const handleStatusPress = () => {
    hapticSelection?.();
    if (type === 'Filter') {
      dispatch(setFilters({ key: 'status', value: value.id }));
      setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
    } else if (type === 'SetStatus') {
      actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    }
  };

  return (
    <Pressable onPress={handleStatusPress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View>
        <Icon icon={value.icon} size={24} />
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== (type === 'Filter' ? status.length - 1 : status.length - 2)
            ? 'border-b-[1px] border-blackA-A3'
            : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {StatusOptions[value.id]}
        </Animated.Text>
        {type === 'Filter' && filters.status === value.id ? (
          <Icon icon={<TickIcon />} size={20} />
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

type StatusStackProps = {
  statusList: StatusCollection[];
  type: 'Filter' | 'SetStatus';
};

const StatusStack = (props: StatusStackProps) => {
  const { statusList, type } = props;
  const list = type === 'Filter' ? statusList : statusList.slice(1);
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {list.map((value, index) => (
        <StatusCell key={index} {...{ value, index, type }} />
      ))}
    </Animated.View>
  );
};

interface StatusListComponentProps {
  type: 'Filter' | 'SetStatus';
}

export const StatusListComponent = (props: StatusListComponentProps) => {
  const { type } = props;
  return (
    <BottomSheetView>
      <BottomSheetHeader headerText={type === 'Filter' ? 'Filter by status' : 'Assign status'} />
      <StatusStack statusList={status} {...{ type }} />
    </BottomSheetView>
  );
};
