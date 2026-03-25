import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { Icon } from '@/components-next/common';
import { CopilotDiscardIcon, CopilotAcceptIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';

type CopilotEditorSectionProps = {
  isGenerating: boolean;
  generatedContent: string;
  originalContent: string;
  onAccept: () => void;
  onDiscard: () => void;
};

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    fontFamily: 'Inter-400-20',
    lineHeight: 21,
    letterSpacing: -0.1,
    color: tailwind.color('text-slate-950') as string,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  strong: {
    fontFamily: 'Inter-600-20',
    fontWeight: '600',
  },
  em: {
    fontStyle: 'italic',
  },
});

const markdownIt = MarkdownIt({ typographer: true });

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
      style={tailwind.style('flex-row items-start px-1 mb-2')}>
      {showActions ? (
        <Pressable
          onPress={handleDiscard}
          style={tailwind.style('flex items-center justify-center h-10 w-10')}>
          <Icon icon={<CopilotDiscardIcon />} size={28} />
        </Pressable>
      ) : (
        <Animated.View style={tailwind.style('w-10')} />
      )}
      <ScrollView
        style={tailwind.style('flex-1 max-h-[120px] border border-blackA-A3 rounded-2xl')}
        contentContainerStyle={tailwind.style('px-3 py-2')}>
        <Markdown style={markdownStyles} markdownit={markdownIt}>
          {displayText}
        </Markdown>
      </ScrollView>
      {showActions ? (
        <Pressable
          onPress={handleAccept}
          style={tailwind.style('flex items-center justify-center h-10 w-10')}>
          <Icon icon={<CopilotAcceptIcon />} size={28} />
        </Pressable>
      ) : (
        <Animated.View style={tailwind.style('w-10')} />
      )}
    </Animated.View>
  );
};
