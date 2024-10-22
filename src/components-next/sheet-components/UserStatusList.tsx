import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { userStatusList } from '@/constants';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { UserStatusListItemType } from '@/types';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';

type UserStatusCellProps = {
  item: UserStatusListItemType;
  index: number;
  availabilityStatus: string;
  changeUserAvailabilityStatus: (status: string) => void;
};

const UserStatusCell = (props: UserStatusCellProps) => {
  const { item, index, availabilityStatus, changeUserAvailabilityStatus } = props;
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    changeUserAvailabilityStatus(item.status);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('h-4 w-4 rounded-full m-1.5', item.statusColor)} />
        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            index !== userStatusList.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base capitalize text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {item.status}
          </Animated.Text>
          {availabilityStatus === item.status ? <Icon icon={<TickIcon />} size={20} /> : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const UserStatusList = ({
  availabilityStatus,
  changeUserAvailabilityStatus,
}: {
  availabilityStatus: string;
  changeUserAvailabilityStatus: (status: string) => void;
}) => {
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {userStatusList.map((item, index) => {
        return (
          <UserStatusCell
            key={index}
            {...{ item, index, availabilityStatus, changeUserAvailabilityStatus }}
          />
        );
      })}
    </Animated.View>
  );
};
