import React from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components-next';
import i18n from '@/i18n';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

type TemplateFormHeaderProps = {
  title: string;
  canSend: boolean;
  onBack: () => void;
  onSend: () => void;
};

const TemplateFormHeader = ({ title, canSend, onBack, onSend }: TemplateFormHeaderProps) => {
  const hapticSelection = useHaptic();
  const { animatedStyle, handlers } = useScaleAnimation();

  const handleSend = () => {
    if (!canSend) return;
    hapticSelection?.();
    onSend();
  };

  return (
    <View style={tailwind.style('flex-row items-center px-5 py-3 gap-3')}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={tailwind.style('items-center justify-center w-5 h-5')}>
        <Icon icon={<ChevronLeft />} size={16} />
      </Pressable>
      <Animated.Text
        numberOfLines={1}
        style={tailwind.style(
          'flex-1 text-[17px] font-inter-medium-24 leading-[24px] tracking-[0.34px] text-gray-950',
        )}>
        {title}
      </Animated.Text>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          {...handlers}
          style={tailwind.style(
            'px-3 py-[7px] rounded-lg flex-row items-center justify-center min-w-[60px] min-h-[32px]',
            canSend ? 'bg-gray-100' : 'bg-gray-50',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-medium-24 leading-[22px] tracking-[0.32px]',
              canSend ? 'text-gray-950' : 'text-gray-500',
            )}>
            {i18n.t('CONTENT_TEMPLATE.SEND')}
          </Animated.Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default TemplateFormHeader;
