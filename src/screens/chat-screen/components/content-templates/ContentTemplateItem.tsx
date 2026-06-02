import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { NormalizedTemplate } from '@/types';
import { useHaptic } from '@/utils';

type ContentTemplateItemProps = {
  template: NormalizedTemplate;
  onPress: (template: NormalizedTemplate) => void;
  isLastItem: boolean;
};

const ContentTemplateItem = ({ template, onPress, isLastItem }: ContentTemplateItemProps) => {
  const hapticSelection = useHaptic();

  const handlePress = useCallback(() => {
    hapticSelection?.();
    onPress(template);
  }, [hapticSelection, onPress, template]);

  return (
    <Pressable onPress={handlePress} style={tailwind.style('pl-4 pr-3')}>
      <Animated.View
        style={tailwind.style('py-4 pr-2', !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '')}>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
          )}>
          {template.name}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export default ContentTemplateItem;
