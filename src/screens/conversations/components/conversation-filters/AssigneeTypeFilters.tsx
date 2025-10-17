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
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/auth/authSelectors';
import { getUserPermissions } from '@/utils/permissionUtils';

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

export const AssigneeTypeFilters = () => {
  const user = useSelector(selectUser);
  const { account_id: activeAccountId } = user || { account_id: null };

  const userPermissions = user ? getUserPermissions(user, activeAccountId) : [];

  // If userPermissions contains any values conversation_manage_permission,administrator, agent then keep all the assignee types
  // If conversation_manage is not available and conversation_unassigned_manage only is available, then return only unassigned and mine
  // If conversation_manage is not available and conversation_participating_manage only is available, then return only all and mine
  let assigneeTypes = assigneeTypeList;

  if (
    userPermissions.includes('conversation_manage') ||
    userPermissions.includes('agent') ||
    userPermissions.includes('administrator')
  ) {
    // Keep all the assignee types
  } else if (userPermissions.includes('conversation_unassigned_manage')) {
    assigneeTypes = assigneeTypeList.filter(type => type !== 'all');
  } else {
    assigneeTypes = assigneeTypeList.filter(type => type !== 'unassigned');
  }
  return (
    <Animated.View>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.ASSIGNEE_TYPE.TITLE')} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {assigneeTypes.map((value, index) => (
          <AssigneeTypeCell key={index} {...{ value, index }} />
        ))}
      </Animated.View>
    </Animated.View>
  );
};
