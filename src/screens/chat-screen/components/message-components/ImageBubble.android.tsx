import React from 'react';
import Animated from 'react-native-reanimated';
import { LightBox, LightBoxProps } from '@alantoa/lightbox';
import { Image } from 'expo-image';
import { tailwind } from '@/theme';

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

type ImageCellProps = {
  imageSrc: string;
};

type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> &
  Pick<LightBoxProps, 'width' | 'height'>;

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, height: lightboxH, width: lightboxW } = props;

  return (
    <LightBox
      width={lightboxW}
      height={lightboxH}
      imgLayout={{ width: lightboxW, height: lightboxH }}
      tapToClose={true}
    >
      <AnimatedExpoImage
        source={{ uri: imageSrc }}
        contentFit="cover"
        style={[tailwind.style('h-full w-full bg-gray-100 overflow-hidden')]}
      />
    </LightBox>
  );
};

export const ImageBubble = (props: ImageCellProps) => {
  const { imageSrc } = props;

  return (
    <React.Fragment>
      <ImageBubbleContainer {...{ imageSrc }} width={300} height={215} />
    </React.Fragment>
  );
};
