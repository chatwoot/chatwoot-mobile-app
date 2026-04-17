import React, { useEffect, useState, useRef } from 'react';
import { TextInput, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { tailwind, useAppTheme } from '@/theme';
import i18n from '@/i18n';

type CopilotInputBarProps = {
  isGenerating: boolean;
  onSendFollowUp: (message: string) => void;
  onFollowUpTextChange?: (text: string) => void;
};

const ThinkingText = ({ textColorClass }: { textColorClass: string }) => {
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
        'text-sm font-inter-normal-20 leading-[21px] tracking-[-0.1px]',
        textColorClass,
      )}>
      {i18n.t('COPILOT.THINKING')}
      {dots}
    </Text>
  );
};

export const CopilotInputBar = ({
  isGenerating,
  onSendFollowUp,
  onFollowUpTextChange,
}: CopilotInputBarProps) => {
  const [followUpText, setFollowUpText] = useState('');
  const { isDark } = useAppTheme();
  const containerColorClass = isDark ? 'bg-indigoDark-200' : 'bg-indigo-100';
  const textColorClass = isDark ? 'text-indigoDark-950' : 'text-indigo-900';
  const placeholderTextColor = tailwind.color(
    isDark ? 'text-indigoDark-900' : 'text-indigo-800',
  ) as string;

  useEffect(() => {
    if (isGenerating) {
      setFollowUpText('');
      onFollowUpTextChange?.('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

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
    <View
      style={tailwind.style(
        'flex-1 rounded-[20px] min-h-9 max-h-[76px] px-3 py-2 justify-center',
        containerColorClass,
      )}>
      {isGenerating ? (
        <Animated.View
          key="thinking"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}>
          <ThinkingText textColorClass={textColorClass} />
        </Animated.View>
      ) : (
        <Animated.View key="input" entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <TextInput
            value={followUpText}
            onChangeText={handleChangeText}
            placeholder={i18n.t('COPILOT.FOLLOW_UP_PLACEHOLDER')}
            placeholderTextColor={placeholderTextColor}
            multiline
            style={tailwind.style(
              'text-sm font-inter-normal-20 leading-[18px] tracking-[-0.1px] p-0',
              textColorClass,
            )}
            editable={!isGenerating}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            scrollEnabled
          />
        </Animated.View>
      )}
    </View>
  );
};
