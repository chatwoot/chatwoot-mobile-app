import { useTailwind, ThemeTailwind } from '@/theme/useTailwind';
import React from 'react';
import { StyleSheet, Platform, I18nManager, Text } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { openURL } from '@/utils/urlUtils';
import { expandTabs } from '@/utils/expandTabs';
import { isRTLText } from '@/utils/rtlUtils';

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

// Explicit break rules avoid Android newline layout collapse issues inside nested text
const markdownRules = {
  softbreak: (
    node: { key: string },
    _children: React.ReactNode,
    _parent: unknown,
    styles: Record<string, unknown>,
  ) => (
    <Text key={node.key} style={styles.softbreak as StyleSheet.NamedStyles<unknown>}>
      {'\n'}
    </Text>
  ),
  hardbreak: (
    node: { key: string },
    _children: React.ReactNode,
    _parent: unknown,
    styles: Record<string, unknown>,
  ) => (
    <Text key={node.key} style={styles.hardbreak as StyleSheet.NamedStyles<unknown>}>
      {'\n'}
    </Text>
  ),
};

const buildStyles = (variant: string, tailwind: ThemeTailwind, isRtl: boolean) => {
  const textStyle = tailwind.style(variantTextMap[variant]);
  const writingDirection = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' : 'left';
  // On Android, non-zero letterSpacing breaks cursive Arabic/RTL glyph shaping and ligatures,
  // which causes multiline text to collapse or render blank in native text measurement.
  const letterSpacing = isRtl && Platform.OS === 'android' ? 0 : 0.32;

  return StyleSheet.create({
    body: {
      rowGap: 12,
      fontSize: 16,
      lineHeight: 22,
      writingDirection,
      textAlign,
      ...textStyle,
    },
    text: {
      fontSize: 16,
      letterSpacing,
      lineHeight: 22,
      writingDirection,
      textAlign,
      ...textStyle,
    },
    textgroup: {
      fontSize: 16,
      letterSpacing,
      lineHeight: 22,
      writingDirection,
      textAlign,
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
      flexDirection: isRtl ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      justifyContent: isRtl ? 'flex-end' : 'flex-start',
      ...appFont('Inter-400-20'),
    },
    hardbreak: {
      width: undefined,
      height: undefined,
      fontSize: 16,
      lineHeight: 22,
      writingDirection,
      textAlign,
      ...textStyle,
    },
    softbreak: {
      fontSize: 16,
      lineHeight: 22,
      writingDirection,
      textAlign,
      ...textStyle,
    },
    bullet_list: {
      minWidth: 200,
    },
    ordered_list: {
      minWidth: 200,
    },
    list_item: {
      flexDirection: isRtl ? 'row-reverse' : 'row',
      justifyContent: isRtl ? 'flex-end' : 'flex-start',
      alignItems: 'center',
      ...textStyle,
    },
    bullet_list_icon: {
      marginLeft: isRtl ? 8 : 0,
      marginRight: isRtl ? 0 : 8,
      fontWeight: '900',
      ...textStyle,
    },
    ordered_list_icon: {
      marginLeft: isRtl ? 8 : 0,
      marginRight: isRtl ? 0 : 8,
      fontWeight: '900',
      ...textStyle,
    },
  });
};

// Markdown compares its props by identity, and on a miss it re-tokenises the
// message and rebuilds the Text tree beneath it. A fresh tree is a new
// attributed string on the native side, which iOS lays out again on the main
// thread. Styles are built once per variant and direction so a re-render of the surrounding
// row does not invalidate the whole tree.
const stylesByVariant = new Map<string, ReturnType<typeof buildStyles>>();

const getStyles = (variant: string, tailwind: ThemeTailwind, isRtl: boolean) => {
  const cacheKey = `${tailwind.isDark}:${variant}:${isRtl}`;
  const cachedStyles = stylesByVariant.get(cacheKey);
  if (cachedStyles) {
    return cachedStyles;
  }

  const styles = buildStyles(variant, tailwind, isRtl);
  stylesByVariant.set(cacheKey, styles);
  return styles;
};

export const MarkdownBubble = React.memo((props: MarkdownBubbleProps) => {
  const tailwind = useTailwind();
  const { variant } = props;
  const text = expandTabs(props.messageContent);
  const isRtl = isRTLText(props.messageContent) || Boolean(I18nManager?.isRTL);

  return (
    <Markdown
      mergeStyle
      markdownit={markdownItInstance}
      onLinkPress={handleURL}
      rules={markdownRules}
      style={getStyles(variant, tailwind, isRtl)}>
      {text}
    </Markdown>
  );
});

MarkdownBubble.displayName = 'MarkdownBubble';
