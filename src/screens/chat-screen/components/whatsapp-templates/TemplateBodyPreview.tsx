import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { buildPreviewSegments } from '@/utils/messageTemplateUtils';
import { expandTabs } from '@/utils/expandTabs';

type TemplateBodyPreviewProps = {
  body: string;
  values: Record<string, string>;
};

const TemplateBodyPreview = ({ body, values }: TemplateBodyPreviewProps) => {
  // Segments render as one run of text, so each tab is expanded from the
  // column the preceding segments end on.
  const segments = useMemo(() => {
    let rawPrefix = '';
    return buildPreviewSegments(body, values).map(segment => {
      const expandedPrefix = expandTabs(rawPrefix);
      rawPrefix += segment.text;
      return { ...segment, text: expandTabs(rawPrefix).slice(expandedPrefix.length) };
    });
  }, [body, values]);

  return (
    <Animated.Text
      style={tailwind.style(
        'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
      )}>
      {segments.map((segment, index) => (
        <Animated.Text
          key={`${index}-${segment.text}`}
          style={tailwind.style(segment.filled ? 'font-inter-medium-24' : 'font-inter-420-20')}>
          {segment.text}
        </Animated.Text>
      ))}
    </Animated.Text>
  );
};

export default TemplateBodyPreview;
