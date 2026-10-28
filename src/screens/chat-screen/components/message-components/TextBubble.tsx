import { useTailwind } from '@/theme/useTailwind';
import React, { useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { EmailMeta } from './EmailMeta';
import i18n from '@/i18n';
import { MESSAGE_VARIANTS } from '@/constants';

export type TextBubbleProps = {
  item: Message;
  variant: string;
  // Keep room at the end of the last line for the time drawn over the bubble's corner
  // (WhatsApp-style inline time on iOS): time only, or time and delivery ticks.
  timeReserve?: 'time' | 'ticks';
};

export const TextBubble = (props: TextBubbleProps) => {
  const tailwind = useTailwind();
  const messageItem = props.item as Message;
  const { variant, timeReserve } = props;

  const { private: isPrivate, content, contentAttributes, sender } = messageItem;

  const translations = contentAttributes?.translations;
  const activeLocale = i18n.locale?.split('_')[0] || 'en';
  const translatedText = translations
    ? translations[activeLocale] || Object.values(translations)[0] || null
    : null;
  const hasTranslations = !!translatedText;

  const [showOriginal, setShowOriginal] = useState(false);

  const toggleTranslation = useCallback(() => {
    setShowOriginal(prev => !prev);
  }, []);

  const displayContent = hasTranslations && !showOriginal ? translatedText : content || '';

  const toggleTextColor = variant === MESSAGE_VARIANTS.USER ? 'text-blue-200' : 'text-blue-700';

  const renderContent = () => (
    <React.Fragment>
      <MarkdownBubble messageContent={displayContent} variant={variant} timeReserve={timeReserve} />
      {hasTranslations && (
        <Pressable onPress={toggleTranslation} hitSlop={4}>
          <Animated.Text
            style={tailwind.style(
              'text-xs font-inter-420-20 tracking-[0.32px] pt-1',
              toggleTextColor,
            )}>
            {showOriginal
              ? i18n.t('CONVERSATION.VIEW_TRANSLATED')
              : i18n.t('CONVERSATION.VIEW_ORIGINAL')}
          </Animated.Text>
        </Pressable>
      )}
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      {isPrivate ? (
        <Animated.View style={tailwind.style('flex flex-row')}>
          <Animated.View style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')} />
          <Animated.View style={tailwind.style('pl-2.5')}>{renderContent()}</Animated.View>
        </Animated.View>
      ) : (
        renderContent()
      )}
    </React.Fragment>
  );
};
