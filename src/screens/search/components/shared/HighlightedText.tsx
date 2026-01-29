import React from 'react';
import { Text } from 'react-native';
import { highlightText } from '@/utils/highlightText';
import { tailwind } from '@/theme';

type HighlightedTextProps = {
  text: string;
  searchQuery: string;
  style?: any;
  numberOfLines?: number;
};

export const HighlightedText = ({
  text,
  searchQuery,
  style,
  numberOfLines,
}: HighlightedTextProps) => {
  if (!text) return null;

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
        <Text
          key={index}
          style={segment.isHighlight ? tailwind.style('font-inter-medium-24 text-blue-800') : undefined}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
};
