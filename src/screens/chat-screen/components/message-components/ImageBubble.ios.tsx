import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { tailwind } from '@/theme';

// Check if running in Expo Go - Galeria native module not available there
const isExpoGo = Constants?.appOwnership === 'expo';

// Mock Galeria for Expo Go
const MockGaleria: any = ({ children }: any) => <View>{children}</View>;
MockGaleria.Image = ({ children }: any) => <>{children}</>;

// Only load real Galeria in production builds
let Galeria: any = MockGaleria;
if (!isExpoGo) {
  try {
    Galeria = require('@nandorojo/galeria').Galeria;
  } catch (e) {
    console.warn('@nandorojo/galeria not available');
    Galeria = MockGaleria;
  }
}

type ImageCellProps = {
  imageSrc: string;
};

type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> & {
  width?: number;
  height?: number;
};

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, height = 215, width = 400 } = props;

  return (
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="cover"
          style={[
            tailwind.style('h-full w-full bg-gray-100 overflow-hidden'),
            { width: width, height: height },
          ]}
        />
      </Galeria.Image>
    </Galeria>
  );
};

export const ImageBubble = (props: ImageCellProps) => {
  const { imageSrc } = props;

  return (
    <React.Fragment>
      <ImageBubbleContainer {...{ imageSrc }} />
    </React.Fragment>
  );
};
