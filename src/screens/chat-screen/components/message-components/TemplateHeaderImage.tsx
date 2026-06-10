import React, { useState } from 'react';
import { Image } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { MessageAdditionalAttributes } from '@/types/Message';

type TemplateHeaderImageProps = {
  additionalAttributes?: MessageAdditionalAttributes | null;
};

export const TemplateHeaderImage = ({ additionalAttributes }: TemplateHeaderImageProps) => {
  const header = additionalAttributes?.templateParams?.processedParams?.header;
  const url = header?.mediaUrl?.trim();
  const isImage = !header?.mediaType || header.mediaType.toLowerCase() === 'image';
  const [errored, setErrored] = useState(false);

  if (!url || !isImage || errored) return null;

  return (
    <Animated.View
      style={tailwind.style('-mx-3 -mt-2 mb-2 aspect-video bg-blackA-A3 overflow-hidden')}>
      <Image
        source={{ uri: url }}
        resizeMode="cover"
        onError={() => setErrored(true)}
        style={tailwind.style('w-full h-full')}
      />
    </Animated.View>
  );
};

export default TemplateHeaderImage;
