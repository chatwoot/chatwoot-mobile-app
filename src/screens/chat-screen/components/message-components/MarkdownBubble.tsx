import { useTailwind, ThemeTailwind } from '@/theme/useTailwind';
import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { openURL } from '@/utils/urlUtils';
import { expandTabs } from '@/utils/expandTabs';

import { MESSAGE_VARIANTS } from '@/constants';
import { appFont } from '@/theme/appFont';

// Shared parser instance; the options are static.
const markdownItInstance = MarkdownIt({ linkify: true, typographer: true, breaks: true });

type MarkdownBubbleProps = {
  messageContent: string;
  variant: string;
};

const variantTextMap = {
  [MESSAGE_VARIANTS.AGENT]: 'text-gray-950',
  [MESSAGE_VARIANTS.USER]: 'text-white',
  [MESSAGE_VARIANTS.BOT]: 'text-gray-950',
  [MESSAGE_VARIANTS.TEMPLATE]: 'text-gray-950',
  [MESSAGE_VARIANTS.ERROR]: 'text-white',
  [MESSAGE_VARIANTS.PRIVATE]: 'text-amber-950 font-inter-medium-24',
  [MESSAGE_VARIANTS.EMAIL]: 'text-gray-950',
};

const handleURL = (url: string) => {
  openURL({ URL: url });
  return true;
};

const buildStyles = (variant: string, tailwind: ThemeTailwind) => {
  const textStyle = tailwind.style(variantTextMap[variant]);

  return StyleSheet.create({
    body: {
      rowGap: 12,
    },
    text: {
      fontSize: 16,
      letterSpacing: 0.32,
      lineHeight: 22,
      ...textStyle,
    },
    strong: {
      ...appFont('Inter-600-20'),
      fontWeight: '600',
    },
    em: {
      fontStyle: 'italic',
    },
    blockquote: {
      backgroundColor: tailwind.color('bg-blackA-A3'),
      borderColor: tailwind.color('text-blackA-A6'),
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
      ...appFont('Inter-400-20'),
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
};

// Markdown compares its props by identity, and on a miss it re-tokenises the
// message and rebuilds the Text tree beneath it. A fresh tree is a new
// attributed string on the native side, which iOS lays out again on the main
// thread. Styles are built once per variant so a re-render of the surrounding
// row does not invalidate the whole tree.
const stylesByVariant = new Map<string, ReturnType<typeof buildStyles>>();

const getStyles = (variant: string, tailwind: ThemeTailwind) => {
  const cacheKey = `${tailwind.isDark}:${variant}`;
  const cachedStyles = stylesByVariant.get(cacheKey);
  if (cachedStyles) {
    return cachedStyles;
  }

  const styles = buildStyles(variant, tailwind);
  stylesByVariant.set(cacheKey, styles);
  return styles;
};

export const MarkdownBubble = React.memo((props: MarkdownBubbleProps) => {
  const tailwind = useTailwind();
  const { variant } = props;
  const text = expandTabs(props.messageContent);

  return (
    <Markdown
      mergeStyle
      markdownit={markdownItInstance}
      onLinkPress={handleURL}
      style={getStyles(variant, tailwind)}>
      {text}
    </Markdown>
  );
});

MarkdownBubble.displayName = 'MarkdownBubble';
