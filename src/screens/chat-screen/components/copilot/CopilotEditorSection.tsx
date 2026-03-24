import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { CloseIcon, TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';

type CopilotEditorSectionProps = {
  isGenerating: boolean;
  generatedContent: string;
  originalContent: string;
  onAccept: () => void;
  onDiscard: () => void;
};

export const CopilotEditorSection = ({
  isGenerating,
  generatedContent,
  originalContent,
  onAccept,
  onDiscard,
}: CopilotEditorSectionProps) => {
  const hapticSelection = useHaptic();
  const displayText = isGenerating ? originalContent : generatedContent;
  const showActions = !isGenerating && generatedContent.length > 0;

  if (isGenerating && originalContent.trim().length === 0) {
    return null;
  }

  const handleAccept = () => {
    hapticSelection?.();
    onAccept();
  };

  const handleDiscard = () => {
    hapticSelection?.();
    onDiscard();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={tailwind.style('flex-row items-start mx-[50px] mb-2')}>
      {showActions && (
        <Pressable
          onPress={handleDiscard}
          style={tailwind.style('flex items-center justify-center h-10 w-10')}>
          <Icon icon={<CloseIcon stroke="#171717" />} size={16} />
        </Pressable>
      )}
      <ScrollView
        style={tailwind.style(
          'flex-1 border border-blackA-A3 rounded-2xl px-3 py-2 max-h-[120px]',
        )}>
        <Text
          style={tailwind.style(
            'text-sm font-inter-normal-20 leading-[21px] tracking-[-0.1px] text-gray-950',
            showActions ? 'underline decoration-[#9B9EF0]' : '',
          )}>
          {displayText}
        </Text>
      </ScrollView>
      {showActions && (
        <Pressable
          onPress={handleAccept}
          style={tailwind.style('flex items-center justify-center h-10 w-10')}>
          <Icon icon={<TickIcon stroke="#46A758" />} size={20} />
        </Pressable>
      )}
    </Animated.View>
  );
};
