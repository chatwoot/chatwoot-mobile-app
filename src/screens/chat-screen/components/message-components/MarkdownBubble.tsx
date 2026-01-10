import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { openURL } from '@/utils/urlUtils';

let Markdown: any = ({ children }: any) => <Text>{children}</Text>;
let MarkdownIt: any = () => {};

try {
  const MarkdownDisplay = require('react-native-markdown-display');
  Markdown = MarkdownDisplay.default;
  MarkdownIt = MarkdownDisplay.MarkdownIt;
} catch (e) {
  console.warn('react-native-markdown-display not available');
}

import { tailwind } from '@/theme';
import { MESSAGE_VARIANTS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';

type MarkdownBubbleProps = {
  messageContent?: string;
  variant?: string;
};

const variantTextMap = {
  [MESSAGE_VARIANTS.AGENT]: 'text-gray-950',
  [MESSAGE_VARIANTS.USER]: 'text-white',
  [MESSAGE_VARIANTS.BOT]: 'text-gray-950',
  [MESSAGE_VARIANTS.TEMPLATE]: 'text-gray-950',
  [MESSAGE_VARIANTS.ERROR]: 'text-white',
  [MESSAGE_VARIANTS.PRIVATE]: 'text-amber-950 font-inter-medium-24',
};

export const MarkdownBubble = (props: MarkdownBubbleProps) => {
  try {
    const { messageContent, variant } = props || {};
    const { colors, isDark } = useTheme();

    if (!messageContent || messageContent.trim() === '') {
      return <View style={{ height: 0 }} />;
    }

    if (!variant || !variantTextMap[variant]) {
      return <Text>{messageContent}</Text>;
    }

    const handleURL = (url: string) => {
      try {
        openURL({ URL: url });
        return true;
      } catch (error) {
        console.error('[MarkdownBubble] URL open error:', error);
        return false;
      }
    };

    const textStyle = {
      ...tailwind.style(variantTextMap[variant]),
      ...(isDark &&
      (variant === MESSAGE_VARIANTS.AGENT ||
        variant === MESSAGE_VARIANTS.BOT ||
        variant === MESSAGE_VARIANTS.TEMPLATE)
        ? { color: colors.text }
        : {}),
    };

    const styles = StyleSheet.create({
      text: {
        fontSize: 16,
        letterSpacing: 0.32,
        lineHeight: 22,
        ...textStyle,
      },
      strong: {
        fontFamily: 'Inter-600-20',
        fontWeight: '600',
      },
      em: {
        fontStyle: 'italic',
      },
      paragraph: {
        marginTop: 0,
        marginBottom: 0,
        fontFamily: 'Inter-400-20',
      },
      bullet_list: {
        minWidth: 200,
      },
      ordered_list: {
        minWidth: 200,
      },
      list_item: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        ...textStyle,
      },
      bullet_list_icon: {
        marginLeft: 0,
        marginRight: 8,
        fontWeight: '900',
        ...textStyle,
      },
      ordered_list_icon: {
        marginLeft: 0,
        marginRight: 8,
        fontWeight: '900',
        ...textStyle,
      },
    });
    
    return (
      <Markdown
        mergeStyle
        markdownit={MarkdownIt({
          linkify: true,
          typographer: true,
        })}
        onLinkPress={handleURL}
        style={styles}>
        {messageContent}
      </Markdown>
    );
  } catch (error) {
    console.error('[MarkdownBubble] Render error:', error);
    return <Text>{props?.messageContent || ''}</Text>;
  }
};
