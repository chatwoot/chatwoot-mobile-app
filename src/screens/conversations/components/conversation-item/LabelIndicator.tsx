import React, { useState } from 'react';
import { Text } from 'react-native';
import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { Label } from '@/types';

interface LabelState {
  result: Label[]; // List of labels that fit within the available width
  totalWidth: number; // Total width of the labels added so far
}

interface LayoutChangeEvent {
  nativeEvent: {
    layout: {
      width: number; // Width of the component
      height: number; // Height of the component
    };
  };
}

const LabelText = ({ labelText, labelColor }: { labelText: string; labelColor: string }) => {
  const themedTailwind = useThemedStyles();
  return (
    <NativeView style={tailwind.style('flex-row items-center py-[3px]')}>
      <NativeView style={tailwind.style('h-[5px] w-[5px] rounded-full', `bg-[${labelColor}]`)} />
      <Text
        style={themedTailwind.style(
          'pl-1 text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
        )}>
        {labelText}
      </Text>
    </NativeView>
  );
};

export const LabelIndicator = ({ labels, allLabels }: { labels: string[]; allLabels: Label[] }) => {
  // Store the container width
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const activeLabels = React.useMemo(() => {
    if (!allLabels || !labels || containerWidth === null) return [];

    const availableWidth = containerWidth;

    const { result } = allLabels.reduce<LabelState>(
      (state, label) => {
        if (!labels.includes(label.title)) return state; // Skip labels not in `labels`

        const labelWidth = label.title.length * 8 + 12; // Approximate width of the label

        if (state.totalWidth + labelWidth <= availableWidth) {
          // Add the label to the result and update the total width
          return {
            result: [...state.result, label],
            totalWidth: state.totalWidth + labelWidth,
          };
        }
        // Stop adding labels if the total width exceeds the available space
        return state;
      },
      { result: [], totalWidth: 0 }, // Start with an empty list and zero width
    );

    return result; // Return the list of active labels
  }, [allLabels, labels, containerWidth]);

  return (
    <AnimatedNativeView
      style={tailwind.style('flex-1')}
      onLayout={(event: LayoutChangeEvent) => {
        // Measure the container width when it is rendered
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}>
      <NativeView style={tailwind.style('flex-row items-center overflow-hidden')}>
        {activeLabels.map((label, index) => (
          <NativeView key={index} style={tailwind.style(index !== 0 ? 'pl-1.5' : '')}>
            <LabelText labelText={label.title} labelColor={label.color} />
          </NativeView>
        ))}
      </NativeView>
    </AnimatedNativeView>
  );
};
