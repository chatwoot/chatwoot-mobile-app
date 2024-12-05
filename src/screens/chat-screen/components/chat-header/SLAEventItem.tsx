import React from 'react';
import { Text, Animated } from 'react-native';
import { tailwind } from '@/theme';
import { SLAEvent } from '@/types/common/SLA';
import { format, fromUnixTime } from 'date-fns';

interface SlaEventsProps {
  label: string;
  items: SLAEvent[];
}

export const SlaEvents = ({ label, items }: SlaEventsProps) => {
  const formatDate = (timestamp: number) =>
    format(fromUnixTime(timestamp), 'MMM dd, yyyy, hh:mm a');

  return (
    <Animated.View style={tailwind.style('flex flex-row justify-between')}>
      <Text
        style={tailwind.style(
          'text-md  text-gray-950 font-inter-medium-24 leading-[21px] tracking-[0.16px]',
        )}>
        {label}
      </Text>
      <Animated.View style={tailwind.style('flex flex-col gap-2')}>
        {items.map(item => (
          <Text
            key={item.id}
            style={tailwind.style(
              'text-md  text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {formatDate(item.createdAt)}
          </Text>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
