import React, { useState } from 'react';
import { TextInput, Pressable, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { SparkleIcon, SendIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import i18n from '@/i18n';

type CopilotInputBarProps = {
  isGenerating: boolean;
  onSendFollowUp: (message: string) => void;
};

export const CopilotInputBar = ({ isGenerating, onSendFollowUp }: CopilotInputBarProps) => {
  const [followUpText, setFollowUpText] = useState('');
  const hapticSelection = useHaptic();

  const handleSend = () => {
    if (followUpText.trim().length === 0 || isGenerating) return;
    hapticSelection?.();
    onSendFollowUp(followUpText.trim());
    setFollowUpText('');
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={tailwind.style('flex flex-row px-1 items-center')}>
      <Animated.View style={tailwind.style('flex items-center justify-center h-10 w-10')}>
        <Icon icon={<SparkleIcon stroke="#5B5BD6" />} size={24} />
      </Animated.View>
      <Animated.View
        style={tailwind.style('flex-1 flex-row items-center bg-[#E0E0FD] rounded-[20px] h-9 pl-3 pr-1')}>
        {isGenerating ? (
          <Text
            style={tailwind.style(
              'flex-1 text-sm font-inter-normal-20 leading-[21px] tracking-[-0.1px] text-[#4747C2]',
            )}>
            {i18n.t('COPILOT.THINKING')}
          </Text>
        ) : (
          <TextInput
            value={followUpText}
            onChangeText={setFollowUpText}
            placeholder={i18n.t('COPILOT.FOLLOW_UP_PLACEHOLDER')}
            placeholderTextColor="#4747C2"
            style={tailwind.style(
              'flex-1 text-sm font-inter-normal-20 leading-[21px] tracking-[-0.1px] text-[#4747C2] p-0',
            )}
            editable={!isGenerating}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
        )}
      </Animated.View>
      <Pressable
        onPress={handleSend}
        disabled={isGenerating || followUpText.trim().length === 0}
        style={tailwind.style('flex items-center justify-center h-10 w-10')}>
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center h-7 w-7 rounded-full',
            isGenerating || followUpText.trim().length === 0 ? 'bg-gray-400' : 'bg-gray-950',
          )}>
          <Icon icon={<SendIcon />} size={16} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
