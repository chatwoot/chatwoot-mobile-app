import React, { useEffect, useState, useRef } from 'react';
import { TextInput, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { tailwind } from '@/theme';
import i18n from '@/i18n';

type CopilotInputBarProps = {
  isGenerating: boolean;
  onSendFollowUp: (message: string) => void;
  onFollowUpTextChange?: (text: string) => void;
};

const ThinkingText = () => {
  const [dots, setDots] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Text
      style={tailwind.style(
        'text-sm font-inter-normal-20 leading-[21px] tracking-[-0.1px] text-[#4747C2]',
      )}>
      {i18n.t('COPILOT.THINKING')}
      {dots}
    </Text>
  );
};

export const CopilotInputBar = ({ isGenerating, onSendFollowUp, onFollowUpTextChange }: CopilotInputBarProps) => {
  const [followUpText, setFollowUpText] = useState('');

  const handleChangeText = (text: string) => {
    setFollowUpText(text);
    onFollowUpTextChange?.(text);
  };

  const handleSend = () => {
    if (followUpText.trim().length === 0 || isGenerating) return;
    onSendFollowUp(followUpText.trim());
    setFollowUpText('');
    onFollowUpTextChange?.('');
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={tailwind.style('flex-1')}>
      {isGenerating ? (
        <Animated.View
          style={tailwind.style('bg-[#E0E0FD] rounded-[20px] px-3 py-2 justify-center')}>
          <ThinkingText />
        </Animated.View>
      ) : (
        <TextInput
          value={followUpText}
          onChangeText={handleChangeText}
          placeholder={i18n.t('COPILOT.FOLLOW_UP_PLACEHOLDER')}
          placeholderTextColor="#4747C2"
          multiline
          style={tailwind.style(
            'bg-[#E0E0FD] rounded-[20px] max-h-[76px] px-3 py-2',
            'text-sm font-inter-normal-20 leading-[21px] tracking-[-0.1px] text-[#4747C2]',
          )}
          editable={!isGenerating}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          scrollEnabled
        />
      )}
    </Animated.View>
  );
};
