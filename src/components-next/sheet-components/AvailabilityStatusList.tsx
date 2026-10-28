import React from 'react';
import { Pressable, Text, Animated } from 'react-native';

import { AVAILABILITY_STATUS_LIST } from '@/constants';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { AvailabilityStatus, AvailabilityStatusListItemType } from '@/types';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common/icon';
import i18n from 'i18n';

type StatusCellProps = {
  item: AvailabilityStatusListItemType;
  index: number;
  availabilityStatus: string;
  changeAvailabilityStatus: (status: string) => void;
  children?: React.ReactNode;
};

const StatusCell = ({
  item,
  index,
  availabilityStatus,
  changeAvailabilityStatus,
  children,
}: StatusCellProps) => {
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    changeAvailabilityStatus(item.status);
  };

  const isLastItem = index === AVAILABILITY_STATUS_LIST.length - 1;
  const isSelected = availabilityStatus === item.status;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={tailwind.style('flex flex-row items-start')}>
        <Animated.View
          style={tailwind.style('h-4 w-4 rounded-full mx-1.5 mt-[14px]', item.statusColor)}
        />
        <Animated.View
          style={tailwind.style('flex-1 ml-3', !isLastItem && 'border-b-[1px] border-blackA-A3')}>
          <Animated.View style={tailwind.style('flex-row justify-between py-[11px] pr-3')}>
            <Text
              style={tailwind.style(
                'text-base capitalize text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
              )}>
              {i18n.t(`AVAILABILITY.${item.status.toUpperCase()}`)}
            </Text>
            {isSelected && <Icon icon={<TickIcon />} size={20} />}
          </Animated.View>
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const AvailabilityStatusList = ({
  availabilityStatus,
  changeAvailabilityStatus,
  onlineContent,
}: {
  availabilityStatus: string;
  changeAvailabilityStatus: (status: string) => void;
  onlineContent?: React.ReactNode;
}) => (
  <Animated.View style={tailwind.style('py-1 pl-3')}>
    {AVAILABILITY_STATUS_LIST.map((item, index) => (
      <StatusCell
        key={item.status}
        item={item as AvailabilityStatusListItemType}
        index={index}
        availabilityStatus={availabilityStatus as AvailabilityStatus}
        changeAvailabilityStatus={changeAvailabilityStatus}>
        {item.status === 'online' ? onlineContent : null}
      </StatusCell>
    ))}
  </Animated.View>
);
