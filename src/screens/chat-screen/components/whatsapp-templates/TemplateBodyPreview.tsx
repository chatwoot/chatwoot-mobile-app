import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { buildPreviewSegments } from '@/utils/messageTemplateUtils';

type TemplateBodyPreviewProps = {
  body: string;
  values: Record<string, string>;
};

const TemplateBodyPreview = ({ body, values }: TemplateBodyPreviewProps) => {
  const segments = useMemo(() => buildPreviewSegments(body, values), [body, values]);

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
