import React from 'react';
import { Text, type TextStyle, type StyleProp } from 'react-native';
import { highlightText } from '@/utils/highlightText';
import { tailwind } from '@/theme';
import { expandTabs } from '@/utils/expandTabs';
import { IOS_DESIGN } from '@/utils';

// iOS marks matches with weight only, like system search; Android keeps the blue tint.
const HIGHLIGHT_STYLE = tailwind.style(
  IOS_DESIGN ? 'font-inter-semibold-20 text-gray-950' : 'font-inter-medium-24 text-blue-800',
);

type HighlightedTextProps = {
  text: string;
  searchQuery: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export const HighlightedText = ({
  text: rawText,
  searchQuery,
  style,
  numberOfLines,
}: HighlightedTextProps) => {
  if (!rawText) return null;
  const text = expandTabs(rawText);

  const hasQuery = searchQuery?.trim();
  if (!hasQuery) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  const segments = highlightText(text, searchQuery);
  const validSegments = segments.filter(s => s.text?.length > 0);
  const hasHighlighted = validSegments.some(s => s.isHighlight);

  if (!hasHighlighted || validSegments.length === 0) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {validSegments.map((segment, index) => (
        <Text key={index} style={segment.isHighlight ? HIGHLIGHT_STYLE : undefined}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
};
