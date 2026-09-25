import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { openURL } from '@/utils/urlUtils';
import {
  CHUNKS_PER_REVEAL,
  MarkdownChunk,
  buildPreview,
  isLongMessage,
  splitIntoChunks,
} from '@/utils/markdownChunkUtils';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { MESSAGE_VARIANTS } from '@/constants';

// Shared parser instance; the options are static.
const markdownItInstance = MarkdownIt({ linkify: true, typographer: true, breaks: true });

type MarkdownBubbleProps = {
  messageContent: string;
  variant: string;
  /**
   * Quoted replies are fixed-height previews with nowhere to put a toggle, so
   * they take a truncated message instead of an expandable one.
   */
  expandable?: boolean;
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

const BLOCK_GAP = 12;

const handleURL = (url: string) => {
  openURL({ URL: url });
  return true;
};

const buildStyles = (variant: string) => {
  const textStyle = tailwind.style(variantTextMap[variant]);

  return {
    markdown: StyleSheet.create({
      body: {
        rowGap: BLOCK_GAP,
      },
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
    }),
    chrome: StyleSheet.create({
      // The row gap that spaces markdown blocks only reaches inside one chunk,
      // so a seam that fell on a blank line carries the gap itself.
      seam: {
        marginTop: BLOCK_GAP,
      },
      toggle: {
        ...tailwind.style(
          'text-xs font-inter-420-20 tracking-[0.32px] pt-1',
          variant === MESSAGE_VARIANTS.USER ? 'text-blue-200' : 'text-blue-700',
        ),
      },
    }),
  };
};

// Markdown compares its props by identity, and on a miss it re-tokenises the
// message and rebuilds the Text tree beneath it. A fresh tree is a new
// attributed string on the native side, which iOS lays out again on the main
// thread. Styles are built once per variant so a re-render of the surrounding
// row does not invalidate the whole tree.
const stylesByVariant = new Map<string, ReturnType<typeof buildStyles>>();

const getStyles = (variant: string) => {
  const cachedStyles = stylesByVariant.get(variant);
  if (cachedStyles) {
    return cachedStyles;
  }

  const styles = buildStyles(variant);
  stylesByVariant.set(variant, styles);
  return styles;
};

const NO_CHUNKS: MarkdownChunk[] = [];

export const MarkdownBubble = React.memo((props: MarkdownBubbleProps) => {
  const { messageContent, variant, expandable = true } = props;

  const styles = getStyles(variant);

  // A message long enough to collapse is also long enough that iOS cannot lay
  // it out as one paragraph within a frame.
  const isLong = useMemo(() => isLongMessage(messageContent), [messageContent]);

  // `chunks: 0` keeps the message collapsed; each tap reveals another batch.
  // FlashList recycles rows, so the content the count belongs to is held
  // alongside it and a recycled row starts collapsed again.
  const [expansion, setExpansion] = useState({ content: messageContent, chunks: 0 });

  if (expansion.content !== messageContent) {
    setExpansion({ content: messageContent, chunks: 0 });
  }

  const revealedChunks = expansion.content === messageContent ? expansion.chunks : 0;
  const isCollapsed = revealedChunks === 0;

  // Splitting walks the whole message, so it waits until the first expansion
  // rather than running for every long row the list scrolls past.
  const chunks = useMemo(
    () => (isCollapsed ? NO_CHUNKS : splitIntoChunks(messageContent)),
    [isCollapsed, messageContent],
  );

  const totalChunks = chunks.length;

  const handleToggle = useCallback(() => {
    setExpansion(current => {
      const revealed = current.content === messageContent ? current.chunks : 0;

      if (revealed === 0) {
        return { content: messageContent, chunks: CHUNKS_PER_REVEAL };
      }

      if (revealed < totalChunks) {
        return { content: messageContent, chunks: revealed + CHUNKS_PER_REVEAL };
      }

      return { content: messageContent, chunks: 0 };
    });
  }, [messageContent, totalChunks]);

  const renderMarkdown = (content: string) => (
    <Markdown
      mergeStyle
      markdownit={markdownItInstance}
      onLinkPress={handleURL}
      style={styles.markdown}>
      {content}
    </Markdown>
  );

  // Ordinary messages keep the plain single-paragraph path.
  if (!isLong) {
    return renderMarkdown(messageContent);
  }

  if (!expandable) {
    return renderMarkdown(buildPreview(messageContent));
  }

  const hasMore = isCollapsed || revealedChunks < totalChunks;

  return (
    <View>
      {isCollapsed
        ? renderMarkdown(buildPreview(messageContent))
        : chunks.slice(0, revealedChunks).map(chunk => (
            <View key={chunk.key} style={chunk.followsBlankLine ? styles.chrome.seam : null}>
              {renderMarkdown(chunk.content)}
            </View>
          ))}
      <Pressable onPress={handleToggle} hitSlop={8}>
        <Text style={styles.chrome.toggle}>
          {hasMore ? i18n.t('CONVERSATION.SHOW_MORE') : i18n.t('CONVERSATION.SHOW_LESS')}
        </Text>
      </Pressable>
    </View>
  );
});

MarkdownBubble.displayName = 'MarkdownBubble';
