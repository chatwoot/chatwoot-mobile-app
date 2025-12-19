import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { EmailMeta } from './EmailMeta';
import i18n from '@/i18n';

export type TextBubbleProps = {
  item: Message;
  variant: string;
};

export const TextBubble = (props: TextBubbleProps) => {
  const messageItem = props.item as Message;
  const { variant } = props;

  const { private: isPrivate, content, contentAttributes, sender } = messageItem;

  const [showOriginal, setShowOriginal] = useState(false);

  const translations = contentAttributes?.translations;
  const hasTranslations = translations && Object.keys(translations).length > 0;
  const translationContent = hasTranslations ? translations[Object.keys(translations)[0]] : null;

  const displayContent = hasTranslations && !showOriginal ? translationContent : content;

  const renderTranslationToggle = () => {
    if (!hasTranslations) return null;

    return (
      <Pressable onPress={() => setShowOriginal(!showOriginal)}>
        <Animated.Text
          style={tailwind.style(
            'text-xs text-gray-500 mt-1 font-inter-420-20 tracking-[0.32px]',
          )}>
          {showOriginal
            ? i18n.t('CONVERSATION.VIEW_TRANSLATED')
            : i18n.t('CONVERSATION.VIEW_ORIGINAL')}
        </Animated.Text>
      </Pressable>
    );
  };

  return (
    <React.Fragment>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      {isPrivate ? (
        <Animated.View style={tailwind.style('flex flex-row')}>
          <Animated.View style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')} />
          <Animated.View style={tailwind.style('pl-2.5')}>
            <MarkdownBubble messageContent={displayContent} variant={variant} />
            {renderTranslationToggle()}
          </Animated.View>
        </Animated.View>
      ) : (
        <>
          <MarkdownBubble messageContent={displayContent} variant={variant} />
          {renderTranslationToggle()}
        </>
      )}
    </React.Fragment>
  );
};
