import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { tailwind } from '@/theme';

// Check if running in Expo Go
const isExpoGo = Constants?.appOwnership === 'expo';

// Mock LightBox for Expo Go
const MockLightBox: any = ({ children }: any) => <View>{children}</View>;

let LightBox: any = MockLightBox;
if (!isExpoGo) {
  try {
    LightBox = require('@alantoa/lightbox').LightBox;
  } catch (e) {
    console.warn('@alantoa/lightbox not available');
    LightBox = MockLightBox;
  }
}

// Mock type
type LightBoxProps = any;

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
      tapToClose={true}>
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
