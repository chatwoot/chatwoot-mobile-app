import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { MarkdownBubble } from './MarkdownBubble';
import { EmailMeta } from './EmailMeta';

export type TextBubbleProps = {
  item: Message;
  variant: string;
};

export const TextBubble = (props: TextBubbleProps) => {
  try {
    const messageItem = props?.item as Message;
    const { variant } = props || {};

    if (!messageItem || !variant) {
      return <Animated.View style={{ height: 0 }} />;
    }

    const { private: isPrivate, content, contentAttributes, sender } = messageItem;

    if (!content && !contentAttributes) {
      return <Animated.View style={{ height: 0 }} />;
    }

    return (
      <React.Fragment>
        {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
        {isPrivate ? (
          <Animated.View style={tailwind.style('flex flex-row')}>
            <Animated.View style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')} />
            <Animated.View style={tailwind.style('pl-2.5')}>
              <MarkdownBubble messageContent={content || ''} variant={variant} />
            </Animated.View>
          </Animated.View>
        ) : (
          <MarkdownBubble messageContent={content || ''} variant={variant} />
        )}
      </React.Fragment>
    );
  } catch (error) {
    console.error('[TextBubble] Render error:', error);
    return <Animated.View style={{ height: 0 }} />;
  }
};
