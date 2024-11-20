import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { useAppSelector } from '@/hooks';

type LabelTextProps = {
  labelText: string;
  labelColor: string;
};

const LabelText = (props: LabelTextProps) => {
  const { labelText, labelColor } = props;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center py-[3px]')}>
      <NativeView style={tailwind.style('h-[5px] w-[5px] rounded-full', `bg-[${labelColor}]`)} />
      <NativeView style={tailwind.style('pl-1')}>
        <Text
          style={tailwind.style(
            'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
          )}>
          {labelText}
        </Text>
      </NativeView>
    </NativeView>
  );
};
type LabelIndicatorProps = {
  labels: string[];
};

export const LabelIndicator = (props: LabelIndicatorProps) => {
  const { labels } = props;

  const allLabels = useAppSelector(selectAllLabels);

  const activeLabels =
    allLabels && labels
      ? allLabels.filter(label => {
          return labels?.find(l => l === label.title);
        })
      : [];

  return (
    <AnimatedNativeView style={tailwind.style('flex flex-row items-center')}>
      {activeLabels.map((label, i) => {
        return (
          <NativeView key={i} style={tailwind.style(i !== 0 ? 'pl-1.5' : '')}>
            <LabelText labelText={label.title} labelColor={label.color} />
          </NativeView>
        );
      })}
    </AnimatedNativeView>
  );
};
