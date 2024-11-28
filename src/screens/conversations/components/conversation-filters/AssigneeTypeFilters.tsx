import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { AssigneeTypes } from '@/types';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { AssigneeOptions } from '@/types';

type AssigneeTypeCellProps = {
  value: string;
  index: number;
};

const assigneeTypeList = Object.keys(AssigneeOptions) as AssigneeTypes[];

const AssigneeTypeCell = (props: AssigneeTypeCellProps) => {
  const { filtersModalSheetRef } = useRefsContext();
  const { value, index } = props;
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const hapticSelection = useHaptic();

  const handlePreferredAssigneeTypePress = () => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'assignee_type', value }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Pressable
      onPress={handlePreferredAssigneeTypePress}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== assigneeTypeList.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {i18n.t(`CONVERSATION.FILTERS.ASSIGNEE_TYPE.OPTIONS.${value.toUpperCase()}`)}
        </Animated.Text>
        {filters.assignee_type === value ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type AssigneeTypeStackProps = {
  list: AssigneeTypes[];
};

const AssigneeTypeStack = (props: AssigneeTypeStackProps) => {
  const { list } = props;
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {list.map((value, index) => (
        <AssigneeTypeCell key={index} {...{ value, index }} />
      ))}
    </Animated.View>
  );
};

export const AssigneeTypeFilters = () => {
  return (
    <Animated.View>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.ASSIGNEE_TYPE.TITLE')} />
      <AssigneeTypeStack list={assigneeTypeList} />
    </Animated.View>
  );
};
